import { Application, Plan } from '../Models/association.js';
import { catchAsyncError } from '../Middlewares/catchAsyncError.js';
import errorhandler from '../Utils/errorhandler.js';

/**
 * CREATE APPLICATION
 */
export const createApplication = catchAsyncError(async (req, res, next) => {
  console.log("📦 Received body:", req.body);

  const requiredFields = [
    "userId",
    "planId",

    "nom",
    "fatherName",

    "villageCityTown",
    "district",
    "state",
    "country",
    "pincode",

    "penaltyType",

    "partnerName",
    "partnerFatherName",

    "yourMobNo",

    "venueName",
    "venueVillageCityTown",
    "venueDistrict",
    "venueState",
    "venueCountry",
    "venuePincode",
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length) {
    return next(
      new errorhandler(
        `Missing required fields: ${missingFields.join(", ")}`,
        400
      )
    );
  }

  // Mobile validation
  if (!/^\d{10}$/.test(req.body.yourMobNo)) {
    return next(new errorhandler("Invalid mobile number", 400));
  }

  // Pincode validation
  if (!/^\d{6}$/.test(req.body.pincode) || !/^\d{6}$/.test(req.body.venuePincode)) {
    return next(new errorhandler("Invalid pincode", 400));
  }

  const application = await Application.create({
    userId: req.body.userId,
    planId: req.body.planId,

    nom: req.body.nom,
    fatherName: req.body.fatherName,

    villageCityTown: req.body.villageCityTown,
    district: req.body.district,
    state: req.body.state,
    country: req.body.country,
    pincode: req.body.pincode,

    penaltyType: req.body.penaltyType,

    partnerName: req.body.partnerName,
    partnerFatherName: req.body.partnerFatherName,

    yourMobNo: req.body.yourMobNo,

    venueName: req.body.venueName,
    venueVillageCityTown: req.body.venueVillageCityTown,
    venueDistrict: req.body.venueDistrict,
    venueState: req.body.venueState,
    venueCountry: req.body.venueCountry,
    venuePincode: req.body.venuePincode,

    paymentAmount: Number(req.body.applicationFee ?? 1000),
    applicationFee:Number(req.body.applicationFee ?? 1000),
    applicationDate: new Date(req.body.applicationDate ?? Date.now()),
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
});

/**
 * GET ALL APPLICATIONS (PAGINATED)
 */
export const getApplications = catchAsyncError(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const where = status ? { status } : {};

  const { count, rows } = await Application.findAndCountAll({
    where,
    include: [{ model: Plan, as: "plan" }],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: (page - 1) * limit,
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
    },
  });
});

/**
 * GET APPLICATION BY ID
 */
export const getApplicationById = catchAsyncError(async (req, res, next) => {
  const application = await Application.findByPk(req.params.id, {
    include: [{ model: Plan, as: "plan" }],
  });

  if (!application) {
    return next(new errorhandler("Application not found", 404));
  }

  res.status(200).json({
    success: true,
    data: application,
  });
});

/**
 * UPDATE APPLICATION STATUS
 */
export const updateApplicationStatus = catchAsyncError(async (req, res, next) => {
  const { status, paymentStatus } = req.body;

  const validStatuses = ["pending", "under_review", "approved", "rejected", "completed"];
  if (status && !validStatuses.includes(status)) {
    return next(new errorhandler("Invalid application status", 400));
  }

  const application = await Application.findByPk(req.params.id);
  if (!application) {
    return next(new errorhandler("Application not found", 404));
  }

  await application.update({
    status: status ?? application.status,
    paymentStatus: paymentStatus ?? application.paymentStatus,
  });

  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    data: application,
  });
});

/**
 * APPLICATION STATS
 */
export const getApplicationStats = catchAsyncError(async (req, res) => {
  const [
    totalApplications,
    pendingApplications,
    approvedApplications,
    totalRevenue,
  ] = await Promise.all([
    Application.count(),
    Application.count({ where: { status: "pending" } }),
    Application.count({ where: { status: "approved" } }),
    Application.sum("paymentAmount", { where: { paymentStatus: "paid" } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalRevenue: totalRevenue || 0,
    },
  });
});
