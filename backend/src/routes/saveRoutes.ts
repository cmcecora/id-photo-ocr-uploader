import { Router } from 'express';
import { saveController } from '../controllers/saveController.js';

const router = Router();

// POST /api/id/save - Save ID data
router.post('/save', saveController.saveData);

// GET /api/id - Get all ID data (with pagination)
router.get('/', saveController.getAllData);

// GET /api/id/search - Search ID data
router.get('/search', saveController.searchData);

// GET /api/id/:id - Get specific ID data
router.get('/:id', saveController.getDataById);

export { router as saveRoutes };