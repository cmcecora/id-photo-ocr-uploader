import { Router } from 'express';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadController } from '../controllers/uploadController.js';

const router = Router();

// POST /api/id/upload - Upload and process ID image
router.post('/upload', upload.single('idImage'), uploadController.uploadAndExtract);

export { router as uploadRoutes };