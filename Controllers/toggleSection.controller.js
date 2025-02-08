import { catchAsyncError } from "../Middlewares/catchAsyncError.js";
import User from "../Models/user.js";
import errorhandler from "../Utils/errorhandler.js";
import ToggleSection from "../Models/toggleSection.model.js";


export const toggleSection = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { section, status } = req.body;
        const user = await User.findOne({ where: { userId } });

        if (!user) {
            return next(new errorhandler("User not found", 400));
        }
        const toggleSection = await ToggleSection.findOne({ where: { userId, section } });

        if (!toggleSection) {
            const toggleSection = await ToggleSection.create({ userId, section, status });
           

            const Data = {
                section: toggleSection.section,
                status: toggleSection.status,
            };

           
            return res.status(200).json({
                success: true,
                message: "Toggle section created successfully",
                Data
            });
        }
        const updateToggle = await toggleSection.update({ status });
        const Data = {
            section: updateToggle.section,
            status: updateToggle.status,
        };

       
        res.status(200).json({
            success: true,
            message: "Toggle section updated successfully",
            Data
        });
    } catch (error) {
        return next(new errorhandler(error.message, 500));
    }
});