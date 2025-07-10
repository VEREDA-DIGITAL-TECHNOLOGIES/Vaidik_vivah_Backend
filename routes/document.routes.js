import express from 'express';
import { uploadDocument, getDocument, verifyDocument ,deleteDocument,checkDocumentExists} from '../Controllers/documentController.js';
import { isAuthenticated } from '../Middlewares/auth.js';
import multer from 'multer';

const Documentrouter = express.Router();
const upload = multer({ dest: 'uploads/' }); // store files temporarily

Documentrouter.post(
  '/upload-document',
  isAuthenticated,
  upload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]),
  uploadDocument
);

Documentrouter.get('/get-document', isAuthenticated, getDocument);

Documentrouter.patch('/verify-document/:id', verifyDocument); 

Documentrouter.delete('/delete-document', isAuthenticated, deleteDocument);

Documentrouter.get('/check-document', isAuthenticated, checkDocumentExists);

export default Documentrouter;
