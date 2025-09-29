import { Application, Plan } from '../Models/association.js';

import { uploadCloudinary } from '../Utils/cloudinary.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';
import errorhandler from '../Utils/errorhandler.js';

export const createApplication = catchAsyncError(async (req, res, next) => {
  // Since we're using FormData, we need to parse it differently
  // Make sure you have proper middleware for file uploads
  console.log('📦 Received files:', req.files);
  console.log('📦 Received body:', req.body);

  // Validate required fields
  const requiredFields = [
    'planName', 'nom', 'fatherName', 'loginId', 'address', 'penaltyType',
    'partnerName', 'partnerFatherName', 'partnerLoginId', 'partnerAddress',
    'yourMobNo', 'partnerMobNo', 'parentsMobNo', 'partnerParentsMobNo',"planId"
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return next(new errorhandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  // Validate mobile numbers
  const mobileFields = ['yourMobNo', 'partnerMobNo', 'parentsMobNo', 'partnerParentsMobNo'];
  const invalidMobiles = mobileFields.filter(field => {
    const value = req.body[field];
    return !value || !/^\d{10}$/.test(value);
  });

  if (invalidMobiles.length > 0) {
    return next(new errorhandler(`Invalid mobile numbers: ${invalidMobiles.join(', ')}. Must be 10 digits.`, 400));
  }

  // Check if required files are uploaded
  const requiredFiles = ['yourIdPost', 'parentsIdPost', 'partnerIdPost', 'partnerParentsIdPost'];
  const missingFiles = requiredFiles.filter(field => !req.files?.[field]);

  if (missingFiles.length > 0) {
    return next(new errorhandler(`Missing required files: ${missingFiles.join(', ')}`, 400));
  }

  try {
    // Upload all files to Cloudinary in parallel
    const uploadPromises = requiredFiles.map(async (field) => {
      const file = req.files[field][0];
      const uploadResult = await uploadCloudinary(file.path);
      return {
        field,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Create cloudinaryUrls object from upload results
    const cloudinaryUrls = {};
    uploadResults.forEach(result => {
      cloudinaryUrls[`${result.field}Url`] = result.url;
      cloudinaryUrls[`${result.field}PublicId`] = result.publicId;
    });

    // Parse boolean values
    const parentsCertified = req.body.parentsCertified === 'true';
    const partnerParentsCertified = req.body.partnerParentsCertified === 'true';

    // Create application
    const application = await Application.create({
      planId:req.body.planId,
      planName:"Diamond",
      nom: req.body.nom,
      fatherName: req.body.fatherName,
      loginId: req.body.loginId,
      address: req.body.address,
      penaltyType: req.body.penaltyType,
      partnerName: req.body.partnerName,
      partnerFatherName: req.body.partnerFatherName,
      partnerLoginId: req.body.partnerLoginId,
      partnerAddress: req.body.partnerAddress,
      yourMobNo: req.body.yourMobNo,
      partnerMobNo: req.body.partnerMobNo,
      parentsCertified,
      parentsMobNo: req.body.parentsMobNo,
      partnerParentsMobNo: req.body.partnerParentsMobNo,
      partnerParentsCertified,
      ...cloudinaryUrls,
      paymentAmount: parseFloat(req.body.applicationFee) || 1000.00,
      applicationDate: req.body.applicationDate ? new Date(req.body.applicationDate) : new Date(),
    });

    console.log('🚀 ===== VIVAH SANSAKAR APPLICATION SUBMITTED =====');
    console.log('📋 APPLICATION DETAILS:');
    console.log('   📝 Plan:', req.body.planName);
    console.log('   📝 Plan:', req.body.planId);

    console.log('   👤 Applicant:', req.body.nom);
    console.log('   👥 Partner:', req.body.partnerName);
    console.log('   ⚖️  Penalty Type:', req.body.penaltyType);
    console.log('   📞 Contact Numbers:', {
      applicant: req.body.yourMobNo,
      partner: req.body.partnerMobNo,
      parents: req.body.parentsMobNo,
      partnerParents: req.body.partnerParentsMobNo,
    });
    console.log('   📎 Files Uploaded:', uploadResults.length);
    console.log('   🆔 Application ID:', application.id);
    console.log('   ⏰ Submitted at:', new Date().toLocaleString());
    console.log('===================================================');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });

  } catch (uploadError) {
    console.error('❌ File upload error:', uploadError);
    return next(new errorhandler('File upload failed. Please try again.', 500));
  }
});

// export const createApplication = catchAsyncError(async (req, res, next) => {
//   // Validate request body
//   const { error, value } = validateApplication(req.body);
//   if (error) {
//     return next(new errorhandler(`Validation failed: ${error.details.map(detail => detail.message).join(', ')}`, 400));
//   }

//   // Check if plan exists
//   const plan = await Plan.findByPk(value.planId);
//   if (!plan) {
//     return next(new errorhandler('Plan not found', 404));
//   }

//   // Check if required files are uploaded
//   const requiredFiles = ['yourIdPost', 'parentsIdPost', 'partnerIdPost', 'partnerParentsIdPost'];
//   const missingFiles = requiredFiles.filter(field => !req.files?.[field]);

//   if (missingFiles.length > 0) {
//     return next(new errorhandler(`Missing required files: ${missingFiles.join(', ')}`, 400));
//   }

//   // Upload all files to Cloudinary in parallel
//   const uploadPromises = requiredFiles.map(async (field) => {
//     const file = req.files[field][0];
//     const uploadResult = await uploadCloudinary(file.path);
//     return {
//       field,
//       url: uploadResult.secure_url,
//       publicId: uploadResult.public_id
//     };
//   });

//   const uploadResults = await Promise.all(uploadPromises);

//   // Create cloudinaryUrls object from upload results
//   const cloudinaryUrls = {};
//   uploadResults.forEach(result => {
//     cloudinaryUrls[`${result.field}Url`] = result.url;
//     cloudinaryUrls[`${result.field}PublicId`] = result.publicId;
//   });

//   // Create application
//   const application = await Application.create({
//     ...value,
//     ...cloudinaryUrls,
//     paymentAmount: 1000.00,
//   });

//   // Include plan details in response
//   const applicationWithPlan = await Application.findByPk(application.id, {
//     include: [{ model: Plan, as: 'plan' }],
//   });

//   console.log('🚀 ===== VIVAH SANSAKAR APPLICATION SUBMITTED =====');
//   console.log('📋 APPLICATION DETAILS:');
//   console.log('   📝 Plan:', plan.name);
//   console.log('   👤 Applicant:', value.nom);
//   console.log('   👥 Partner:', value.partnerName);
//   console.log('   ⚖️  Penalty Type:', value.penaltyType);
//   console.log('   📞 Contact Numbers:', {
//     applicant: value.yourMobNo,
//     partner: value.partnerMobNo,
//     parents: value.parentsMobNo,
//     partnerParents: value.partnerParentsMobNo,
//   });
//   console.log('   📎 Files Uploaded:', uploadResults.length);
//   console.log('   🆔 Application ID:', application.id);
//   console.log('   ⏰ Submitted at:', new Date().toLocaleString());
//   console.log('===================================================');

//   res.status(201).json({
//     success: true,
//     message: 'Application submitted successfully',
//     data: applicationWithPlan,
//   });
// });

// Other controller functions remain similar but with catchAsyncError
export const getApplications = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const whereClause = status ? { status } : {};

  const { count, rows: applications } = await Application.findAndCountAll({
    where: whereClause,
    include: [{ model: Plan, as: 'plans' }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: applications,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit),
    },
  });
});

export const getApplicationById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findByPk(id, {
    include: [{ model: Plan, as: 'plan' }],
  });

  if (!application) {
    return next(new errorhandler('Application not found', 404));
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

export const updateApplicationStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'completed'];
  if (!validStatuses.includes(status)) {
    return next(new errorhandler('Invalid status', 400));
  }

  const application = await Application.findByPk(id);
  if (!application) {
    return next(new errorhandler('Application not found', 404));
  }

  await application.update({ status, notes });

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: application,
  });
});

export const getApplicationStats = catchAsyncError(async (req, res, next) => {
  const totalApplications = await Application.count();
  const pendingApplications = await Application.count({ where: { status: 'pending' } });
  const approvedApplications = await Application.count({ where: { status: 'approved' } });
  const totalRevenue = await Application.sum('paymentAmount', { where: { paymentStatus: 'paid' } });

  const statsByPlan = await Application.findAll({
    attributes: ['planId'],
    include: [{ model: Plan, as: 'plan', attributes: ['name'] }],
    group: ['planId', 'Plan.id', 'Plan.name'],
    raw: true,
    nest: true,
  });

  res.status(200).json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalRevenue: totalRevenue || 0,
      statsByPlan,
    },
  });
});