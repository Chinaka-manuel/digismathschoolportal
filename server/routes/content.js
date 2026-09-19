import { Router } from 'express'
import { listPublishedNews, listUpcomingEvents } from '../services/contentService.js'

const router = Router()
router.get('/news', async (req, res, next) => { try { res.json({ success: true, message: 'Published news retrieved successfully', ...(await listPublishedNews(req.query)) }) } catch (error) { next(error) } })
router.get('/events', async (req, res, next) => { try { res.json({ success: true, message: 'Upcoming events retrieved successfully', data: await listUpcomingEvents(req.query) }) } catch (error) { next(error) } })
export default router
