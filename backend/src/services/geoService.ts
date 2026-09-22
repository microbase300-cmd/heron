import http from 'http';
import { Request } from 'express';

export interface GeoLocationInfo {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  isp: string;
  org?: string;
  asn?: string;
}

export interface UserAgentInfo {
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';
  deviceModel?: string;
  browser: string;
  os: string;
}

// In-memory cache for IP lookups (Zero duplicate API calls)
const geoCache = new Map<string, GeoLocationInfo>();

/**
 * Cleanly extract the real public client IP behind Cloudflare and Nginx
 */
export function extractClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }

  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp && typeof xRealIp === 'string' && xRealIp.trim()) {
    return xRealIp.trim();
  }

  const xForwarded = req.headers['x-forwarded-for'];
  if (xForwarded && typeof xForwarded === 'string') {
    const parts = xForwarded.split(',');
    if (parts[0] && parts[0].trim()) {
      return parts[0].trim();
    }
  }

  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    if (socketIp.startsWith('::ffff:')) {
      return socketIp.substring(7);
    }
    return socketIp;
  }

  return '127.0.0.1';
}

/**
 * Check if IP is private/loopback/local network
 */
function isPrivateIp(ip: string): boolean {
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === 'localhost' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('169.254.')
  ) {
    return true;
  }
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    const second = parseInt(parts[1], 10);
    if (!isNaN(second) && second >= 16 && second <= 31) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve Country, City, and ISP for an IP address
 */
export async function resolveIpDetails(ip: string, cfCountryHeader?: string): Promise<GeoLocationInfo> {
  const cleanIp = ip.trim();

  // Return cached result if already resolved
  if (geoCache.has(cleanIp)) {
    return geoCache.get(cleanIp)!;
  }

  // Handle local or private IP
  if (isPrivateIp(cleanIp)) {
    const localInfo: GeoLocationInfo = {
      country: 'Local Network',
      countryCode: 'LOC',
      city: 'Node Gateway',
      region: 'Internal',
      isp: 'Institutional Loopback / Server Localhost',
      org: 'Heron Gateway'
    };
    geoCache.set(cleanIp, localInfo);
    return localInfo;
  }

  // Query free ip-api with a short 3-second timeout
  try {
    const lookupPromise = new Promise<any>((resolve, reject) => {
      const req = http.get(`http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`, {
        timeout: 3000
      }, (res) => {
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(rawData));
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('IP lookup timeout'));
      });
    });

    const data = await lookupPromise;
    if (data && data.status === 'success') {
      const info: GeoLocationInfo = {
        country: data.country || 'Unknown Country',
        countryCode: data.countryCode || (cfCountryHeader || 'UN'),
        city: data.city || undefined,
        region: data.regionName || undefined,
        isp: data.isp || data.org || 'Standard Internet Provider',
        org: data.org || undefined,
        asn: data.as || undefined
      };
      geoCache.set(cleanIp, info);
      return info;
    }
  } catch (err) {
    // Ignore external API failure and fall back
  }

  // Fallback if lookup failed but Cloudflare provided country
  const fallbackCountry = cfCountryHeader && cfCountryHeader !== 'XX' ? cfCountryHeader : 'International';
  const fallbackInfo: GeoLocationInfo = {
    country: fallbackCountry,
    countryCode: cfCountryHeader || 'UN',
    city: 'Direct Connection',
    isp: 'Global Internet Route'
  };

  geoCache.set(cleanIp, fallbackInfo);
  return fallbackInfo;
}

/**
 * Parse User-Agent string to determine Device, Browser, and OS
 */
export function parseUserAgent(uaString: string = ''): UserAgentInfo {
  const ua = uaString.toLowerCase();

  // 1. Detect Device & Model
  let device: 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' = 'Desktop';
  let deviceModel: string | undefined;

  if (ua.includes('ipad') || ua.includes('tablet') || (ua.includes('android') && !ua.includes('mobile'))) {
    device = 'Tablet';
    deviceModel = ua.includes('ipad') ? 'Apple iPad' : 'Android Tablet';
  } else if (
    ua.includes('mobile') ||
    ua.includes('iphone') ||
    ua.includes('ipod') ||
    ua.includes('android') ||
    ua.includes('blackberry') ||
    ua.includes('samsung')
  ) {
    device = 'Mobile';
    if (ua.includes('iphone')) deviceModel = 'Apple iPhone';
    else if (ua.includes('samsung')) deviceModel = 'Samsung Galaxy';
    else deviceModel = 'Mobile Smartphone';
  } else {
    device = 'Desktop';
    if (ua.includes('macintosh') || ua.includes('mac os')) deviceModel = 'Apple Mac';
    else if (ua.includes('windows')) deviceModel = 'Windows PC';
    else if (ua.includes('linux')) deviceModel = 'Linux Workstation';
  }

  // 2. Detect Operating System
  let os = 'Unknown OS';
  if (ua.includes('windows nt 10.0')) os = 'Windows 10/11';
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  else if (ua.includes('windows nt')) os = 'Windows';
  else if (ua.includes('mac os x')) {
    const match = uaString.match(/Mac OS X ([0-9_]+)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    const match = uaString.match(/OS ([0-9_]+)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (ua.includes('android')) {
    const match = uaString.match(/Android ([0-9.]+)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('cros')) os = 'ChromeOS';

  // 3. Detect Browser
  let browser = 'Unknown Browser';
  if (ua.includes('edg/')) {
    const match = uaString.match(/Edg\/([0-9.]+)/);
    browser = match ? `Edge ${match[1].split('.')[0]}` : 'Microsoft Edge';
  } else if (ua.includes('opr/') || ua.includes('opera/')) {
    browser = 'Opera';
  } else if (ua.includes('chrome/') && !ua.includes('edg/')) {
    const match = uaString.match(/Chrome\/([0-9.]+)/);
    browser = match ? `Chrome ${match[1].split('.')[0]}` : 'Google Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    const match = uaString.match(/Version\/([0-9.]+)/);
    browser = match ? `Safari ${match[1].split('.')[0]}` : 'Apple Safari';
  } else if (ua.includes('firefox/')) {
    const match = uaString.match(/Firefox\/([0-9.]+)/);
    browser = match ? `Firefox ${match[1].split('.')[0]}` : 'Mozilla Firefox';
  }

  return { device, deviceModel, browser, os };
}
