import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createTerm, deleteTerm, listTerms, updateTerm } from '../services/termService.js'

const router = Router()
router.use(authenticate)
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Terms retrieved successfully', ...(await listTerms(req.query)) }) } catch (error) { next(error) } })
router.post('/', authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.name?.trim()) errors.push({ field: 'name', message: 'Term name is required' }); if (!req.body.session) errors.push({ field: 'session', message: 'Session is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createTerm(req.body); await recordAudit({ req, action: 'created', resource: 'Term', resourceId: item._id }); res.status(201).json({ success: true, message: 'Term created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Term updated successfully', data: await updateTerm(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteTerm(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Term', resourceId: req.params.id }); res.json({ success: true, message: 'Term deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
