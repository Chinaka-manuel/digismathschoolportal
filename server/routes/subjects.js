import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createSubject, deleteSubject, listSubjects, updateSubject } from '../services/subjectService.js'

const router = Router()
router.use(authenticate)
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Subjects retrieved successfully', ...(await listSubjects(req.query)) }) } catch (error) { next(error) } })
router.post('/', authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.name?.trim()) errors.push({ field: 'name', message: 'Subject name is required' }); if (!req.body.code?.trim()) errors.push({ field: 'code', message: 'Subject code is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createSubject(req.body); await recordAudit({ req, action: 'created', resource: 'Subject', resourceId: item._id }); res.status(201).json({ success: true, message: 'Subject created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Subject updated successfully', data: await updateSubject(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteSubject(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Subject', resourceId: req.params.id }); res.json({ success: true, message: 'Subject deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
