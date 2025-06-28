import documentUpload from '../Models/document.model.js';
// import User from '../Models/user.js';
import { uploadCloudinary ,deleteCloudinary} from '../Utils/cloudinary.js';
import errorhandler from '../Utils/errorhandler.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';

// const upload = multer({ storage: multer.memoryStorage() });

// // Helper to wrap Cloudinary upload_stream in a promise
// const uploadToCloudinary = (fileBuffer, fileName) => {
//     return new Promise((resolve, reject) => {
//         const stream = uploadCloudinary.uploader.upload_stream(
//             { folder: 'documents', public_id: fileName, resource_type: 'auto' },
//             (error, result) => {
//                 if (error) return reject(error);
//                 resolve(result);
//             }
//         );
//         stream.end(fileBuffer);
//     });
// };

// const uploadDocument = async (req, res) => {
//     try {
//         const { userId, documentType } = req.body;

//         if (!req.files?.front || !req.files?.back) {
//             return res.status(400).json({ error: 'Both front and back images are required' });
//         }
//         // console.log(userId,documentType);
//         // Verify user exists
//         const userExists = await User.findOne({ where: { userId } });
//         if (!userExists) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Upload files to Cloudinary
//         const frontFile = req.files.front[0];
//         const backFile = req.files.back[0];

//         const [frontUpload, backUpload] = await Promise.all([
//             uploadToCloudinary(frontFile.buffer, `front_${userId}_${Date.now()}`),
//             uploadToCloudinary(backFile.buffer, `back_${userId}_${Date.now()}`)
//         ]);

//         // Save to DB
//         const doc = await documentUpload.create({
//             userId,
//             documentType,
//             documentFrontUrl: frontUpload.secure_url,
//             documentBackUrl: backUpload.secure_url,
//         });

//         return res.status(201).json({ message: 'Document uploaded successfully', data: doc });

//     } catch (error) {
//         console.error('Upload error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };




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

    res.status(200).json({
        success: true,
        data
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
        message: `Document marked as ${ status }`,
        data: doc
  });
});


