/**
 * Client-side image compressor using HTML5 Canvas.
 * Resizes and compresses images to lightweight WebP/JPEG data URLs
 * to ensure payloads stay well within the 1MB request body limit.
 */

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  squareCrop?: boolean;
}

/**
 * Compresses an image file specifically tailored for avatars (center-cropped square, max 320x320, WebP/JPEG).
 * Produces ~15KB - 40KB base64 string from any source size.
 */
export async function compressImageToAvatar(
  file: File,
  maxDimension = 320,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP, GIF)'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดในการอ่านไฟล์รูปภาพ'));

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไม่สามารถโหลดข้อมูลรูปภาพเพื่อประมวลผลได้'));

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          // Center crop to a perfect square
          const minSide = Math.min(width, height);
          const startX = (width - minSide) / 2;
          const startY = (height - minSide) / 2;

          // Scale down if larger than maxDimension
          const targetSize = Math.min(maxDimension, minSide);

          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('เบราว์เซอร์ไม่รองรับ Canvas สำหรับย่อรูปภาพ'));
            return;
          }

          // High quality smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            img,
            startX,
            startY,
            minSide,
            minSide,
            0,
            0,
            targetSize,
            targetSize
          );

          // Try modern webp first, fallback to jpeg
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
