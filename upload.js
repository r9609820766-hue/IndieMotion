// ======================================================
// INDIE MOTION - UPLOAD.JS
// Cloudinary Unsigned Upload Helper
// ======================================================

// Cloudinary Configuration (from provided credentials)
const CLOUDINARY_CLOUD_NAME = 'drf0guw5w';
const CLOUDINARY_UPLOAD_PRESET = 'indiemotion_unsigned';

// ======================================================
// MAIN UPLOAD FUNCTION
// ======================================================

/**
 * Upload a file to Cloudinary using unsigned preset
 * @param {File} file - The file to upload (image or video)
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - Returns the secure URL of the uploaded file
 */
async function uploadToCloudinary(file, onProgress = null) {
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Validate file type
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const isImage = allowedImageTypes.includes(file.type);
  const isVideo = allowedVideoTypes.includes(file.type);
  
  if (!isImage && !isVideo) {
    throw new Error('File type not supported. Please upload an image or video file.');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
    
    if (onProgress && typeof onProgress === 'function') {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });
    }
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        let errorMsg = 'Upload failed';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMsg = errorResponse.error?.message || errorMsg;
        } catch (e) {}
        reject(new Error(errorMsg));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error - please check your connection'));
    };
    
    xhr.send(formData);
  });
}

// ======================================================
// CONVENIENCE WRAPPERS
// ======================================================

/**
 * Upload a poster image (with optional progress)
 */
async function uploadPoster(file, onProgress = null) {
  return uploadToCloudinary(file, onProgress);
}

/**
 * Upload a video file (with optional progress)
 */
async function uploadVideo(file, onProgress = null) {
  return uploadToCloudinary(file, onProgress);
}

/**
 * Upload a thumbnail image (same as poster)
 */
async function uploadThumbnail(file, onProgress = null) {
  return uploadToCloudinary(file, onProgress);
}

// ======================================================
// HELPER: FILE VALIDATION BEFORE UPLOAD
// ======================================================

/**
 * Validate file size and type before attempting upload
 * @param {File} file - The file to validate
 * @param {Object} options - { maxSizeMB, allowedTypes }
 * @returns {Object} - { valid: boolean, error: string }
 */
function validateFile(file, options = {}) {
  const maxSizeMB = options.maxSizeMB || 100; // Default 100MB for video
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File too large. Maximum ${maxSizeMB}MB allowed.` };
  }
  
  return { valid: true, error: null };
}

// ======================================================
// EXPORT TO GLOBAL SCOPE (if in browser)
// ======================================================
if (typeof window !== 'undefined') {
  window.CloudinaryUpload = {
    uploadToCloudinary,
    uploadPoster,
    uploadVideo,
    uploadThumbnail,
    validateFile,
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET
  };
}

// For module exports (if used in build systems)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    uploadToCloudinary,
    uploadPoster,
    uploadVideo,
    uploadThumbnail,
    validateFile,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET
  };
}