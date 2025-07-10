import { uploadCloudinary,deleteCloudinary } from '../Utils/cloudinary.js';
import documentUpload from '../Models/document.upload.js';
import errorhandler from '../Utils/errorhandler.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';

export const uploadDocument = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const { documentType } = req.body;

  if (!req.files?.front || !req.files?.back) {
    return next(new errorhandler("Please upload both front and back images!", 400));
  }

  const frontImagePath = req.files.front[0].path;
  const backImagePath = req.files.back[0].path;

  const [frontImage, backImage] = await Promise.all([
    uploadCloudinary(frontImagePath),
    uploadCloudinary(backImagePath)
  ]);

  const data = await documentUpload.create({
    userId,
    documentType,
    documentFrontUrl: frontImage.url,
    documentBackUrl: backImage.url,
    isVerified: "pending"
  });

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    data
  });
});

export const getDocument = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
  
    const data = await documentUpload.findOne({ where: { userId } });
  
    if (!data) {
      return next(new errorhandler("No document found", 404));
    }
  
    // Optional fallback handling in case of missing fields
    const safeData = {
      id: data.id,
      documentType: data.documentType || "Unknown",
      isVerified: data.isVerified || "pending",
      documentFrontUrl: data.documentFrontUrl || "",
      documentBackUrl: data.documentBackUrl || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  
    res.status(200).json({
      success: true,
      message: "Document retrieved successfully",
      data: safeData,
    });
  });
  




export const deleteDocument = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
  
    const document = await documentUpload.findOne({ where: { userId } });
  
    if (!document) {
      return next(new errorhandler("No document found to delete", 404));
    }
  
   
    const extractPublicId = (url) => {
      const parts = url.split('/');
      const fileWithExt = parts[parts.length - 1]; 
      const publicId = fileWithExt.substring(0, fileWithExt.lastIndexOf('.'));
      return publicId;
    };
  
    const frontPublicId = extractPublicId(document.documentFrontUrl);
    const backPublicId = extractPublicId(document.documentBackUrl);
  
    await deleteCloudinary(frontPublicId);
    await deleteCloudinary(backPublicId);
  
    await document.destroy();
  
    res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  });




export const verifyDocument = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // should be 'verified' or 'rejected'

  const validStatus = ['verified', 'rejected'];
  if (!validStatus.includes(status)) {
    return next(new errorhandler("Invalid verification status", 400));
  }

  const doc = await documentUpload.findByPk(id);
  if (!doc) {
    return next(new errorhandler("Document not found", 404));
  }

  await doc.update({ isVerified: status });

  res.status(200).json({
    success: true,
    message: `Document marked as ${status}`,
    data: doc
  });
});


export const checkDocumentExists = catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
  
    const document = await documentUpload.findOne({ where: { userId } });
  
    if (!document) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "No document uploaded yet."
      });
    }
  
    return res.status(200).json({
      success: true,
      exists: true,
      message: "Document already uploaded.",
      data: {
        id: document.id,
        documentType: document.documentType,
        isVerified: document.isVerified
      }
    });
  });
  