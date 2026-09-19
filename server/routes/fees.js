import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createFee, deleteFee, listFees, updateFee } from '../services/feeService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'ACCOUNTANT']

router.get('/', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Fees retrieved successfully', ...(await listFees(req.query)) }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.name?.trim()) errors.push({ field: 'name', message: 'Fee name is required' }); if (!Number(req.body.amount) || Number(req.body.amount) <= 0) errors.push({ field: 'amount', message: 'A valid amount is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createFee(req.body); await recordAudit({ req, action: 'created', resource: 'Fee', resourceId: item._id }); res.status(201).json({ success: true, message: 'Fee created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Fee updated successfully', data: await updateFee(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteFee(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Fee', resourceId: req.params.id }); res.json({ success: true, message: 'Fee deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
