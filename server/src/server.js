import dotenv from 'dotenv';
import { App } from './app.js';

dotenv.config();

export class Server {
  constructor(port = process.env.PORT || 5000, host = process.env.HOST || '0.0.0.0') {
    this.port = port;
    this.host = host;
    this.appInstance = new App();
    this.db = this.appInstance.getDatabase();
    this.server = null;
  }

  async init() {
    if (this.initialized) return;
    await this.db.connect();
    await this.appInstance.getAdminModel().seedDefaultSuperAdmin();
    this.initialized = true;
  }

  async start() {
    try {
      await this.init();

      const expressApp = this.appInstance.getApp();
      const serverUrl = `http://${this.host}:${this.port}`;
      this.server = expressApp.listen(this.port, () => {
        process.stdout.write(`SettleX Server running at: ${serverUrl}\n`);
        process.stdout.write(`API Endpoints accessible at: ${serverUrl}/api\n`);
      });
      return this.server;
    } catch (error) {
      process.stderr.write(`Failed to start server: ${error.message}\n`);
      process.exit(1);
    }
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
    }
    await this.db.disconnect();
  }
}

const serverInstance = new Server();

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  serverInstance.start();
}

const expressApp = serverInstance.appInstance.getApp();

const vercelHandler = async (req, res) => {
  await serverInstance.init();
  return expressApp(req, res);
};

export { serverInstance };

export default vercelHandler;