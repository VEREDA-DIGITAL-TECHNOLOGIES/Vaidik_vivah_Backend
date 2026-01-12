import { Application, Plan } from '../Models/association.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';
import errorhandler from '../Utils/errorhandler.js';



export const createApplication = catchAsyncError(async (req, res, next) => {
  console.log("📦 Received body:", req.body);

  // ✅ Required fields
  const requiredFields = [
    "planId",
    "userId",
    "planName",
    "nom",
    "fatherName",
    "loginId",
    "address",
    "penaltyType",
    "partnerName",
    "partnerFatherName",
    "partnerLoginId",
    "partnerAddress",
    "yourMobNo",
    "partnerMobNo",
    "parentsMobNo",
    "partnerParentsMobNo",
    "yourIdNumber",
    "parentsIdNumber",
    "partnerIdNumber",
    "partnerParentsIdNumber",
  ];

  const missingFields = requiredFields.filter(
    (field) => !req.body[field]
  );

  if (missingFields.length) {
    return next(
      new errorhandler(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      )
    );
  }

  // ✅ Mobile validation
  const mobileFields = [
    "yourMobNo",
    "partnerMobNo",
    "parentsMobNo",
    "partnerParentsMobNo",
  ];

  const invalidMobiles = mobileFields.filter(
    (field) => !/^\d{10}$/.test(req.body[field])
  );

  if (invalidMobiles.length) {
    return next(
      new errorhandler(
        `Invalid mobile numbers: ${invalidMobiles.join(", ")}`,
        400
      )
    );
  }

  // ✅ ID number validation
  const idFields = [
    "yourIdNumber",
    "parentsIdNumber",
    "partnerIdNumber",
    "partnerParentsIdNumber",
  ];

  const shortIds = idFields.filter(
    (field) => req.body[field].length < 3
  );

  if (shortIds.length) {
    return next(
      new errorhandler(
        `ID numbers must be at least 3 characters: ${shortIds.join(", ")}`,
        400
      )
    );
  }

  // ✅ Create application
  const application = await Application.create({
    planId: req.body.planId,
    userId: req.body.userId,
    planName: req.body.planName,

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
    parentsMobNo: req.body.parentsMobNo,
    partnerParentsMobNo: req.body.partnerParentsMobNo,

    parentsCertified: req.body.parentsCertified,
    partnerParentsCertified: req.body.partnerParentsCertified,

    yourIdNumber: req.body.yourIdNumber,
    parentsIdNumber: req.body.parentsIdNumber,
    partnerIdNumber: req.body.partnerIdNumber,
    partnerParentsIdNumber: req.body.partnerParentsIdNumber,

    paymentAmount: Number(req.body.applicationFee ?? 1000),
    applicationDate: new Date(req.body.applicationDate ?? Date.now()),

    status: "pending",
    paymentStatus: "pending",
  });

  console.log("✅ APPLICATION CREATED:", application.id);

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
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