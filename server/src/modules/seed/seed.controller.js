import { SeedService } from './seed.service.js';

export class SeedController {
  constructor(seedService = new SeedService()) {
    this.seedService = seedService;
    this.seedDatabase = this.seedDatabase.bind(this);
    this.getSeedStatus = this.getSeedStatus.bind(this);
  }

  async seedDatabase(req, res, next) {
    try {
      const counts = await this.seedService.seedAll();
      return res.status(200).json({
        success: true,
        message: 'Mock datasets successfully seeded into MongoDB from server/src/data/mock/',
        data: counts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSeedStatus(req, res, next) {
    try {
      const status = await this.seedService.getSeedStatus();
      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}
