import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { addConnection,acceptConnection,rejectConnection,blockConnection } from "../Controllers/connection.controller.js";

const connectionRouter = express.Router();

connectionRouter.post('/addConnection',isAuthenticated,addConnection);
connectionRouter.post('/acceptConnection',isAuthenticated,acceptConnection);
connectionRouter.post('/rejectConnection',isAuthenticated, rejectConnection);
connectionRouter.post('/blockConnection',isAuthenticated,blockConnection);

export default connectionRouter