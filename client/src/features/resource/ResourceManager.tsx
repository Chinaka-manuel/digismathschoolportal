import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, ConfirmDialog, DataTable, Field, Input, Modal, Pagination, Select, Textarea } from '../../components/ui'
import type { Column } from '../../components/ui'
import { getApiErrorMessage } from '../../api/errors'
import { useAuthStore } from '../../stores/authStore'
import { hasRole } from '../../constants/roles'
import { toInputDate } from '../../utils/format'
import type { ListParams, Paginated } from '../../services/resources'

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox'

export type ResourceField = {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  hint?: string
  placeholder?: string
  /** Static options, or a loader key resolved from `optionSources`. */
  options?: { value: string; label: string }[]
  optionsFrom?: string
  min?: number
  max?: number
  step?: number
}

export type ResourceConfig<T> = {
  key: string
  title: string
  description?: string
  singular: string
  columns: Column<T>[]
  fields: ResourceField[]
  service: {
    list: (params: ListParams) => Promise<Paginated<T>>
    create: (payload: Partial<T>) => Promise<T>
    update: (id: string, payload: Partial<T>) => Promise<T>
    remove: (id: string) => Promise<void>
  }
  /** Roles allowed to create/edit. Everyone who can open the page can read. */
  writeRoles: string[]
  deleteRoles?: string[]
  searchable?: boolean
  /** Named option loaders for select fields that reference other resources. */
  optionSources?: Record<string, () => Promise<{ value: string; label: string }[]>>
  /** Shapes the form values before they are sent to the API. */
  serialize?: (values: Record<string, unknown>) => Record<string, unknown>
}

type WithId = { _id?: string; id?: string }

/**
 * One screen for every resource that follows the server's standard CRUD shape.
 * Keeping this generic is what makes it practical to expose all of the managed
 * endpoints without writing (and then maintaining) 12 near-identical pages.
 */
export function ResourceManager<T extends WithId>({ config }: { config: ResourceConfig<T> }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<T | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<T | null>(null)

  const canWrite = hasRole(user?.role, config.writeRoles)
  const canDelete = hasRole(user?.role, config.deleteRoles ?? config.writeRoles)

  const listQuery = useQuery({
    queryKey: [config.key, page, search],
    queryFn: () => config.service.list({ page, limit: 20, search: search || undefined }),
  })

  const optionQueries = useQuery({
    queryKey: [config.key, 'options'],
    queryFn: async () => {
      const sources = config.optionSources ?? {}
      const entries = await Promise.all(
        Object.entries(sources).map(async ([name, load]) => {
          try { return [name, await load()] as const } catch { return [name, []] as const }
        }),
      )
      return Object.fromEntries(entries) as Record<string, { value: string; label: string }[]>
    },
    enabled: Boolean(config.optionSources && Object.keys(config.optionSources).length),
    staleTime: 5 * 60 * 1000,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [config.key] })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<T>) => config.service.create(payload),
    onSuccess: () => { toast.success(`${config.singular} created`); setCreating(false); invalidate() },
    onError: (error) => toast.error(getApiErrorMessage(error, `Could not create the ${config.singular.toLowerCase()}.`)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<T> }) => config.service.update(id, payload),
    onSuccess: () => { toast.success(`${config.singular} updated`); setEditing(null); invalidate() },
    onError: (error) => toast.error(getApiErrorMessage(error, `Could not update the ${config.singular.toLowerCase()}.`)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.service.remove(id),
    onSuccess: () => { toast.success(`${config.singular} deleted`); setDeleting(null); invalidate() },
    onError: (error) => toast.error(getApiErrorMessage(error, `Could not delete the ${config.singular.toLowerCase()}.`)),
  })

  const rows = listQuery.data?.data ?? []
  const pagination = listQuery.data?.pagination

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[#69736c]">Management</p>
          <h2 className="mt-1 font-display text-4xl">{config.title}</h2>
          {config.description && <p className="mt-2 max-w-xl text-sm text-[#69736c]">{config.description}</p>}
        </div>
        {canWrite && (
          <Button onClick={() => setCreating(true)} icon={<Plus size={15} />}>Add {config.singular.toLowerCase()}</Button>
        )}
      </div>

      {config.searchable !== false && (
        <div className="mb-5 max-w-sm">
          <label className="sr-only" htmlFor={`${config.key}-search`}>Search {config.title.toLowerCase()}</label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#69736c]" aria-hidden="true" />
            <Input
              id={`${config.key}-search`}
              className="pl-9"
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            />
          </div>
        </div>
      )}

      <DataTable<T>
        columns={config.columns}
        rows={rows}
        loading={listQuery.isLoading}
        error={listQuery.isError}
        onRetry={() => listQuery.refetch()}
        caption={config.title}
        emptyTitle={`No ${config.title.toLowerCase()} yet`}
        emptyMessage={canWrite ? `Add the first ${config.singular.toLowerCase()} to get started.` : undefined}
        emptyAction={canWrite ? <Button size="sm" onClick={() => setCreating(true)} icon={<Plus size={14} />}>Add {config.singular.toLowerCase()}</Button> : undefined}
        actions={canWrite ? (row) => (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(row)} aria-label={`Edit ${config.singular}`} icon={<Pencil size={15} />}>Edit</Button>
            {canDelete && (
              <Button variant="ghost" size="sm" onClick={() => setDeleting(row)} aria-label={`Delete ${config.singular}`} icon={<Trash2 size={15} />}>Delete</Button>
            )}
          </>
        ) : undefined}
      />

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={setPage} />
      )}

      {(creating || editing) && (
        <ResourceForm
          config={config}
          record={editing}
          options={optionQueries.data ?? {}}
          saving={createMutation.isPending || updateMutation.isPending}
          onClose={() => { setCreating(false); setEditing(null) }}
          onSubmit={(values) => {
            const payload = (config.serialize ? config.serialize(values) : values) as Partial<T>
            const id = editing?._id ?? editing?.id
            if (id) updateMutation.mutate({ id, payload })
            else createMutation.mutate(payload)
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => { const id = deleting?._id ?? deleting?.id; if (id) deleteMutation.mutate(id) }}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        message="This cannot be undone. Any records that reference it may be affected."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </>
  )
}

function ResourceForm<T extends WithId>({ config, record, options, saving, onClose, onSubmit }: {
  config: ResourceConfig<T>
  record: T | null
  options: Record<string, { value: string; label: string }[]>
  saving: boolean
  onClose: () => void
  onSubmit: (values: Record<string, unknown>) => void
}) {
  const defaults = useMemo(() => {
    const source = (record ?? {}) as Record<string, unknown>
    return Object.fromEntries(config.fields.map((field) => {
      const raw = source[field.name]
      if (field.type === 'date') return [field.name, toInputDate(raw as string)]
      if (field.type === 'checkbox') return [field.name, Boolean(raw)]
      // A populated reference comes back as an object; the form needs its id.
      if (raw && typeof raw === 'object' && '_id' in (raw as Record<string, unknown>)) {
        return [field.name, String((raw as Record<string, unknown>)._id)]
      }
      return [field.name, raw ?? '']
    }))
  }, [config.fields, record])

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: defaults })

  return (
    <Modal
      open
      onClose={onClose}
      title={record ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
      description={config.description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={`${config.key}-form`} loading={saving}>{record ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}</Button>
        </>
      }
    >
      <form id={`${config.key}-form`} className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
        {config.fields.map((field) => {
          const id = `${config.key}-${field.name}`
          const error = errors[field.name]?.message as string | undefined
          const rules = { required: field.required ? `${field.label} is required` : false }
          const wide = field.type === 'textarea'

          if (field.type === 'checkbox') {
            return (
              <div key={field.name} className="flex items-center gap-2 sm:col-span-2">
                <input id={id} type="checkbox" className="h-4 w-4" {...register(field.name)} />
                <label className="text-sm" htmlFor={id}>{field.label}</label>
              </div>
            )
          }

          const choices = field.options ?? (field.optionsFrom ? options[field.optionsFrom] ?? [] : [])

          return (
            <Field key={field.name} label={field.label} htmlFor={id} error={error} hint={field.hint} required={field.required} className={wide ? 'sm:col-span-2' : undefined}>
              {field.type === 'textarea' ? (
                <Textarea id={id} invalid={Boolean(error)} placeholder={field.placeholder} {...register(field.name, rules)} />
              ) : field.type === 'select' ? (
                <Select id={id} invalid={Boolean(error)} {...register(field.name, rules)}>
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
                </Select>
              ) : (
                <Input
                  id={id}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  invalid={Boolean(error)}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  {...register(field.name, { ...rules, valueAsNumber: field.type === 'number' })}
                />
              )}
            </Field>
          )
        })}
      </form>
    </Modal>
  )
}
