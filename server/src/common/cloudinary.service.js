import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  constructor(config = {}) {
    this.cloudName = config.cloudName || process.env.CLOUDINARY_CLOUD_NAME || '';
    this.apiKey = config.apiKey || process.env.CLOUDINARY_API_KEY || '';
    this.apiSecret = config.apiSecret || process.env.CLOUDINARY_API_SECRET || '';

    if (this.cloudName && this.apiKey && this.apiSecret) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
      });
    }
  }

  isConfigured() {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret);
  }

  generateSignature(folder = 'settlex/groups') {
    const timestamp = Math.round(Date.now() / 1000);
    if (!this.isConfigured()) {
      return {
        timestamp,
        signature: 'simulated_signature',
        apiKey: this.apiKey || 'simulated_key',
        cloudName: this.cloudName || 'settlex',
        folder,
        isSimulated: true,
      };
    }

    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, this.apiSecret);

    return {
      timestamp,
      signature,
      apiKey: this.apiKey,
      cloudName: this.cloudName,
      folder,
      isSimulated: false,
    };
  }

  async uploadStream(buffer, folder = 'settlex/groups') {
    if (!this.isConfigured()) {
      return {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        publicId: `simulated_${Date.now()}`,
        isSimulated: true,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            isSimulated: false,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  async uploadBase64(base64String, folder = 'settlex/groups') {
    if (!this.isConfigured()) {
      return {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        publicId: `simulated_${Date.now()}`,
        isSimulated: true,
      };
    }

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      isSimulated: false,
    };
  }

  async uploadFilePath(filePath, folder = 'settlex/groups') {
    if (!this.isConfigured()) {
      return {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        publicId: `simulated_${Date.now()}`,
        isSimulated: true,
      };
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      isSimulated: false,
    };
  }
}

export const cloudinaryService = new CloudinaryService();
