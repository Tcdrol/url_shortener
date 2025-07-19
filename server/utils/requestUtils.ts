import { Request } from 'express';

/**
 * Extracts the client's IP address from the request
 * @param req Express request object
 * @returns The client's IP address
 */
export const getClientIp = (req: Request): string => {
  // Get IP from headers (when behind a proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded)) {
    return forwarded[0].split(',')[0].trim();
  }
  
  // Get IP from connection
  const socket = req.socket;
  if (socket?.remoteAddress) {
    return socket.remoteAddress;
  }
  
  // Fallback to default
  return '0.0.0.0';
};

/**
 * Gets the user agent from the request
 * @param req Express request object
 * @returns The user agent string or 'unknown'
 */
export const getUserAgent = (req: Request): string => {
  return req.get('user-agent') || 'unknown';
};

/**
 * Gets the referrer from the request
 * @param req Express request object
 * @returns The referrer URL or null
 */
export const getReferrer = (req: Request): string | null => {
  return req.get('referer') || req.get('origin') || null;
};

/**
 * Gets the base URL from the request
 * @param req Express request object
 * @returns The base URL (e.g., 'https://example.com')
 */
export const getBaseUrl = (req: Request): string => {
  const protocol = req.protocol;
  const host = req.get('host') || '';
  return `${protocol}://${host}`;
};

/**
 * Checks if the request is from a bot/crawler
 * @param userAgent The user agent string
 * @returns boolean indicating if the request is from a bot
 */
export const isBotRequest = (userAgent: string): boolean => {
  if (!userAgent) return false;
  
  const bots = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'exabot', 'facebot', 'ia_archiver',
    'ahrefs', 'semrush', 'mj12bot', 'dotbot', 'rogerbot', 'seznambot',
    'ccbot', 'gigabot', 'sitecheck', 'nutch', 'spider', 'crawler',
    'monitor', 'archive', 'tracker', 'scraper', 'checker', 'monitor'
  ];
  
  const ua = userAgent.toLowerCase();
  return bots.some(bot => ua.includes(bot));
};

/**
 * Gets the device type from the user agent
 * @param userAgent The user agent string
 * @returns The device type ('mobile', 'tablet', 'desktop', or 'unknown')
 */
export const getDeviceType = (userAgent: string): string => {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};
