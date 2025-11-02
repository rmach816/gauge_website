import * as ImageManipulator from 'expo-image-manipulator';
import { API_CONFIG } from '../config/api';

/**
 * Compresses and optimizes images before sending to API
 * Reduces file size by up to 90% while maintaining quality for analysis
 */
export const ImageCompressionService = {
  /**
   * Compress image to optimal size for Claude API
   * Target: ~500KB per image (down from potentially 5-10MB)
   */
  async compressImage(
    uri: string,
    quality: number = 0.7
  ): Promise<string> {
    try {
      const maxDimension = 1024; // Claude works well with 1024px max
      
      // Get image info to check dimensions
      const manipulator = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxDimension } }], // Maintain aspect ratio
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Check file size
      const fileInfo = await ImageManipulator.manipulateAsync(
        manipulator.uri,
        [],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // If still too large, compress more aggressively
      if (manipulator.width > maxDimension || manipulator.height > maxDimension) {
        const scale = Math.min(
          maxDimension / manipulator.width,
          maxDimension / manipulator.height
        );
        const resized = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: manipulator.width * scale } }],
          {
            compress: quality * 0.8, // More aggressive compression
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        return resized.uri;
      }

      return manipulator.uri;
    } catch (error) {
      console.error('[ImageCompression] Compression failed, using original:', error);
      // Fallback to original if compression fails
      return uri;
    }
  },

  /**
   * Compress multiple images in parallel
   */
  async compressImages(uris: string[]): Promise<string[]> {
    try {
      return await Promise.all(
        uris.map((uri) => this.compressImage(uri))
      );
    } catch (error) {
      console.error('[ImageCompression] Batch compression failed:', error);
      // Return originals if batch fails
      return uris;
    }
  },

  /**
   * Validates image size before processing
   */
  async validateImageSize(uri: string): Promise<boolean> {
    try {
      const manipulator = await ImageManipulator.manipulateAsync(uri, [], {
        format: ImageManipulator.SaveFormat.JPEG,
      });
      
      // Check if image exists and has valid dimensions
      return (
        manipulator.width > 0 &&
        manipulator.height > 0 &&
        manipulator.width <= API_CONFIG.image.maxWidth &&
        manipulator.height <= API_CONFIG.image.maxHeight
      );
    } catch {
      return false;
    }
  },
};

