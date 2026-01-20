import { DataTypes } from "sequelize";
import connectDB from "../Utils/db.js";

const sequelize = connectDB();

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    planId: {
      type: DataTypes.UUID,
      allowNull: false,
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

    // Address
    villageCityTown: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pincode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: [6, 6],
        isNumeric: true,
      },
    },

    // Penalty Type
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

    yourMobNo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [10, 10],
        isNumeric: true,
      },
    },

    // Marriage Venue Address
    venueName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    venueVillageCityTown: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    venueDistrict: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    venueState: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    venueCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    venuePincode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      validate: {
        len: [6, 6],
        isNumeric: true,
      },
    },

    // Status
    status: {
      type: DataTypes.ENUM(
        "pending",
        "under_review",
        "approved",
        "rejected",
        "completed"
      ),
      defaultValue: "pending",
    },
  // Payment Information
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
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
    defaultValue: 0.00,
  },
}, {
  tableName: 'applications',
  timestamps: true,
});

export default Application;