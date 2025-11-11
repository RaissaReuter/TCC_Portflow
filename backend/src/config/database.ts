import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    // Se MONGO_USER e MONGO_KEY estão definidos, construir a URI com autenticação
    if (process.env.MONGO_USER && process.env.MONGO_KEY) {
      const mongoUser = process.env.MONGO_USER;
      const mongoKey = process.env.MONGO_KEY;
      const mongoHost = process.env.MONGO_HOST || 'cluster0.mongodb.net';
      const mongoDatabase = process.env.MONGO_DATABASE || 'portflow';
      
      mongoURI = `mongodb+srv://${mongoUser}:${mongoKey}@${mongoHost}/${mongoDatabase}?retryWrites=true&w=majority`;
    }
    
    if (!mongoURI) {
      console.error('MongoDB connection string is not properly configured. Please set MONGO_URI or MONGO_USER/MONGO_KEY in .env file');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;