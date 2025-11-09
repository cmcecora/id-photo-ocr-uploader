import fs from 'fs';
import path from 'path';
import heicConvert from 'heic-convert';

export class HeicConversionService {
  static async convertHeicToJpeg(heicPath: string): Promise<string> {
    try {
      const heicBuffer = fs.readFileSync(heicPath);

      // Convert HEIC to JPEG
      const jpegBuffer = await heicConvert({
        buffer: heicBuffer,
        format: 'JPEG',
        quality: 0.9
      });

      // Generate new filename with .jpg extension
      const parsedPath = path.parse(heicPath);
      const jpegPath = path.join(parsedPath.dir, `${parsedPath.name}.jpg`);

      // Write JPEG file
      fs.writeFileSync(jpegPath, jpegBuffer);

      // Remove original HEIC file to save space
      fs.unlinkSync(heicPath);

      return jpegPath;
    } catch (error) {
      console.error('HEIC conversion error:', error);
      throw new Error(`Failed to convert HEIC file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async convertIfHeic(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'image/heic') {
      return await this.convertHeicToJpeg(filePath);
    }
    return filePath;
  }
}