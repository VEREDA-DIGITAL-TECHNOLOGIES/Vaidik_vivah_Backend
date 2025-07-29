import User from './user.js';
import Answer from './answer.model.js';
import otherDetails from './otherDetails.model.js';
import locationDetails from './locationDetails.model.js';
import imageUpload from './imageUpload.model.js';
import qualificationDetails from './qualificationDetails.model.js';
import personalDetails from './personalDetails.model.js';
import FavProfile from './favProfile.model.js';
import happyStories from './happyStories.model.js';
import Connection from './connection.model.js';
import Plan from './plan.model.js';
import Subscription from './subscription.model.js';
import dropdown from './dropdown.model.js';
import Notification from './notification.model.js';
import dropDownType from './dropdowntype.model.js';
import ToggleSection from './toggleSection.model.js';
import gayatri from './gayatri.model.js';
import documentUpload from './document.upload.js';
import Recommendation from './recommendation.model.js';
import Call from './call.model.js';

// Answers
User.hasMany(Answer, { foreignKey: 'userId', as: 'answers' });
Answer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Personal Details
User.hasMany(personalDetails, { foreignKey: 'userId', as: 'personalDetails' });
personalDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Other Details
User.hasMany(otherDetails, { foreignKey: 'userId', as: 'otherDetails' });
otherDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });



// Calls
User.hasMany(Call, { foreignKey: 'userId', as: 'calls', onDelete: 'CASCADE' }); // Optional: CASCADE
Call.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// Gayatri
User.hasMany(gayatri, { foreignKey: 'userId', as: 'gayatri' });
gayatri.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Location Details
User.hasMany(locationDetails, { foreignKey: 'userId', as: 'locationDetails' });
locationDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Image Uploads
User.hasMany(imageUpload, { foreignKey: 'userId', as: 'imageUpload' });
imageUpload.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Qualification Details
User.hasMany(qualificationDetails, { foreignKey: 'userId', as: 'qualificationDetails' });
qualificationDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Favorites
User.hasMany(FavProfile, { foreignKey: 'favoritingUserId', as: 'FavoritingProfiles' });
FavProfile.belongsTo(User, { foreignKey: 'favoritingUserId', as: 'FavoritingUser' });

User.hasMany(FavProfile, { foreignKey: 'favoritedUserId', as: 'FavoritedProfiles' });
FavProfile.belongsTo(User, { foreignKey: 'favoritedUserId', as: 'FavoritedUser' });

// Happy Stories
User.hasMany(happyStories, { foreignKey: 'userId', as: 'happyStories' });
happyStories.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Connections
User.hasMany(Connection, { foreignKey: 'senderId', as: 'SentConnections' });
User.hasMany(Connection, { foreignKey: 'receiverId', as: 'ReceivedConnections' });

Connection.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
Connection.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });

// Plans
User.belongsTo(Plan, { foreignKey: 'planId', as: 'plans' });
Plan.hasMany(User, { foreignKey: 'planId', as: 'users' });

// Subscriptions ✅ FIXED
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' }); // ✅ ADDED THIS
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'users' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plans' });

// Dropdowns
dropdown.belongsTo(dropDownType, { foreignKey: 'dropDownTypeId', as: 'dropDownType' });
dropDownType.hasMany(dropdown, { foreignKey: 'dropDownTypeId', as: 'dropdowns' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Toggle Sections
User.hasMany(ToggleSection, { foreignKey: 'userId', as: 'toggleSections' });
ToggleSection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Document Uploads
User.hasMany(documentUpload, { foreignKey: 'userId', as: 'documents' });
documentUpload.belongsTo(User, { foreignKey: 'userId', as: 'user' }); // Optional

User.hasMany(Recommendation, { foreignKey: 'userId', as: 'recommendations' });
Recommendation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Final Export
export {
  User,
  Answer,
  personalDetails,
  otherDetails,
  documentUpload,
  locationDetails,
  imageUpload,
  qualificationDetails,
  FavProfile,
  happyStories,
  Connection,
  Plan,
  Subscription,
  dropdown,
  dropDownType,
  Notification,
  ToggleSection,
  gayatri,
  Recommendation,
  Call
};
