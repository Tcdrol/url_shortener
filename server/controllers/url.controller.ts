import { Request, Response, NextFunction } from 'express';
import ShortUrl from '../models/url.model';
import type { IUrlDocument } from '../models/url.model';
import AppError from '../utils/appError';

interface IRequest extends Request {
  body: {
    originalUrl: string;
  };
  params: {
    shortCode: string;
  };
}

// Create a short URL
export const createShortUrl = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return next(new AppError('Please provide a URL', 400));
    }

    // Check if URL already exists
    const existingUrl = await ShortUrl.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        status: 'success',
        data: {
          originalUrl: existingUrl.originalUrl,
          shortUrl: existingUrl.shortCode,
          clicks: existingUrl.clicks,
          lastAccessed: existingUrl.lastAccessed,
          createdAt: existingUrl.createdAt,
        },
      });
    }

    // Create new short URL
    const url = await ShortUrl.create({ originalUrl });

    res.status(201).json({
      status: 'success',
      data: {
        originalUrl: url.originalUrl,
        shortUrl: url.shortCode,
        clicks: url.clicks,
        lastAccessed: url.lastAccessed,
        createdAt: url.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Redirect to original URL
export const redirectToOriginalUrl = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const url = await ShortUrl.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 }, lastAccessed: new Date() },
      { new: true }
    );

    if (!url) {
      return next(new AppError('No URL found with that code', 404));
    }

    res.redirect(url.originalUrl);
  } catch (err) {
    next(err);
  }
};

// Get URL stats
export const getUrlStats = async (req: IRequest, res: Response, next: NextFunction) => {
  try {
    const { shortCode } = req.params;
    const url = await ShortUrl.findOne({ shortCode });

    if (!url) {
      return next(new AppError('No URL found with that code', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        lastAccessed: url.lastAccessed,
        createdAt: url.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all URLs
export const getAllUrls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urls = await ShortUrl.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: urls.length,
      data: urls.map((url: IUrlDocument) => ({
        originalUrl: url.originalUrl,
        shortUrl: url.shortCode,
        clicks: url.clicks,
        lastAccessed: url.lastAccessed,
        createdAt: url.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlStats,
  getAllUrls,
};
