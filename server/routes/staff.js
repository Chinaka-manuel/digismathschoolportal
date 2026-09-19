import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createStaff, listStaff, updateStaff } from '../services/staffService.js'

const router = Router(); const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']
router.use(authenticate, authorize(...managers))
router.get('/', async (req, res, next) => { try { res.json({ success: true, message: 'Staff retrieved successfully', ...(await listStaff(req.query)) }) } catch (error) { next(error) } })
router.post('/', async (req, res, next) => { try { const required = ['staffId', 'user', 'fullName']; const errors = required.filter((field) => !req.body[field]).map((field) => ({ field, message: `${field} is required` })); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createStaff(req.body); await recordAudit({ req, action: 'created', resource: 'Staff', resourceId: item.id }); res.status(201).json({ success: true, message: 'Staff created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', async (req, res, next) => { try { const item = await updateStaff(req.params.id, req.body); await recordAudit({ req, action: 'updated', resource: 'Staff', resourceId: item.id }); res.json({ success: true, message: 'Staff updated successfully', data: item }) } catch (error) { next(error) } })
export default router
