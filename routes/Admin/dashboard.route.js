import express from 'express';
import { getUserStatsForAdmin,getNewUserAdded,getGenderRatio ,getProfileCompletionStats,getConnectionStats} from '../../Controllers/Admin/dashboard.controller.js';  // Correct relative path and .js extension
import { isAdminAuthenticated } from '../../Middlewares/admin/isAdminAuthenticated.js';

const adminDashboardRouter = express.Router();

// Route to get all-time user stats for each week, month, and year
adminDashboardRouter.get('/user-stats', isAdminAuthenticated,getUserStatsForAdmin);

adminDashboardRouter.get('/new-user-data',isAdminAuthenticated,getNewUserAdded)

adminDashboardRouter.get('/gender-ratio',isAdminAuthenticated,getGenderRatio)
adminDashboardRouter.get('/profile-fill-percentage',isAdminAuthenticated,getProfileCompletionStats)
adminDashboardRouter.get('/connection-data',isAdminAuthenticated,getConnectionStats)




export default adminDashboardRouter;
