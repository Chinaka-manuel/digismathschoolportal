import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { recordAudit } from '../services/auditService.js'
import { createAnnouncement, createNews, deleteNews, listAnnouncements, listNewsAdmin, updateAnnouncement, updateNews } from '../services/cmsService.js'

const router = Router(); const editors = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']
router.use(authenticate, authorize(...editors))
router.get('/news', async (req, res, next) => { try { res.json({ success: true, message: 'News retrieved successfully', ...(await listNewsAdmin(req.query)) }) } catch (error) { next(error) } })
router.post('/news', async (req, res, next) => { try { const item = await createNews(req.body, req.user.sub); await recordAudit({ req, action: 'created', resource: 'News', resourceId: item.id }); res.status(201).json({ success: true, message: 'News created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/news/:id', async (req, res, next) => { try { const item = await updateNews(req.params.id, req.body); await recordAudit({ req, action: 'updated', resource: 'News', resourceId: item.id, metadata: { status: item.status } }); res.json({ success: true, message: 'News updated successfully', data: item }) } catch (error) { next(error) } })
router.delete('/news/:id', async (req, res, next) => { try { await deleteNews(req.params.id); await recordAudit({ req, action: 'deleted', resource: 'News', resourceId: req.params.id }); res.json({ success: true, message: 'News deleted successfully', data: null }) } catch (error) { next(error) } })
router.get('/announcements', async (req, res, next) => { try { res.json({ success: true, message: 'Announcements retrieved successfully', ...(await listAnnouncements(req.query)) }) } catch (error) { next(error) } })
router.post('/announcements', async (req, res, next) => { try { if (!req.body.title || !req.body.body) return res.status(422).json({ success: false, message: 'Title and body are required', errors: [] }); const item = await createAnnouncement(req.body, req.user.sub); await recordAudit({ req, action: 'created', resource: 'Announcement', resourceId: item.id }); res.status(201).json({ success: true, message: 'Announcement created successfully', data: item }) } catch (error) { next(error) } })
router.patch('/announcements/:id', async (req, res, next) => { try { const item = await updateAnnouncement(req.params.id, req.body); await recordAudit({ req, action: 'updated', resource: 'Announcement', resourceId: item.id }); res.json({ success: true, message: 'Announcement updated successfully', data: item }) } catch (error) { next(error) } })
export default router
