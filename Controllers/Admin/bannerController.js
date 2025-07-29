
import Banner from "../../Models/Admin/app.banner.js";
import { uploadCloudinary ,deleteCloudinary} from "../../Utils/cloudinary.js";

export const uploadBannerImages = async (req, res, next) => {
  try {
    const files = req.files.map(file => file.path);
    const uploaded = await uploadCloudinary(files); // returns array

    const urls = Array.isArray(uploaded)
      ? uploaded.map((img) => img.secure_url)
      : [uploaded.secure_url];

    const existingBanner = await Banner.findByPk(1);

    if (existingBanner) {
      existingBanner.photos = urls;
      existingBanner.photoCount = urls.length;
      await existingBanner.save();
    } else {
      await Banner.create({
        id: 1,
        photos: urls,
        photoCount: urls.length,
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner uploaded successfully",
      photos: urls,
    });
  } catch (error) {
    next(error);
  }
};

export const getBannerImages = async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(1);

    if (!banner) {
      return res.status(404).json({ message: "No banner found" });
    }

    res.status(200).json({
      success: true,
      photos: banner.photos,
      photoCount: banner.photoCount,
    });
  } catch (error) {
    next(error);
  }
};



export const deleteBannerImage = async (req, res, next) => {
    try {
      const { imageUrl } = req.body;
  
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }
  
      const publicId = extractPublicId(imageUrl);
      if (!publicId) {
        return res.status(400).json({ message: "Failed to extract public_id from image URL" });
      }
  
      await deleteCloudinary(publicId);
  
      const banner = await Banner.findByPk(1);
      if (!banner || !Array.isArray(banner.photos)) {
        return res.status(404).json({ message: "No banner data found" });
      }
  
      const updatedPhotos = banner.photos.filter(photo => photo !== imageUrl);
      banner.photos = updatedPhotos;
      banner.photoCount = updatedPhotos.length;
  
      await banner.save();
  
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        photos: updatedPhotos,
      });
    } catch (error) {
      next(error);
    }
  };
  

  const extractPublicId = (url) => {
    try {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      const publicId = fileName.split('.')[0]; // remove extension
      const folder = parts.slice(parts.indexOf("upload") + 1, parts.length - 1).join("/");
      return `${folder}/${publicId}`;
    } catch {
      return null;
    }
  };



  export const deleteAllBannerImages = async (req, res, next) => {
    try {
      const banner = await Banner.findByPk(1);
  
      if (!banner || !Array.isArray(banner.photos) || banner.photos.length === 0) {
        return res.status(404).json({ message: "No banners to delete" });
      }
  
      const deleted = [];
  
      for (const imageUrl of banner.photos) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteCloudinary(publicId);
          deleted.push(publicId);
        }
      }
  
      banner.photos = [];
      banner.photoCount = 0;
      await banner.save();
  
      res.status(200).json({
        success: true,
        message: "All banner images deleted successfully",
        deletedCount: deleted.length,
      });
    } catch (error) {
      next(error);
    }
  };
  
  
