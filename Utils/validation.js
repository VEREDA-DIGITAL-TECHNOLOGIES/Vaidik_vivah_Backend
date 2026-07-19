import Joi from 'joi';

export const applicationValidationSchema = Joi.object({
  planId: Joi.string().uuid().required(),
  
  // Personal Information
  nom: Joi.string().min(2).max(100).required(),
  fatherName: Joi.string().min(2).max(100).required(),
  loginId: Joi.string().min(3).max(50).required(),
  address: Joi.string().min(10).max(500).required(),
  
  // Penalty Type
  penaltyType: Joi.string().valid(
    'home-simple',
    'home-voluntary',
    'maximize-hall',
    'maximize-hall-returns'
  ).required(),
  
  // Partner Information
  partnerName: Joi.string().min(2).max(100).required(),
  partnerFatherName: Joi.string().min(2).max(100).required(),
  partnerLoginId: Joi.string().min(3).max(50).required(),
  partnerAddress: Joi.string().min(10).max(500).required(),
  yourMobNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
  partnerMobNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
  
  // Certification
  parentsCertified: Joi.boolean().required(),
  partnerParentsCertified: Joi.boolean().required(),
  
  // Contact Numbers
  parentsMobNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
  partnerParentsMobNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
});

export const validateApplication = (data) => {
  return applicationValidationSchema.validate(data, { abortEarly: false });
};