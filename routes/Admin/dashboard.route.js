import express from 'express';
import { getUserStatsForAdmin,getNewUserAdded,getGenderRatio ,getProfileCompletionStats,getConnectionStats} from '../../Controllers/Admin/dashboard.controller.js';  // Correct relative path and .js extension


const adminDashboardRouter = express.Router();

// Route to get all-time user stats for each week, month, and year
adminDashboardRouter.get('/user-stats', getUserStatsForAdmin);

adminDashboardRouter.get('/new-user-data',getNewUserAdded)

adminDashboardRouter.get('/gender-ratio',getGenderRatio)
adminDashboardRouter.get('/profile-fill-percentage',getProfileCompletionStats)
adminDashboardRouter.get('/connection-data',getConnectionStats)




export default adminDashboardRouter;
