import mongoose from 'mongoose';

import { MONGODB_URI } from '@config';
import { logger } from 'src/logger';

/* -------------------------------------------------------------------------- */

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    logger.info('MongoDB - Database is connected');
  } catch (exception) {
    logger.error('MongoDB - Database connection error -', exception);
  }
};

export default connectDatabase;
