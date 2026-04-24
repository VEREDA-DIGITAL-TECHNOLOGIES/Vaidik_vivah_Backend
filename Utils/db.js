import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const connectDB = () => {
  const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.USER,
    process.env.PASSWORD,
    {
      host: process.env.HOST,
      port: 5432,
      dialect: 'postgres',

      logging: false, // ✅ no SQL logs at all
    }
  );

  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected');
    })
    .catch((error) => {
      console.error('❌ Database connection error:', error.message);
      setTimeout(connectDB, 5000);
    });

  return sequelize;
};

export default connectDB;