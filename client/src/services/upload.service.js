import { httpClient } from './httpClient.js';

export const uploadService = {
  getSignature: (folder = 'settlex/groups') =>
    httpClient.request(`/upload/signature?folder=${encodeURIComponent(folder)}`),

  uploadFile: (file, folder = 'settlex/groups') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return httpClient.request('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  uploadImage: (image, folder = 'settlex/groups') =>
    httpClient.request('/upload', {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    }),

  uploadDirectToCloudinary: async (file, signatureData) => {
    if (!signatureData || signatureData.isSimulated) {
      return {
        url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        publicId: `sim_${Date.now()}`,
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await res.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
    };
  },
};

export default uploadService;
