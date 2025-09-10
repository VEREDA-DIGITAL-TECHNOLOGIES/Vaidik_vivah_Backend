import express from "express";


import { createContact,getAllContacts,getContactById,deleteContact,markContactedBack } from "../Controllers/contactController.js";



import { isAdminAuthenticated } from "../Middlewares/admin/isAdminAuthenticated.js";

const contactRouter = express.Router();


contactRouter.post("/", createContact);


contactRouter.post("/admin/get-all",isAdminAuthenticated, getAllContacts);


contactRouter.post("/admin/get", isAdminAuthenticated,getContactById);


contactRouter.post("/admin/delete", isAdminAuthenticated,deleteContact);


contactRouter.post("/admin/contacted-back",isAdminAuthenticated, markContactedBack);

export default contactRouter;