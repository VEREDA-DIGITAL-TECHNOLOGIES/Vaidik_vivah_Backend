import { DataTypes } from 'sequelize';
import connectDB from '../Utils/db.js'

const sequelize = connectDB()

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  planId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
    },
  userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: true,
    },
  planName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Personal Information
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  loginId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  
  // Penalty Information
  penaltyType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  
  // Partner Information
  partnerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  partnerFatherName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  partnerLoginId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  partnerAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  yourMobNo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: true,
    },
  },
  partnerMobNo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: true,
    },
  },
  
  // Cloudinary URLs (for uploaded files)
  yourIdPostUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  yourIdPostPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentsIdPostUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentsIdPostPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partnerIdPostUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partnerIdPostPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partnerParentsIdPostUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  partnerParentsIdPostPublicId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Certification
  parentsCertified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  partnerParentsCertified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Contact Numbers
  parentsMobNo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: true,
    },
  },
  partnerParentsMobNo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: true,
    },
  },
  
  // Application Status
  status: {
    type: DataTypes.ENUM(
      'pending',
      'under_review',
      'approved',
      'rejected',
      'completed'
    ),
    defaultValue: 'pending',
  },
  
  // Payment Information
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1000.00,
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Metadata
  applicationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  applicationFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1000.00,
  },
}, {
  tableName: 'applications',
  timestamps: true,
});

export default Application;