import { Router, Request, Response } from 'express';
import { db } from '../services/db';
import { extractClientIp, resolveIpDetails, parseUserAgent } from '../services/geoService';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                        CLIENT REAL-TIME TRACKING BEACON                    */
/* -------------------------------------------------------------------------- */

// 1. Ingest page visit / route transition
router.post('/track', async (req: Request, res: Response) => {
  try {
    const {
      path = '/',
      site = 'website',
      referrer = 'Direct',
      userName,
      userEmail,
      userUid
    } = req.body;

    const ip = extractClientIp(req);
    const cfCountry = (req.headers['cf-ipcountry'] as string)?.trim();
    const userAgentRaw = (req.headers['user-agent'] as string) || '';

    // Fast parse of Device, OS, and Browser
    const uaInfo = parseUserAgent(userAgentRaw);

    // Asynchronously resolve Geo & ISP (cached in memory)
    const geoInfo = await resolveIpDetails(ip, cfCountry);

    const record = db.recordVisitor({
      ip,
      country: geoInfo.country,
      countryCode: geoInfo.countryCode,
      city: geoInfo.city,
      region: geoInfo.region,
      isp: geoInfo.isp,
      org: geoInfo.org,
      asn: geoInfo.asn,
      device: uaInfo.device,
      deviceModel: uaInfo.deviceModel,
      browser: uaInfo.browser,
      os: uaInfo.os,
      path: String(path).substring(0, 150),
      site: site === 'dashboard' ? 'dashboard' : 'website',
      referrer: String(referrer).substring(0, 200),
      userAgent: userAgentRaw.substring(0, 300),
      userName: userName ? String(userName).trim() : undefined,
      userEmail: userEmail ? String(userEmail).trim() : undefined,
      userUid: userUid ? String(userUid).trim() : undefined
    });

    res.json({
      success: true,
      id: record.id,
      ip: record.ip,
      country: record.country,
      city: record.city,
      isp: record.isp
    });
  } catch (err: any) {
    console.error('Error tracking visitor:', err);
    res.status(500).json({ error: 'Failed to record visitor telemetry' });
  }
});

/* -------------------------------------------------------------------------- */
/*                         ADMIN ANALYTICS & RADAR API                        */
/* -------------------------------------------------------------------------- */

// 2. Retrieve live visitor radar & statistics
router.get('/visitors', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Math.min(parseInt(String(req.query.limit), 10), 500) : 100;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const filter = req.query.filter ? String(req.query.filter).trim() : undefined;

    const visitors = db.getVisitorLogs(limit, search, filter);
    const analytics = db.getVisitorAnalytics();

    res.json({
      success: true,
      analytics,
      visitors
    });
  } catch (err: any) {
    console.error('Error retrieving visitor analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve visitor telemetry' });
  }
});

// 3. Clear visitor history (Admin Maintenance)
router.delete('/visitors', (_req: Request, res: Response) => {
  try {
    db.clearVisitorLogs();
    res.json({ success: true, message: 'Visitor telemetry successfully reset.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear visitor history.' });
  }
});

export default router;
