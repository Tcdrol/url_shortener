import { Router } from 'express';
import * as urlController from '../controllers/url.controller';

const router = Router();

// Create a short URL
router.post('/', urlController.createShortUrl);

// Get all URLs (for history)
router.get('/', urlController.getAllUrls);

// Redirect to original URL (this should be the last route)
router.get('/:shortCode', urlController.redirectToOriginalUrl);

// Get URL stats
router.get('/:shortCode/stats', urlController.getUrlStats);

export default router;
