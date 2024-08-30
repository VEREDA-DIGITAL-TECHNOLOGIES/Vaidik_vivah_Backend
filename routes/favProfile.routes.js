import express from "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import {addFavProfile,getFavProfile,removeFavProfile} from '../Controllers/favProfile.controller.js'

const favProfileRouter = express.Router();


favProfileRouter.post('/addFavProfile',isAuthenticated,addFavProfile);
favProfileRouter.get('/getFavProfile',isAuthenticated,getFavProfile);
favProfileRouter.post('/removeFavProfile',isAuthenticated,removeFavProfile);

export default favProfileRouter

