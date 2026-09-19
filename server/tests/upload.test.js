import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { CloudinaryService } from '../src/common/cloudinary.service.js';
import { UploadController } from '../src/modules/upload/upload.controller.js';

describe('Cloudinary Service & Upload Controller', () => {
  it('should generate simulated signature when credentials are not set', () => {
    const service = new CloudinaryService({ cloudName: '', apiKey: '', apiSecret: '' });
    expect(service.isConfigured()).toBe(false);

    const sig = service.generateSignature('settlex/groups');
    expect(sig).toHaveProperty('timestamp');
    expect(sig).toHaveProperty('signature', 'simulated_signature');
    expect(sig).toHaveProperty('isSimulated', true);
  });

  it('should generate real signature structure when credentials are configured', () => {
    const service = new CloudinaryService({
      cloudName: 'test_cloud',
      apiKey: 'test_key',
      apiSecret: 'test_secret',
    });
    expect(service.isConfigured()).toBe(true);

    const sig = service.generateSignature('settlex/groups');
    expect(sig).toHaveProperty('timestamp');
    expect(sig).toHaveProperty('signature');
    expect(sig.signature).not.toBe('simulated_signature');
    expect(sig.apiKey).toBe('test_key');
    expect(sig.cloudName).toBe('test_cloud');
    expect(sig.isSimulated).toBe(false);
  });

  it('should return simulated image fallback on uploadBase64 when unconfigured', async () => {
    const service = new CloudinaryService({});
    const result = await service.uploadBase64('data:image/png;base64,sampledata');
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('isSimulated', true);
    expect(result.url).toContain('https://images.unsplash.com');
  });

  it('should return simulated image fallback on uploadFilePath when unconfigured', async () => {
    const service = new CloudinaryService({});
    const tempFile = path.join(os.tmpdir(), `test-file-${Date.now()}.jpg`);
    await fs.promises.writeFile(tempFile, 'fake image data');

    try {
      const result = await service.uploadFilePath(tempFile);
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('isSimulated', true);
    } finally {
      await fs.promises.unlink(tempFile).catch(() => {});
    }
  });

  it('should upload temporary disk file via UploadController and unlink it afterwards', async () => {
    const service = new CloudinaryService({});
    const controller = new UploadController(service);

    const tempFile = path.join(os.tmpdir(), `temp-upload-${Date.now()}.png`);
    await fs.promises.writeFile(tempFile, 'temporary image bytes');

    expect(fs.existsSync(tempFile)).toBe(true);

    const req = {
      file: { path: tempFile, originalname: 'sample.png' },
      body: { folder: 'settlex/test' },
    };

    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await controller.uploadImage(req, res, () => {});

    expect(responseStatus).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toHaveProperty('url');
    expect(fs.existsSync(tempFile)).toBe(false);
  });

  it('should handle getSignature endpoint in UploadController', async () => {
    const service = new CloudinaryService({});
    const controller = new UploadController(service);

    const req = { query: { folder: 'settlex/test' } };
    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await controller.getSignature(req, res, () => {});
    expect(responseStatus).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toHaveProperty('signature');
  });

  it('should reject upload without image data in UploadController', async () => {
    const service = new CloudinaryService({});
    const controller = new UploadController(service);

    const req = { body: {} };
    let responseStatus = 0;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    await controller.uploadImage(req, res, () => {});
    expect(responseStatus).toBe(400);
    expect(responseData.success).toBe(false);
  });
});
