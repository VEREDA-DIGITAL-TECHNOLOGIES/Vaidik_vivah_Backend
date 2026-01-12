import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats
} from '../Controllers/applicationController.js';

const router = express.Router();

// ✅ Route: create application (text-based, no file upload)
router.post('/applications-create', createApplication);

// ✅ Other routes
router.get('/applications-get', getApplications);
router.get('/applications/stats', getApplicationStats);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;