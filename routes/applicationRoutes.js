import express from 'express';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  getApplicationStats
} from '../Controllers/applicationController.js';
// import { applicationUpload } from '../Middlewares/multerMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and Word documents are allowed'));
    }
  }
});

// Use this middleware in your route
router.post('/applications-create', 
  upload.fields([
    { name: 'yourIdPost', maxCount: 1 },
    { name: 'parentsIdPost', maxCount: 1 },
    { name: 'partnerIdPost', maxCount: 1 },
    { name: 'partnerParentsIdPost', maxCount: 1 }
  ]),
  createApplication
);

// router.post('/applications-create', applicationUpload, createApplication);
router.get('/applications-get', getApplications);
router.get('/applications/stats', getApplicationStats);
router.get('/applications/:id', getApplicationById);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;