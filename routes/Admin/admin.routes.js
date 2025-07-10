import express from 'express';
import { 
    registerAdmin, 
    adminLogin,        
    verifyLoginOtp,    
    adminLogout 
} from '../../Controllers/Admin/admin.controller.js';
import { isAuthenticated } from '../../Middlewares/auth.js';

const adminRouter = express.Router();


adminRouter.post('/register', registerAdmin);         
adminRouter.post('/login', adminLogin);                
adminRouter.post('/verify-otp', verifyLoginOtp);      
adminRouter.post('/logout', isAuthenticated, adminLogout); 

export default adminRouter;

