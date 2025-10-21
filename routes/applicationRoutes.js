import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats
} from '../Controllers/applicationController.js';
import multer from 'multer';

const router = express.Router();


const storage = multer.memoryStorage();

// ✅ Accept all file types & limit size
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    console.log(`📎 Uploading file: ${file.originalname}, mimetype=${file.mimetype}`);
    cb(null, true); // Accept all files
  },
});

// ✅ Route: create application (upload directly to Cloudinary)
router.post(
  '/applications-create',
  upload.fields([
    { name: 'yourIdPost', maxCount: 1 },
    { name: 'parentsIdPost', maxCount: 1 },
    { name: 'partnerIdPost', maxCount: 1 },
    { name: 'partnerParentsIdPost', maxCount: 1 },
  ]),
  createApplication
);

// ✅ Other routes
router.get('/applications-get', getApplications);
router.get('/applications/stats', getApplicationStats);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
