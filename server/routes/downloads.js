import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createDownload, deleteDownload, listDownloads, updateDownload } from '../services/downloadService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', async (req, res, next) => { try { const isManager = req.user && managers.includes(req.user.role); const data = await listDownloads({ ...req.query, ...(isManager ? {} : { isPublic: true }) }); res.json({ success: true, message: 'Downloads retrieved successfully', ...data }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { if (!req.body.title?.trim() || !req.body.fileUrl) return res.status(422).json({ success: false, message: 'Title and file URL are required', errors: [] }); const item = await createDownload(req.body); await recordAudit({ req, action: 'created', resource: 'Download', resourceId: item._id }); res.status(201).json({ success: true, message: 'Download created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Download updated successfully', data: await updateDownload(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteDownload(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Download', resourceId: req.params.id }); res.json({ success: true, message: 'Download deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
