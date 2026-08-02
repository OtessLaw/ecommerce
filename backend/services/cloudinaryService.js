class CloudinaryService {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'luxury_cloud';
  }

  getOptimizedUrl(publicId, options = {}) {
    if (!publicId) return '';
    if (publicId.startsWith('http')) return publicId;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/f_auto,q_auto/${publicId}`;
  }
}

module.exports = new CloudinaryService();
