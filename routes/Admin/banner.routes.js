import express from "express";
import { upload } from "../../Middlewares/multer.js";// your multer storage
import { uploadBannerImages, getBannerImages,deleteBannerImage,deleteAllBannerImages } from "../../Controllers/Admin/bannerController.js";
import { isAdminAuthenticated } from "../../Middlewares/admin/isAdminAuthenticated.js";
const bannerRouter = express.Router();


bannerRouter.post(
  "/uploadBanner",
  upload.array("bannerImages", 10), 
  isAdminAuthenticated,
  uploadBannerImages
);

bannerRouter.get("/getBanner", getBannerImages);
bannerRouter.delete("/deleteBanner",isAdminAuthenticated, deleteBannerImage);

bannerRouter.delete("/deleteAllBanners", isAdminAuthenticated,deleteAllBannerImages);

export default bannerRouter;
