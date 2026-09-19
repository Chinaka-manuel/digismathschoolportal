import { Badge, statusTone } from '../../components/ui'
import { resourceServices } from '../../services/resources'
import { ACADEMIC_MANAGERS, FINANCE_MANAGERS, USER_ADMINS } from '../../constants/roles'
import { formatCurrency, formatDate } from '../../utils/format'
import type { ListParams, Paginated } from '../../services/resources'
import type { ResourceConfig } from './ResourceManager'

type Row = Record<string, any>

const yesNo = (value: unknown) => <Badge tone={value ? 'success' : 'neutral'}>{value ? 'Yes' : 'No'}</Badge>
const named = (value: unknown) => (value && typeof value === 'object' ? (value as Row).name ?? '--' : '--')

/** Turns a list endpoint into <option> data for the reference selects. */
const optionsFrom = (service: { list: (params: ListParams) => Promise<Paginated<Row>> }, label = 'name') =>
  async () => {
    const { data } = await service.list({ limit: 100 })
    return data.map((item) => ({ value: String(item._id), label: String(item[label] ?? item.name ?? item.title ?? item._id) }))
  }

const academicSources = {
  sessions: optionsFrom(resourceServices.sessions),
  terms: optionsFrom(resourceServices.terms),
  classes: optionsFrom(resourceServices.classes),
  departments: optionsFrom(resourceServices.departments),
  subjects: optionsFrom(resourceServices.subjects),
}

export const resourceConfigs: Record<string, ResourceConfig<Row>> = {
  sessions: {
    key: 'sessions',
    title: 'Academic sessions',
    singular: 'Session',
    description: 'The academic years results, fees and classes are grouped under.',
    service: resourceServices.sessions,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'name', header: 'Session' },
      { key: 'startYear', header: 'Start year' },
      { key: 'endYear', header: 'End year', hideOnMobile: true },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Session name', required: true, placeholder: '2026/2027' },
      { name: 'startYear', label: 'Start year', type: 'number', required: true, min: 2000, max: 2100 },
      { name: 'endYear', label: 'End year', type: 'number', required: true, min: 2000, max: 2100 },
      { name: 'isActive', label: 'Set as the current session', type: 'checkbox' },
    ],
  },

  terms: {
    key: 'terms',
    title: 'Terms',
    singular: 'Term',
    description: 'Terms within an academic session.',
    service: resourceServices.terms,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: { sessions: academicSources.sessions },
    columns: [
      { key: 'name', header: 'Term' },
      { key: 'session', header: 'Session', render: (row) => named(row.session) },
      { key: 'startDate', header: 'Starts', hideOnMobile: true, render: (row) => formatDate(row.startDate) },
      { key: 'endDate', header: 'Ends', hideOnMobile: true, render: (row) => formatDate(row.endDate) },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Term name', required: true, placeholder: 'First Term' },
      { name: 'session', label: 'Session', type: 'select', optionsFrom: 'sessions', required: true },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'isActive', label: 'Set as the current term', type: 'checkbox' },
    ],
  },

  departments: {
    key: 'departments',
    title: 'Departments',
    singular: 'Department',
    description: 'Academic departments that subjects and staff belong to.',
    service: resourceServices.departments,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'name', header: 'Department' },
      { key: 'description', header: 'Description', hideOnMobile: true },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Department name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },

  subjects: {
    key: 'subjects',
    title: 'Subjects',
    singular: 'Subject',
    description: 'The subjects taught across the school.',
    service: resourceServices.subjects,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: { departments: academicSources.departments },
    columns: [
      { key: 'name', header: 'Subject' },
      { key: 'code', header: 'Code' },
      { key: 'department', header: 'Department', hideOnMobile: true, render: (row) => named(row.department) },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Subject name', required: true },
      { name: 'code', label: 'Subject code', required: true, placeholder: 'MTH', hint: 'Short code shown on result sheets.' },
      { name: 'department', label: 'Department', type: 'select', optionsFrom: 'departments' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },

  classes: {
    key: 'classes',
    title: 'Classes',
    singular: 'Class',
    description: 'Class groups students are enrolled into.',
    service: resourceServices.classes,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: { sessions: academicSources.sessions },
    columns: [
      { key: 'name', header: 'Class' },
      { key: 'level', header: 'Level' },
      { key: 'session', header: 'Session', hideOnMobile: true, render: (row) => named(row.session) },
      { key: 'capacity', header: 'Capacity', hideOnMobile: true },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Class name', required: true, placeholder: 'JSS 1A' },
      {
        name: 'level', label: 'Level', type: 'select', required: true,
        options: ['Nursery', 'Primary', 'Junior Secondary', 'Senior Secondary'].map((level) => ({ value: level, label: level })),
      },
      { name: 'session', label: 'Session', type: 'select', optionsFrom: 'sessions' },
      { name: 'capacity', label: 'Capacity', type: 'number', min: 1, max: 200 },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },

  fees: {
    key: 'fees',
    title: 'Fees',
    singular: 'Fee',
    description: 'Fee items charged per class, session and term.',
    service: resourceServices.fees,
    writeRoles: FINANCE_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: { sessions: academicSources.sessions, terms: academicSources.terms, classes: academicSources.classes },
    columns: [
      { key: 'name', header: 'Fee' },
      { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
      { key: 'classRef', header: 'Class', hideOnMobile: true, render: (row) => named(row.classRef) },
      { key: 'session', header: 'Session', hideOnMobile: true, render: (row) => named(row.session) },
      { key: 'isActive', header: 'Active', render: (row) => yesNo(row.isActive) },
    ],
    fields: [
      { name: 'name', label: 'Fee name', required: true, placeholder: 'Tuition' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01 },
      { name: 'classRef', label: 'Class', type: 'select', optionsFrom: 'classes' },
      { name: 'session', label: 'Session', type: 'select', optionsFrom: 'sessions' },
      { name: 'term', label: 'Term', type: 'select', optionsFrom: 'terms' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },

  invoices: {
    key: 'invoices',
    title: 'Invoices',
    singular: 'Invoice',
    description: 'Invoices raised against students.',
    service: resourceServices.invoices,
    writeRoles: FINANCE_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: { fees: optionsFrom(resourceServices.fees) },
    columns: [
      { key: 'invoiceNumber', header: 'Invoice' },
      { key: 'student', header: 'Student', render: (row) => (row.student?.fullName ?? row.student?.studentId ?? '--') },
      { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount, row.currency) },
      { key: 'dueDate', header: 'Due', hideOnMobile: true, render: (row) => formatDate(row.dueDate) },
      { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge> },
    ],
    fields: [
      { name: 'student', label: 'Student ID', required: true, hint: 'The student record identifier this invoice belongs to.' },
      { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: 0.01 },
      { name: 'fee', label: 'Fee item', type: 'select', optionsFrom: 'fees' },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      {
        name: 'status', label: 'Status', type: 'select',
        options: ['pending', 'paid', 'overdue', 'cancelled'].map((value) => ({ value, label: value })),
      },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },

  downloads: {
    key: 'downloads',
    title: 'Downloads',
    singular: 'Download',
    description: 'Documents published to the public downloads page.',
    service: resourceServices.downloads,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category', hideOnMobile: true },
      { key: 'mimeType', header: 'Type', hideOnMobile: true },
      { key: 'isPublic', header: 'Public', render: (row) => yesNo(row.isPublic) },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'category', label: 'Category', placeholder: 'Prospectus' },
      { name: 'fileUrl', label: 'File URL', required: true, hint: 'Upload the file first, then paste its URL here.' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isPublic', label: 'Visible to the public', type: 'checkbox' },
    ],
  },

  gallery: {
    key: 'gallery',
    title: 'Gallery',
    singular: 'Gallery item',
    description: 'Photos and videos shown in the public gallery.',
    service: resourceServices.gallery,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'title', header: 'Title' },
      { key: 'kind', header: 'Kind' },
      { key: 'category', header: 'Category', hideOnMobile: true },
      { key: 'isPublished', header: 'Published', render: (row) => yesNo(row.isPublished) },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'kind', label: 'Kind', type: 'select', required: true, options: [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }] },
      { name: 'mediaUrl', label: 'Media URL', required: true },
      { name: 'category', label: 'Category', placeholder: 'Sports day' },
      { name: 'isPublished', label: 'Published', type: 'checkbox' },
    ],
  },

  news: {
    key: 'news',
    title: 'News articles',
    singular: 'Article',
    description: 'Articles shown on the public news page.',
    service: resourceServices.news,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'title', header: 'Title' },
      { key: 'category', header: 'Category', hideOnMobile: true },
      { key: 'publishedAt', header: 'Published', hideOnMobile: true, render: (row) => formatDate(row.publishedAt) },
      { key: 'status', header: 'Status', render: (row) => <Badge tone={statusTone(row.status)}>{row.status ?? 'draft'}</Badge> },
    ],
    fields: [
      { name: 'title', label: 'Headline', required: true },
      { name: 'category', label: 'Category', placeholder: 'Announcements' },
      { name: 'excerpt', label: 'Summary', type: 'textarea' },
      { name: 'content', label: 'Article body', type: 'textarea', required: true },
      { name: 'coverImageUrl', label: 'Cover image URL' },
      { name: 'publishedAt', label: 'Publish date', type: 'date' },
      { name: 'isPublished', label: 'Published', type: 'checkbox' },
    ],
  },

  announcements: {
    key: 'announcements',
    title: 'Announcements',
    singular: 'Announcement',
    description: 'Notices shown in the portal and on the home page.',
    service: resourceServices.announcements,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    columns: [
      { key: 'title', header: 'Title' },
      { key: 'audience', header: 'Audience', hideOnMobile: true },
      { key: 'createdAt', header: 'Created', hideOnMobile: true, render: (row) => formatDate(row.createdAt) },
      { key: 'isPublished', header: 'Published', render: (row) => yesNo(row.isPublished) },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'body', label: 'Message', type: 'textarea', required: true },
      {
        name: 'audience', label: 'Audience', type: 'select',
        options: ['all', 'students', 'parents', 'staff'].map((value) => ({ value, label: value })),
      },
      { name: 'isPublished', label: 'Published', type: 'checkbox' },
    ],
  },

  assignments: {
    key: 'assignments',
    title: 'Assignments',
    singular: 'Assignment',
    description: 'Work set for a class in a given term.',
    service: resourceServices.assignments,
    writeRoles: ACADEMIC_MANAGERS,
    deleteRoles: USER_ADMINS,
    optionSources: academicSources,
    columns: [
      { key: 'title', header: 'Title' },
      { key: 'classRef', header: 'Class', render: (row) => named(row.classRef) },
      { key: 'subject', header: 'Subject', hideOnMobile: true, render: (row) => named(row.subject) },
      { key: 'dueDate', header: 'Due', render: (row) => formatDate(row.dueDate) },
      { key: 'isPublished', header: 'Published', render: (row) => yesNo(row.isPublished) },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'classRef', label: 'Class', type: 'select', optionsFrom: 'classes', required: true },
      { name: 'subject', label: 'Subject', type: 'select', optionsFrom: 'subjects', required: true },
      { name: 'session', label: 'Session', type: 'select', optionsFrom: 'sessions', required: true },
      { name: 'term', label: 'Term', type: 'select', optionsFrom: 'terms', required: true },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      { name: 'description', label: 'Instructions', type: 'textarea' },
      { name: 'isPublished', label: 'Published to students', type: 'checkbox' },
    ],
  },
}

export const resourceKeys = Object.keys(resourceConfigs)
