import mongoose, { Document, Model, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

// Custom alphabet for URL-friendly short codes
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(ALPHABET, 8);

// Interface for the URL document
export interface IUrl {
  originalUrl: string;
  shortCode: string;
  userId?: Types.ObjectId;
  clicks: number;
  lastAccessed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the URL document with Mongoose instance methods
export interface IUrlDocument extends IUrl, Document {
  // Virtual property for the short URL
  shortUrl: string;
  
  // Check if URL is expired
  isExpired: boolean;
}

// Interface for the URL model with static methods
export interface IUrlModel extends Model<IUrlDocument> {
  // Generate a unique short code
  generateShortCode(): Promise<string>;
  
  // Find active URL by short code
  findByShortCode(shortCode: string): Promise<IUrlDocument | null>;
}

const urlSchema = new mongoose.Schema<IUrlDocument, IUrlModel>(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          try {
            const url = new URL(v);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch (e) {
            return false;
          }
        },
        message: 'Please provide a valid URL with http:// or https://'
      }
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      minlength: [4, 'Short code must be at least 4 characters'],
      maxlength: [20, 'Short code cannot be more than 20 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, underscores, and hyphens'],
      default: () => nanoid()
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    lastAccessed: {
      type: Date
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 } // TTL index
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    metadata: {
      title: String,
      description: String,
      tags: [String]
    }
  },
  {
    timestamps: true,
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
