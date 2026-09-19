import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createAssignment, deleteAssignment, listAssignments, updateAssignment } from '../services/assignmentService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'STAFF']

router.get('/', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Assignments retrieved successfully', ...(await listAssignments(req.query)) }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.title?.trim()) errors.push({ field: 'title', message: 'Assignment title is required' }); if (!req.body.classRef) errors.push({ field: 'classRef', message: 'Class is required' }); if (!req.body.subject) errors.push({ field: 'subject', message: 'Subject is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createAssignment({ ...req.body, createdBy: req.user.sub }); await recordAudit({ req, action: 'created', resource: 'Assignment', resourceId: item._id }); res.status(201).json({ success: true, message: 'Assignment created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Assignment updated successfully', data: await updateAssignment(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL'), async (req, res, next) => { try { await deleteAssignment(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Assignment', resourceId: req.params.id }); res.json({ success: true, message: 'Assignment deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
