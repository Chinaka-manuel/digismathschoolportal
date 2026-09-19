import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createGalleryItem, deleteGalleryItem, listGallery, updateGalleryItem } from '../services/galleryService.js'

const router = Router()
const managers = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']

router.get('/', async (req, res, next) => { try { const isManager = req.user && managers.includes(req.user.role); const data = await listGallery({ ...req.query, ...(isManager ? {} : { isPublished: true }) }); res.json({ success: true, message: 'Gallery retrieved successfully', ...data }) } catch (error) { next(error) } })
router.post('/', authenticate, authorize(...managers), async (req, res, next) => { try { if (!req.body.mediaUrl) return res.status(422).json({ success: false, message: 'Media URL is required', errors: [] }); const item = await createGalleryItem(req.body); await recordAudit({ req, action: 'created', resource: 'Gallery', resourceId: item._id }); res.status(201).json({ success: true, message: 'Gallery item created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/:id', authenticate, authorize(...managers), async (req, res, next) => { try { res.json({ success: true, message: 'Gallery item updated successfully', data: await updateGalleryItem(req.params.id, req.body) }) } catch (error) { next(error) } })
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => { try { await deleteGalleryItem(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'Gallery', resourceId: req.params.id }); res.json({ success: true, message: 'Gallery item deleted successfully', data: null }) } catch (error) { next(error) } })

export default router
