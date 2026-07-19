import express from "express";
import { isAuthenticated } from "../Middlewares/auth.js";
import { createPlan,getAllPlans,deletePlan,getPlanById,updatePlan } from "../Controllers/plan.controller.js";

import { isAdminAuthenticated } from "../Middlewares/admin/isAdminAuthenticated.js";
const planRouter = express.Router();

planRouter.post('/createPlan',isAdminAuthenticated,createPlan);
planRouter.get('/getAllPlans',getAllPlans);
planRouter.delete('/deletePlan',isAdminAuthenticated,deletePlan)

planRouter.post("/getPlan", getPlanById);          // body { planId }
planRouter.put("/updatePlan",isAdminAuthenticated, updatePlan);
 
export default planRouter