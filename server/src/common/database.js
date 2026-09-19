import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseConnection {
  constructor(
    uri = process.env.MONGO_URI ||
      'mongodb+srv://mahendramahara:SattleX-1234@sattlex.1dj9jjc.mongodb.net/settlex?retryWrites=true&w=majority'
  ) {
    this.uri = uri;
    this.isConnected = false;
  }

  resolveFallbackUri(originalUri) {
    if (originalUri && originalUri.includes('sattlex.1dj9jjc.mongodb.net')) {
      const match = originalUri.match(
        /mongodb\+srv:\/\/([^:]+):([^@]+)@sattlex\.1dj9jjc\.mongodb\.net\/?([^?]*)(\?.*)?/
      );
      if (match) {
        const [, user, pass, dbName] = match;
        const targetDb = dbName || 'settlex';
        return `mongodb://${user}:${pass}@ac-pqtl1wt-shard-00-00.1dj9jjc.mongodb.net:27017,ac-pqtl1wt-shard-00-01.1dj9jjc.mongodb.net:27017,ac-pqtl1wt-shard-00-02.1dj9jjc.mongodb.net:27017/${targetDb}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
      }
    }
    return originalUri;
  }

  async connect() {
    if (this.isConnected || mongoose.connection.readyState === 1) {
      this.isConnected = true;
      return mongoose.connection;
    }

    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    };

    try {
      const conn = await mongoose.connect(this.uri, options);
      this.isConnected = true;
      const dbName = mongoose.connection.name || 'settlex';
      process.stdout.write(`Database connected successfully to MongoDB Atlas [${dbName}]\n`);
      return conn;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('querySrv'))) {
        const fallback = this.resolveFallbackUri(this.uri);
        const conn = await mongoose.connect(fallback, options);
        this.isConnected = true;
        const dbName = mongoose.connection.name || 'settlex';
        process.stdout.write(
          `Database connected successfully to MongoDB Atlas via direct replica set [${dbName}]\n`
        );
        return conn;
      }
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected && mongoose.connection.readyState === 0) {
      return;
    }

    await mongoose.disconnect();
    this.isConnected = false;
  }

  getConnectionState() {
    return mongoose.connection.readyState;
  }
}
