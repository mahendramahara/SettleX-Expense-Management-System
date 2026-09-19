import fs from 'fs';

export class UploadController {
  constructor(cloudinaryService) {
    this.cloudinaryService = cloudinaryService;
    this.getSignature = this.getSignature.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  async getSignature(req, res, next) {
    try {
      const folder = req.query.folder || 'settlex/groups';
      const signatureData = this.cloudinaryService.generateSignature(folder);
      res.status(200).json({
        success: true,
        data: signatureData,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req, res, next) {
    const folder = req.body.folder || 'settlex/groups';

    try {
      if (req.file) {
        try {
          const result = await this.cloudinaryService.uploadFilePath(req.file.path, folder);
          return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: result,
          });
        } finally {
          if (req.file.path) {
            await fs.promises.unlink(req.file.path).catch(() => {});
          }
        }
      }

      const { image } = req.body;
      if (image) {
        const result = await this.cloudinaryService.uploadBase64(image, folder);
        return res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          data: result,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Image file or image data is required',
      });
    } catch (error) {
      next(error);
    }
  }
}
