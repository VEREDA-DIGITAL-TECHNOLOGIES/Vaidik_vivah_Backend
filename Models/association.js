import User from './user.js';
import Answer from './answer.model.js';

User.hasMany(Answer, { foreignKey: 'userId', as: 'answers' });
Answer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Answer };
