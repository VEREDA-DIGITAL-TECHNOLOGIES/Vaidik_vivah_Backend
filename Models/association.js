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
import Call from './call.model.js';
import Notification from './notification.model.js';

User.hasMany(Answer, { foreignKey: 'userId', as: 'answers' });
Answer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(personalDetails, { foreignKey: 'userId', as: 'personalDetails' });
personalDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });


User.hasMany(otherDetails, { foreignKey: 'userId', as: 'otherDetails' });
otherDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });


User.hasMany(locationDetails, { foreignKey: 'userId', as: 'locationDetails' });
locationDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(imageUpload, { foreignKey: 'userId', as: 'imageUpload' });
imageUpload.belongsTo(User, { foreignKey: 'userId', as: 'user' });


User.hasMany(qualificationDetails, { foreignKey: 'userId', as: 'qualificationDetails' });
qualificationDetails.belongsTo(User, { foreignKey: 'userId', as: 'user' });


User.hasMany(FavProfile, { foreignKey: 'favoritingUserId', as: 'FavoritingProfiles' });
FavProfile.belongsTo(User, { foreignKey: 'favoritingUserId', as: 'FavoritingUser' });

User.hasMany(FavProfile, { foreignKey: 'favoritedUserId', as: 'FavoritedProfiles' });
FavProfile.belongsTo(User, { foreignKey: 'favoritedUserId', as: 'FavoritedUser' });


User.hasMany(happyStories, { foreignKey: 'userId', as: 'happyStories' });
happyStories.belongsTo(User, { foreignKey: 'userId', as: 'user' });


// A user can send many connection requests (senderId refers to the sender)
User.hasMany(Connection, { foreignKey: 'senderId', as: 'SentConnections' });

// A user can receive many connection requests (receiverId refers to the receiver)
User.hasMany(Connection, { foreignKey: 'receiverId', as: 'ReceivedConnections' });

// Connection belongs to the user who sent the request (senderId)
Connection.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });

// Connection belongs to the user who received the request (receiverId)
Connection.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });



User.belongsTo(Plan, { foreignKey: 'userId', as: 'plan' }); 

Plan.hasMany(User, { foreignKey: 'userId', as: 'users' }); 

Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });













export { User, Answer, personalDetails, otherDetails, locationDetails, imageUpload, qualificationDetails,FavProfile,happyStories,Connection ,Plan,Subscription};
