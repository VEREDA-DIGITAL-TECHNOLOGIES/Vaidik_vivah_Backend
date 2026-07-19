import express from "express";


import { createContact,getAllContacts,getContactById,deleteContact,markContactedBack } from "../Controllers/contactController.js";



import { isAdminAuthenticated } from "../Middlewares/admin/isAdminAuthenticated.js";
import { logApiRequest } from "../Middlewares/admin/logApiRequest.js";
const contactRouter = express.Router();


contactRouter.post("/", createContact);


contactRouter.post("/admin/get-all",isAdminAuthenticated,logApiRequest, getAllContacts);


contactRouter.post("/admin/get", isAdminAuthenticated,logApiRequest,getContactById);


contactRouter.post("/admin/delete", isAdminAuthenticated,logApiRequest,deleteContact);


contactRouter.post("/admin/contacted-back",isAdminAuthenticated,logApiRequest, markContactedBack);

export default contactRouter;