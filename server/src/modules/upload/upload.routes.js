import { Router } from 'express';
import { uploadMiddleware } from '../../common/upload.middleware.js';

export function createUploadRoutes(uploadController, authenticate) {
  const router = Router();

  const handleTempFileUpload = (req, res, next) => {
    uploadMiddleware.any()(req, res, (err) => {
      if (err) {
        return next(err);
      }
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  };

  router.get('/signature', authenticate, uploadController.getSignature);
  router.post('/', authenticate, handleTempFileUpload, uploadController.uploadImage);

  return router;
}
