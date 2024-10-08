import express from  "express";
import { isAuthenticated} from '../Middlewares/auth.js';
import {addStory,getAllStories} from '../Controllers/happyStories.controller.js'
import { upload } from "../Middlewares/multer.js";


const happyStoryRouter = express.Router();


happyStoryRouter.post('/addHappyStory',isAuthenticated,addStory,upload.array('image',1));
happyStoryRouter.get('/getAllHappyStory',isAuthenticated,getAllStories);


export default happyStoryRouter