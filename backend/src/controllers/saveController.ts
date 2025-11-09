import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { IDData, IIDData } from '../models/IDData.js';
import { z } from 'zod';

// Validation schema for ID data
const idDataSchema = z.object({
  id: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').max(100),
  firstName: z.string().min(1, 'First name is required').max(100),
  middleInitial: z.string().max(1).optional(),
  addressStreet: z.string().max(200).optional(),
  addressCity: z.string().max(100).optional(),
  addressState: z.string().max(50).optional(),
  addressZip: z.string().max(20).optional(),
  sex: z.enum(['M', 'F', 'Male', 'Female']).optional(),
  dob: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  sourceFileName: z.string().max(255).optional()
});

export const saveController = {
  // POST /api/id/save - Save extracted or corrected ID data
  saveData: asyncHandler(async (req: Request, res: Response) => {
    // Validate input data
    const validationResult = idDataSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw createError(`Validation Error: ${errorMessage}`, 400);
    }

    const data = validationResult.data;

    try {
      // Create new ID data document
      const newIDData: IIDData = new IDData({
        ...data,
        extractedAt: new Date(),
        lastModified: new Date(),
        isManuallyEdited: false // Will be updated to true if edited via frontend
      });

      // Save to database
      const savedData = await newIDData.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'ID data saved successfully',
        data: {
          id: savedData._id,
          extractedData: {
            id: savedData.id,
            lastName: savedData.lastName,
            firstName: savedData.firstName,
            middleInitial: savedData.middleInitial,
            addressStreet: savedData.addressStreet,
            addressCity: savedData.addressCity,
            addressState: savedData.addressState,
            addressZip: savedData.addressZip,
            sex: savedData.sex,
            dob: savedData.dob,
            confidence: savedData.confidence
          },
          metadata: {
            sourceFileName: savedData.sourceFileName,
            extractedAt: savedData.extractedAt,
            lastModified: savedData.lastModified,
            isManuallyEdited: savedData.isManuallyEdited
          }
        }
      });

    } catch (error: any) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const mongoErrors = Object.values(error.errors).map((err: any) => err.message);
        throw createError(`Database validation error: ${mongoErrors.join(', ')}`, 400);
      } else if (error.code === 11000) {
        // Duplicate key error
        throw createError('Duplicate entry found', 409);
      } else if (error.name === 'CastError') {
        throw createError('Invalid data format', 400);
      }
      throw error;
    }
  }),

  // GET /api/id - Retrieve all saved ID data (for admin/testing purposes)
  getAllData: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      IDData.find()
        .sort({ extractedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      IDData.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: data.map(item => ({
        id: item._id,
        extractedData: {
          id: item.id,
          lastName: item.lastName,
          firstName: item.firstName,
          middleInitial: item.middleInitial,
          addressStreet: item.addressStreet,
          addressCity: item.addressCity,
          addressState: item.addressState,
          addressZip: item.addressZip,
          sex: item.sex,
          dob: item.dob,
          confidence: item.confidence
        },
        metadata: {
          sourceFileName: item.sourceFileName,
          extractedAt: item.extractedAt,
          lastModified: item.lastModified,
          isManuallyEdited: item.isManuallyEdited
        }
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasMore: page * limit < total
      }
    });
  }),

  // GET /api/id/search - Search ID data by name or ID number
  searchData: asyncHandler(async (req: Request, res: Response) => {
    const searchTerm = req.query.q as string;
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw createError('Search term must be at least 2 characters long', 400);
    }

    const data = await (IDData as any).findBySearchTerm(searchTerm.trim());

    res.status(200).json({
      success: true,
      data: data.map(item => ({
        id: item._id,
        extractedData: {
          id: item.id,
          lastName: item.lastName,
          firstName: item.firstName,
          middleInitial: item.middleInitial,
          addressStreet: item.addressStreet,
          addressCity: item.addressCity,
          addressState: item.addressState,
          addressZip: item.addressZip,
          sex: item.sex,
          dob: item.dob,
          confidence: item.confidence
        },
        metadata: {
          sourceFileName: item.sourceFileName,
          extractedAt: item.extractedAt,
          lastModified: item.lastModified,
          isManuallyEdited: item.isManuallyEdited
        }
      }))
    });
  }),

  // GET /api/id/:id - Get specific ID data by ID
  getDataById: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createError('Invalid ID format', 400);
    }

    const data = await IDData.findById(id);
    if (!data) {
      throw createError('ID data not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: data._id,
        extractedData: {
          id: data.id,
          lastName: data.lastName,
          firstName: data.firstName,
          middleInitial: data.middleInitial,
          addressStreet: data.addressStreet,
          addressCity: data.addressCity,
          addressState: data.addressState,
          addressZip: data.addressZip,
          sex: data.sex,
          dob: data.dob,
          confidence: data.confidence
        },
        metadata: {
          sourceFileName: data.sourceFileName,
          extractedAt: data.extractedAt,
          lastModified: data.lastModified,
          isManuallyEdited: data.isManuallyEdited
        }
      }
    });
  })
};