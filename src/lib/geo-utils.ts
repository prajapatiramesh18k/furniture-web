/**
 * Calculate distance in meters between two GPS coordinates using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

export interface SiteLocation {
  _id?: any;
  name: string;
  clientName?: string;
  address?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radiusMeters?: number;
  isActive?: boolean;
}

export interface MatchedSiteResult {
  site: SiteLocation | null;
  distanceMeters: number;
  isWithinRadius: boolean;
  allowedRadius: number;
}

/**
 * Match a user's current GPS coordinates against a list of sites.
 * Finds the nearest active site and determines if the user is inside the geofence.
 */
export function matchNearestSite(
  userLat: number,
  userLng: number,
  sites: SiteLocation[]
): MatchedSiteResult {
  if (!sites || sites.length === 0) {
    return {
      site: null,
      distanceMeters: Infinity,
      isWithinRadius: false,
      allowedRadius: 200,
    };
  }

  let nearestSite: SiteLocation | null = null;
  let minDistance = Infinity;

  for (const site of sites) {
    if (!site.location?.latitude || !site.location?.longitude) continue;

    const dist = calculateDistanceMeters(
      userLat,
      userLng,
      site.location.latitude,
      site.location.longitude
    );

    if (dist < minDistance) {
      minDistance = dist;
      nearestSite = site;
    }
  }

  if (!nearestSite) {
    return {
      site: null,
      distanceMeters: Infinity,
      isWithinRadius: false,
      allowedRadius: 200,
    };
  }

  const allowedRadius = nearestSite.radiusMeters || 200;
  const isWithinRadius = minDistance <= allowedRadius;

  return {
    site: nearestSite,
    distanceMeters: minDistance,
    isWithinRadius,
    allowedRadius,
  };
}

/**
 * Calculate elapsed hours, earned days, and overtime from punch-in and punch-out timestamps.
 */
export function calculateShiftMetrics(
  punchIn: Date,
  punchOut: Date,
  standardHours: number = 8
) {
  const diffMs = punchOut.getTime() - punchIn.getTime();
  if (diffMs <= 0) {
    return { workHours: 0, earnedDays: 0, overtimeHours: 0 };
  }

  const rawHours = diffMs / (1000 * 60 * 60);
  // Round to 2 decimal places (e.g. 8.25 hours = 8 hrs 15 mins)
  const workHours = Math.round(rawHours * 100) / 100;

  let earnedDays = 0;
  let overtimeHours = 0;

  // Standard earned days conversion:
  // >= standardHours - 0.5 (e.g. >= 7.5 hrs for an 8hr shift) counts as 1 full day
  if (workHours >= standardHours - 0.5) {
    earnedDays = 1.0;
    if (workHours > standardHours) {
      overtimeHours = Math.round((workHours - standardHours) * 100) / 100;
    }
  } else if (workHours >= 4) {
    // 4 to 7.4 hrs = 0.5 half day
    earnedDays = 0.5;
  } else {
    // Under 4 hours = proportional (e.g. 2 hrs / 8 = 0.25 day)
    earnedDays = Math.round((workHours / standardHours) * 100) / 100;
  }

  return { workHours, earnedDays, overtimeHours };
}
