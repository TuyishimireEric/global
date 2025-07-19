"use server";

import { uploadToCloudinary, uploadAudioToCloudinary } from "@/utils/uploadFiles";

interface UploadResponse {
  success: boolean;
  image?: { secure_url: string };
  error?: string;
}

interface AudioUploadResponse {
  success: boolean;
  audio?: { 
    secure_url: string; 
    public_id: string;
    duration?: number;
    format?: string;
  };
  error?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No file uploaded" };
  }

  try {
    const result = await uploadToCloudinary(file);

    if (!result || typeof result !== "object" || !("secure_url" in result)) {
      return { success: false, error: "Invalid response from Cloudinary" };
    }

    return {
      success: true,
      image: { secure_url: (result as { secure_url: string }).secure_url },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}

export async function uploadAudio(formData: FormData): Promise<AudioUploadResponse> {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No audio file uploaded" };
  }

  // Validate file type
  const validAudioTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/m4a',
    'audio/aac'
  ];

  if (!validAudioTypes.includes(file.type)) {
    return { 
      success: false, 
      error: "Invalid audio file type. Please upload MP3, WAV, OGG, or M4A files." 
    };
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { 
      success: false, 
      error: "Audio file too large. Maximum size is 10MB." 
    };
  }

  try {
    const result = await uploadAudioToCloudinary(file);

    if (!result || typeof result !== "object" || !("secure_url" in result)) {
      return { success: false, error: "Invalid response from Cloudinary" };
    }

    const cloudinaryResult = result as { 
      secure_url: string; 
      public_id: string;
      duration?: number;
      format?: string;
    };

    return {
      success: true,
      audio: {
        secure_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration,
        format: cloudinaryResult.format
      },
    };
  } catch (error) {
    console.error("Audio upload error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Audio upload failed" 
    };
  }
}

// Alternative audio upload with custom options
export async function uploadAudioWithOptions(
  formData: FormData,
  options?: {
    folder?: string;
    format?: string;
    quality?: string;
    maxDuration?: number;
  }
): Promise<AudioUploadResponse> {
  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No audio file uploaded" };
  }

  try {
    const result = await uploadAudioToCloudinary(file);

    if (!result || typeof result !== "object" || !("secure_url" in result)) {
      return { success: false, error: "Invalid response from Cloudinary" };
    }

    const cloudinaryResult = result as { 
      secure_url: string; 
      public_id: string;
      duration?: number;
      format?: string;
    };

    // Optional: Check duration limit
    if (options?.maxDuration && cloudinaryResult.duration && cloudinaryResult.duration > options.maxDuration) {
      // Optionally delete the uploaded file if it exceeds duration
      // await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: 'video' });
      return { 
        success: false, 
        error: `Audio duration exceeds maximum limit of ${options.maxDuration} seconds` 
      };
    }

    return {
      success: true,
      audio: {
        secure_url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration,
        format: cloudinaryResult.format
      },
    };
  } catch (error) {
    console.error("Audio upload error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Audio upload failed" 
    };
  }
}
