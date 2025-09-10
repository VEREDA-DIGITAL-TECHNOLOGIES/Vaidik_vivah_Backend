import express from "express";


import { createContact,getAllContacts,getContactById,deleteContact,markContactedBack } from "../Controllers/contactController.js";





const contactRouter = express.Router();


contactRouter.post("/", createContact);


contactRouter.post("/admin/get-all", getAllContacts);


contactRouter.post("/admin/get", getContactById);


contactRouter.post("/admin/delete", deleteContact);


contactRouter.post("/admin/contacted-back", markContactedBack);

export default contactRouter;