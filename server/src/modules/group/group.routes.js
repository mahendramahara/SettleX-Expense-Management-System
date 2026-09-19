import { Router } from 'express';

export class GroupRoutes {
  constructor(groupController, authMiddleware) {
    this.router = Router();
    this.groupController = groupController;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.authMiddleware.authenticate);

    this.router.post('/', this.authMiddleware.requireVerified, this.groupController.createGroup);
    this.router.get('/', (req, res, next) => {
      if (req.query.limit !== undefined || req.query.search !== undefined || req.query.userId !== undefined || req.admin) {
        return this.groupController.listAllGroups(req, res, next);
      }
      return this.groupController.getUserGroups(req, res, next);
    });
    this.router.get('/:id', this.groupController.getGroupById);
    this.router.put('/:id', this.groupController.updateGroup);
    this.router.delete('/:id', this.groupController.deleteGroup);
    this.router.post(
      '/:id/members',
      this.authMiddleware.requireVerified,
      this.groupController.addMember
    );
  }

  getRouter() {
    return this.router;
  }
}
