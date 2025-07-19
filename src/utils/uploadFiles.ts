import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: 'image-uploads',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

export async function uploadAudioToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: 'audio-uploads',
        resource_type: 'video', // Use 'video' for audio files in Cloudinary
        format: 'mp3', // Convert to MP3 for better compatibility
        audio_codec: 'mp3',
        quality: 'auto:good', // Good quality compression
        flags: 'attachment' // Optional: treat as downloadable file
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

// Alternative function with more audio-specific options
export async function uploadAudioToCloudinaryAdvanced(file: File, options?: {
  folder?: string;
  format?: string;
  quality?: string;
  duration?: number;
}) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadOptions = {
    folder: options?.folder || 'audio-uploads',
    resource_type: 'video' as const,
    format: options?.format || 'mp3',
    audio_codec: 'mp3',
    quality: options?.quality || 'auto:good',
    flags: 'attachment',
    // Add transformation for audio optimization
    transformation: [
      {
        audio_codec: 'mp3',
        bit_rate: '128k', // Good quality, reasonable file size
        sample_rate: '44100'
      }
    ]
  };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
