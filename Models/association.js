import User from './user.js';
import Answer from './answer.model.js';
import otherDetails from './otherDetails.model.js';
import locationDetails from './locationDetails.model.js';
import imageUpload from './imageUpload.model.js';
import qualificationDetails from './qualificationDetails.model.js';
import personalDetails from './personalDetails.model.js';


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




export { User, Answer, personalDetails, otherDetails, locationDetails, imageUpload, qualificationDetails };
