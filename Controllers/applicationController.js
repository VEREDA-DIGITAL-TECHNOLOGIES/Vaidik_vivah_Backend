import { Application, Plan } from '../Models/association.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';
import errorhandler from '../Utils/errorhandler.js';

export const createApplication = catchAsyncError(async (req, res, next) => {
  console.log('📦 Received body:', req.body);

  // ✅ Validate required fields
  const requiredFields = [
    'planName', 'nom', 'fatherName', 'loginId', 'address', 'penaltyType',
    'partnerName', 'partnerFatherName', 'partnerLoginId', 'partnerAddress',
    'yourMobNo', 'partnerMobNo', 'parentsMobNo', 'partnerParentsMobNo',
    'planId', 'userId'
  ];
  
  const missingFields = requiredFields.filter(f => !req.body[f]);
  if (missingFields.length)
    return next(new errorhandler(`Missing required fields: ${missingFields.join(', ')}`, 400));

  // ✅ Validate mobile numbers
  const mobileFields = ['yourMobNo', 'partnerMobNo', 'parentsMobNo', 'partnerParentsMobNo'];
  const invalidMobiles = mobileFields.filter(f => !/^\d{10}$/.test(req.body[f] || ''));
  if (invalidMobiles.length)
    return next(new errorhandler(`Invalid mobile numbers: ${invalidMobiles.join(', ')}`, 400));

  // ✅ Validate ID numbers (new fields)
  const idNumberFields = ['yourIdNumber', 'parentsIdNumber', 'partnerIdNumber', 'partnerParentsIdNumber'];
  const missingIdNumbers = idNumberFields.filter(f => !req.body[f] || req.body[f].trim() === '');
  if (missingIdNumbers.length)
    return next(new errorhandler(`Missing ID numbers: ${missingIdNumbers.join(', ')}`, 400));

  const shortIdNumbers = idNumberFields.filter(f => req.body[f] && req.body[f].length < 3);
  if (shortIdNumbers.length)
    return next(new errorhandler(`ID numbers must be at least 3 characters: ${shortIdNumbers.join(', ')}`, 400));

  try {
    // Parse boolean values
    const parentsCertified = req.body.parentsCertified === 'true';
    const partnerParentsCertified = req.body.partnerParentsCertified === 'true';

    // Create application with all data
    const application = await Application.create({
      // Basic information
      planId: req.body.planId,
      userId: req.body.userId,
      planName: req.body.planName || "Diamond",
      
      // Personal information
      nom: req.body.nom,
      fatherName: req.body.fatherName,
      loginId: req.body.loginId,
      address: req.body.address,
      penaltyType: req.body.penaltyType,
      
      // Partner information
      partnerName: req.body.partnerName,
      partnerFatherName: req.body.partnerFatherName,
      partnerLoginId: req.body.partnerLoginId,
      partnerAddress: req.body.partnerAddress,
      
      // Contact information
      yourMobNo: req.body.yourMobNo,
      partnerMobNo: req.body.partnerMobNo,
      parentsMobNo: req.body.parentsMobNo,
      partnerParentsMobNo: req.body.partnerParentsMobNo,
      
      // Certification
      parentsCertified,
      partnerParentsCertified,
      
      // ID Numbers (new text fields)
      yourIdNumber: req.body.yourIdNumber,
      parentsIdNumber: req.body.parentsIdNumber,
      partnerIdNumber: req.body.partnerIdNumber,
      partnerParentsIdNumber: req.body.partnerParentsIdNumber,
      
      // Payment and metadata
      paymentAmount: parseFloat(req.body.applicationFee) || 1000.00,
      applicationDate: req.body.applicationDate ? new Date(req.body.applicationDate) : new Date(),
      
      // Set default status
      status: 'pending',
      paymentStatus: 'pending',
    });

    console.log('🚀 ===== VIVAH SANSAKAR APPLICATION SUBMITTED =====');
    console.log('   🆔 Application ID:', application.id);
    console.log('   👤 Applicant:', application.nom);
    console.log('   👥 Partner:', application.partnerName);
    console.log('   📱 Mobile:', application.yourMobNo);
    console.log('   💰 Fee:', application.paymentAmount);
    console.log('===================================================');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });

  } catch (error) {
    console.error('❌ Application creation error:', error);
    
    // Handle database validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => err.message);
      return next(new errorhandler(`Validation failed: ${messages.join(', ')}`, 400));
    }
    
    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return next(new errorhandler('Invalid plan or user reference', 400));
    }
    
    return next(new errorhandler('Application creation failed. Please try again.', 500));
  }
});

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