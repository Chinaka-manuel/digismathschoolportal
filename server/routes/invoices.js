import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createInvoice, deleteInvoice, listInvoices, updateInvoice } from '../services/invoiceService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT']

router.get('/', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Invoices retrieved successfully', ...(await listInvoices(req.query)) }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { const errors = []; if (!req.body.student) errors.push({ field: 'student', message: 'Student is required' }); if (!Number(req.body.amount) || Number(req.body.amount) <= 0) errors.push({ field: 'amount', message: 'A valid amount is required' }); if (errors.length) return res.status(422).json({ success: false, message: 'Validation failed', errors }); const item = await createInvoice(req.body); await recordAudit({ req, action: 'created', resource: 'Invoice', resourceId: item.invoiceNumber }); res.status(201).json({ success: true, message: 'Invoice created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Invoice updated successfully', data: await updateInvoice(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteInvoice(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Invoice', resourceId: req.params.id }); res.json({ success: true, message: 'Invoice deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
