import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { sendConnectionRequest,acceptConnectionRequest,cancelConnectionRequest ,rejectConnectionRequest,removeConnection,getConnectionStatus } from "../Controllers/connection.controller.js";

const connectionRouter = express.Router();

connectionRouter.post('/addConnection',isAuthenticated,sendConnectionRequest);
connectionRouter.post('/cancelConnection',isAuthenticated, cancelConnectionRequest);
connectionRouter.post('/acceptConnection',isAuthenticated,acceptConnectionRequest);
connectionRouter.post('/rejectConnection',isAuthenticated, rejectConnectionRequest);
connectionRouter.post('/removeConnection',isAuthenticated, removeConnection);
connectionRouter.get('/getConnectionStatus',isAuthenticated,getConnectionStatus);

export default connectionRouter