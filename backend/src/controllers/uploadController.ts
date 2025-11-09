import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { HeicConversionService } from '../services/heicConversionService.js';
import { AnthropicService } from '../services/anthropicService.js';
import fs from 'fs';
import path from 'path';

export const uploadController = {
  uploadAndExtract: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    try {
      let imagePath = req.file.path;
      const originalMimeType = req.file.mimetype;

      // Convert HEIC to JPEG if necessary
      if (originalMimeType === 'image/heic') {
        imagePath = await HeicConversionService.convertIfHeic(imagePath, originalMimeType);
      }

      // Perform OCR using Anthropic
      const extractedData = await AnthropicService.extractTextFromImage(imagePath);

      // Clean up uploaded file after processing
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }

      // Return successful response
      res.status(200).json({
        success: true,
        data: {
          extractedData,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: originalMimeType
        }
      });

    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file on error:', cleanupError);
        }
      }
      throw error;
    }
  })
};