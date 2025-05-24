import mongoose from 'mongoose';

// TODO: Consider implementing adapter pattern
export default class MongoDbService {
  connect(dbConnectionString: string): Promise<mongoose.Mongoose> {
    return mongoose.connect(dbConnectionString);
  }
  closeConnection(): Promise<void> {
    return mongoose.connection.close(false);
  }
}
