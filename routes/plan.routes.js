import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { createPlan,getAllPlans,deletePlan } from "../Controllers/plan.controller.js";


const planRouter = express.Router();

planRouter.post('/createPlan',isAuthenticated,createPlan);
planRouter.get('/getAllPlans',getAllPlans);
planRouter.delete('/deletePlan',isAuthenticated,deletePlan)
 
export default planRouter