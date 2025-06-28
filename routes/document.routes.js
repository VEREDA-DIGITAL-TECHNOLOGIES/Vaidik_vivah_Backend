import express from 'express';
import { uploadDocument,getDocument,verifyDocument,deleteDocument } from '../Controllers/document.controller.js';
import multer from 'multer';

const Documentrouter = express.Router();
import { isAuthenticated } from '../Middlewares/auth.js';
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


export default Documentrouter;
