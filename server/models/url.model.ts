import mongoose, { Document, Model } from 'mongoose';
// @ts-ignore - shortid doesn't have proper TypeScript types
import shortid from 'shortid';

// Interface for the URL document
export interface IUrl {
  originalUrl: string;
  shortCode: string;
  clicks: number;
  lastAccessed?: Date;
  createdAt: Date;
}

// Interface for the URL document with Mongoose instance methods
export interface IUrlDocument extends IUrl, Document {
  // Add any instance methods here if needed
}

// Interface for the URL model with static methods
export interface IUrlModel extends Model<IUrlDocument> {
  // Add any static methods here if needed
}

const urlSchema = new mongoose.Schema<IUrlDocument, IUrlModel>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      default: () => shortid.generate(),
    },
    clicks: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: false,
  }
);

// Indexes
urlSchema.index({ shortCode: 1 });
urlSchema.index({ createdAt: 1 });

// Update lastAccessed timestamp before saving
urlSchema.pre<IUrlDocument>('save', function (next) {
  this.lastAccessed = new Date();
  next();
});

// Create and export the model
const ShortUrl = mongoose.model<IUrlDocument, IUrlModel>('ShortUrl', urlSchema);

export default ShortUrl;
