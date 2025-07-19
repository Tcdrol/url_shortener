import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Types } from 'mongoose';
import NodeCache from 'node-cache';
import { getTitleFromUrl } from '../utils/urlUtils.mts';
import ShortUrl, { type IUrlDocument } from '../models/url.model.mts';
import AppError from '../utils/appError.mts';
import { getClientIp, getBaseUrl } from '../utils/requestUtils.mts';

// Initialize cache with 5 minute TTL and check for expired items every 10 minutes
const urlCache = new NodeCache({ 
  stdTTL: 300, 
  checkperiod: 600,
  useClones: false 
});

// Interface for the request with custom properties
interface IRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  body: {
    originalUrl: string;
    customCode?: string;
    expiresIn?: number; // in days
    title?: string;
    description?: string;
    tags?: string[];
  };
  params: {
    shortCode: string;
  };
  query: {
    page?: string;
    limit?: string;
  };
}

// Type guard to check if a value is an IUrlDocument
const isUrlDocument = (value: unknown): value is IUrlDocument => {
  return (
    value !== null &&
    typeof value === 'object' &&
    'originalUrl' in value &&
    'shortCode' in value
  );
};

// Generate cache key for URL
const getCacheKey = (shortCode: string, includeStats = false): string => {
  return includeStats ? `url:stats:${shortCode}` : `url:${shortCode}`;
};

// Validate URL format using URL constructor - exported for testing
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
};

// Create a short URL
export const createShortUrl = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }

    const { originalUrl, customCode, expiresIn, title, description, tags } = req.body;
    const userId = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;

    // Check if URL already exists for this user
    const existingUrl = await ShortUrl.findOne({
      originalUrl,
      ...(userId ? { userId } : {}),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).exec();

    if (existingUrl) {
      return res.status(200).json({
        status: 'success',
        data: formatUrlResponse(existingUrl, req),
      });
    }

    // Prepare URL data
    const urlData: {
      originalUrl: string;
      userId?: Types.ObjectId;
      shortCode?: string;
      expiresAt?: Date;
      metadata: {
        title?: string;
        description?: string;
        tags?: string[];
      };
    } = {
      originalUrl,
      userId,
      metadata: { 
        title, 
        description, 
        ...(tags ? { tags: tags.filter(Boolean) } : {}) 
      },
    };

    // Set custom short code if provided
    if (customCode) {
      // Check if custom code is already in use
      const existingCustomCode = await ShortUrl.findOne({ shortCode: customCode });
      if (existingCustomCode) {
        return next(new AppError('This custom code is already in use', 400));
      }
      urlData.shortCode = customCode;
    }

    // Set expiration if provided
    if (expiresIn) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
      urlData.expiresAt = expiresAt;
    }

    // Create new short URL
    const url = await ShortUrl.create(urlData);

    // Invalidate cache for this URL
    const cacheKey = getCacheKey(url.shortCode);
    urlCache.del(cacheKey);

    // Fetch page title in the background
    if (!title) {
      getTitleFromUrl(originalUrl)
        .then(async (pageTitle: string | null) => {
          if (pageTitle) {
            await ShortUrl.findByIdAndUpdate(url._id, {
              'metadata.title': pageTitle,
            }).exec();
          }
        })
        .catch((err: Error) => {
          console.error('Error fetching page title:', err);
        });
    }

    res.status(201).json({
      status: 'success',
      data: formatUrlResponse(url, req),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return next(AppError.conflict('This short code is already in use'));
    }
    next(AppError.internal('Failed to create short URL', err));
  }
};

// Redirect to original URL
export const redirectToOriginalUrl = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    if (!shortCode) {
      return next(AppError.badRequest('Short code is required'));
    }

    const cacheKey = getCacheKey(shortCode);
    const ip = getClientIp(req);
    const userAgent = req.get('user-agent') || '';
    const referrer = req.get('referer') || '';

    // Try to get from cache first
    const cachedUrl = urlCache.get<IUrlDocument>(cacheKey);
    
    let url = cachedUrl;
    
    if (!cachedUrl) {
      // Not in cache, fetch from database
      const result = await ShortUrl.findOneAndUpdate(
        { 
          shortCode, 
          isActive: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        },
        { 
          $inc: { clicks: 1 }, 
          $set: { lastAccessed: new Date() },
          $push: {
            analytics: {
              timestamp: new Date(),
              ip,
              userAgent,
              referrer,
            },
          },
        },
        { new: true }
      ).exec();

      if (!result) {
        return next(AppError.notFound('No active URL found with that code'));
      }

      url = result;
      // Cache the URL
      urlCache.set(cacheKey, result);
    } else {
      // Update analytics in the background
      ShortUrl.findByIdAndUpdate(
        url._id,
        {
          $inc: { clicks: 1 },
          $set: { lastAccessed: new Date() },
          $push: {
            analytics: {
              timestamp: new Date(),
              ip,
              userAgent,
              referrer,
            },
          },
        }
      ).catch((err: Error) => {
        console.error('Error updating URL analytics:', err);
      });
    }

    if (!url) {
      return next(AppError.notFound('URL not found'));
    }

    // Track the redirect
    res.redirect(302, url.originalUrl);
  } catch (err) {
    next(AppError.internal('Failed to process redirect', err as Error));
  }
};

// Get URL stats
export const getUrlStats = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const cacheKey = getCacheKey(shortCode, true);
    
    // Try to get from cache first
    const cachedStats = urlCache.get(cacheKey);
    
    if (cachedStats) {
      return res.status(200).json({
        status: 'success',
        data: cachedStats,
      });
    }

    const url = await ShortUrl.findOne({ 
      shortCode,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).select('+analytics');

    if (!url) {
      return next(new AppError('No active URL found with that code', 404));
    }

    // Calculate stats
    const stats = {
      ...formatUrlResponse(url, req),
      analytics: {
        totalClicks: url.clicks,
        browsers: getAnalyticsCounts(url.analytics || [], 'userAgent'),
        referrers: getAnalyticsCounts(url.analytics || [], 'referrer'),
        lastDayClicks: (url.analytics || []).filter(
          (a: any) => a.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        lastWeekClicks: (url.analytics || []).filter(
          (a: any) => a.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length,
      },
    };

    // Cache the stats for 5 minutes
    urlCache.set(cacheKey, stats, 300);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

// Get all URLs for a user (paginated)
export const getMyUrls = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('Authentication required', 401));
    }

    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      ShortUrl.find({ 
        userId: req.user.id,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      
      ShortUrl.countDocuments({ 
        userId: req.user.id,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        results: urls.map(url => formatUrlResponse(url, req)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete a URL
export const deleteUrl = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const userId = req.user?.id ? new Types.ObjectId(req.user.id) : null;

    const url = await ShortUrl.findOneAndUpdate(
      { 
        shortCode,
        ...(userId && { userId }), // Only allow owner to delete
      },
      { isActive: false },
      { new: true }
    );

    if (!url) {
      return next(new AppError('No URL found with that code', 404));
    }

    // Invalidate cache
    const cacheKey = getCacheKey(shortCode);
    urlCache.del(cacheKey);
    urlCache.del(getCacheKey(shortCode, true));

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to format URL response
type FormattedUrlResponse = {
  id: Types.ObjectId;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  clicks: number;
  lastAccessed?: Date;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
  };
};

const formatUrlResponse = (url: IUrlDocument, req: IRequest): FormattedUrlResponse => {
  const baseUrl = getBaseUrl(req);
  
  return {
    id: url._id,
    originalUrl: url.originalUrl,
    shortUrl: `${baseUrl}/${url.shortCode}`,
    shortCode: url.shortCode,
    clicks: url.clicks,
    lastAccessed: url.lastAccessed,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    isActive: url.isActive,
    metadata: url.metadata,
  };
};

// Helper function to get analytics counts
interface IAnalytics {
  timestamp: Date;
  ip: string;
  userAgent: string;
  referrer: string;
}

const getAnalyticsCounts = (
  analytics: IAnalytics[] = [], 
  field: keyof IAnalytics
): Array<{ name: string; count: number }> => {
  const counts: Record<string, number> = {};
  
  analytics.forEach(item => {
    const value = item[field]?.toString() || 'Unknown';
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

// Get all URLs
export const getAllUrls = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const urls = await ShortUrl.find({ isActive: true }).exec();

    res.status(200).json({
      status: 'success',
      results: urls.length,
      data: {
        urls: urls.map((url: IUrlDocument) => formatUrlResponse(url, req)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlStats,
  getMyUrls,
  deleteUrl,
  getAllUrls,
};
