import { Router } from 'express';

export class SeedRoutes {
  constructor(seedController) {
    this.router = Router();
    this.seedController = seedController;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/', this.seedController.seedDatabase);
    this.router.get('/status', this.seedController.getSeedStatus);
  }

  getRouter() {
    return this.router;
  }
}
