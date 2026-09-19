import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createClass, deleteClass, listClasses, updateClass } from '../services/classService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Classes retrieved successfully', ...(await listClasses(req.query)) }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.name?.trim()) errors.push({ field: 'name', message: 'Class name is required' }); if (!req.body.level) errors.push({ field: 'level', message: 'Class level is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createClass(req.body); await recordAudit({ req, action: 'created', resource: 'Class', resourceId: item._id }); res.status(201).json({ success: true, message: 'Class created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Class updated successfully', data: await updateClass(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteClass(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Class', resourceId: req.params.id }); res.json({ success: true, message: 'Class deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
