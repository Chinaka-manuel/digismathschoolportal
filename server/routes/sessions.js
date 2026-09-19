import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createSession, deleteSession, listSessions, updateSession } from '../services/sessionService.js'

const router = Router()
router.use(authenticate)
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Academic sessions retrieved successfully', ...(await listSessions(req.query)) }) } catch (error) { next(error) } })
router.post('/', authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.name?.trim()) errors.push({ field: 'name', message: 'Session name is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createSession(req.body); await recordAudit({ req, action: 'created', resource: 'AcademicSession', resourceId: item._id }); res.status(201).json({ success: true, message: 'Academic session created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Academic session updated successfully', data: await updateSession(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteSession(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'AcademicSession', resourceId: req.params.id }); res.json({ success: true, message: 'Academic session deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
