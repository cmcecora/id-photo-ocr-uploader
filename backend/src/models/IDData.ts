import mongoose, { Document, Schema } from 'mongoose';

export interface IIDData extends Document {
  // Personal Information
  id?: string;
  lastName: string;
  firstName: string;
  middleInitial?: string;

  // Address Information
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;

  // Additional Information
  sex?: string;
  dob?: string;

  // Metadata
  confidence?: number;
  sourceFileName?: string;
  extractedAt: Date;
  lastModified: Date;
  isManuallyEdited: boolean;
}

const IDDataSchema: Schema = new Schema({
  // Personal Information
  id: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: 100
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: 100
  },
  middleInitial: {
    type: String,
    trim: true,
    maxlength: 1,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[A-Z]$/.test(v);
      },
      message: 'Middle initial must be a single letter'
    }
  },

  // Address Information
  addressStreet: {
    type: String,
    trim: true,
    maxlength: 200
  },
  addressCity: {
    type: String,
    trim: true,
    maxlength: 100
  },
  addressState: {
    type: String,
    trim: true,
    maxlength: 50
  },
  addressZip: {
    type: String,
    trim: true,
    maxlength: 20,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{5}(-\d{4})?$/.test(v);
      },
      message: 'Invalid ZIP code format'
    }
  },

  // Additional Information
  sex: {
    type: String,
    enum: ['M', 'F', 'Male', 'Female'],
    uppercase: true,
    trim: true
  },
  dob: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true;
        // Accept YYYY-MM-DD, MM/DD/YYYY, or other common formats
        const dateRegex = /^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/;
        return dateRegex.test(v);
      },
      message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY'
    }
  },

  // Metadata
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  sourceFileName: {
    type: String,
    trim: true,
    maxlength: 255
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isManuallyEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
IDDataSchema.index({ lastName: 1, firstName: 1 });
IDDataSchema.index({ id: 1 });
IDDataSchema.index({ extractedAt: -1 });
IDDataSchema.index({ isManuallyEdited: 1 });

// Pre-save middleware to update lastModified
IDDataSchema.pre('save', function(next) {
  this.lastModified = new Date();
  if (this.isModified('lastName') || this.isModified('firstName') ||
      this.isModified('id') || this.isModified('addressStreet')) {
    this.isManuallyEdited = true;
  }
  next();
});

// Static method to find by ID or name
IDDataSchema.statics.findBySearchTerm = function(searchTerm: string) {
  return this.find({
    $or: [
      { id: { $regex: searchTerm, $options: 'i' } },
      { lastName: { $regex: searchTerm, $options: 'i' } },
      { firstName: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ extractedAt: -1 });
};

export const IDData = mongoose.model<IIDData>('IDData', IDDataSchema);