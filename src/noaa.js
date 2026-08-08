const USER_AGENT = 'SpaceWeatherAlert/0.1 (+contact: space-weather-admin@example.com)';

async function fetchJson(url) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`);
    return res.json();
}

export async function fetchLatestKp() {
    const rows = await fetchJson('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
    const latest = rows.at(-1);
    return { value: latest.Kp, timeTag: latest.time_tag };
}

/** The 0.1-0.8nm (long) channel is GOES's standard band for flare classification. */
export async function fetchLatestXrayFlux() {
    const rows = await fetchJson('https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json');
    const longChannel = rows.filter((r) => r.energy === '0.1-0.8nm');
    const latest = longChannel.at(-1);
    if (!latest) return null;
    return { flux: latest.flux, timeTag: latest.time_tag };
}

export async function fetchAlerts(maxAlerts) {
    const rows = await fetchJson('https://services.swpc.noaa.gov/products/alerts.json');
    return rows.slice(0, maxAlerts).map((r) => ({
        productId: r.product_id,
        issuedAt: r.issue_datetime,
        message: r.message,
    }));
}

/** NOAA GOES X-ray flare class letter + subclass number, e.g. "M2.3". */
export function classifyFlareClass(flux) {
    if (flux == null) return null;
    const bands = [
        ['X', 1e-4],
        ['M', 1e-5],
        ['C', 1e-6],
        ['B', 1e-7],
    ];
    for (const [letter, threshold] of bands) {
        if (flux >= threshold) {
            return `${letter}${(Math.round((flux / threshold) * 10) / 10).toFixed(1)}`;
        }
    }
    return `A${(Math.round((flux / 1e-8) * 10) / 10).toFixed(1)}`;
}

/**
 * NOAA's published R-scale (radio blackout), keyed off GOES long-channel X-ray flux.
 * See https://www.swpc.noaa.gov/noaa-scales-explanation
 */
export function classifyRScale(flux) {
    if (flux == null) return { rScale: null, description: 'No X-ray flux data available' };
    if (flux >= 2e-3) return { rScale: 'R5', description: 'Extreme radio blackout' };
    if (flux >= 1e-3) return { rScale: 'R4', description: 'Severe radio blackout' };
    if (flux >= 1e-4) return { rScale: 'R3', description: 'Strong radio blackout' };
    if (flux >= 4e-5) return { rScale: 'R2', description: 'Moderate radio blackout' };
    if (flux >= 1e-5) return { rScale: 'R1', description: 'Minor radio blackout' };
    return { rScale: 'R0', description: 'No radio blackout' };
}

/**
 * Approximate lowest geomagnetic latitude (degrees) at which aurora is typically visible
 * overhead, by Kp index. Widely published rough guide (e.g. NOAA/Geophysical Institute
 * aurora viewline charts) — real visibility also depends on local light pollution, weather,
 * and time of night, so this is a planning signal, not a guarantee.
 */
const AURORA_VIEWLINE_LATITUDE = [66.5, 64.5, 62.4, 60.4, 58.3, 56.3, 54.2, 52.2, 50.1, 48.1];

export function auroraVisibleLatitude(kp) {
    if (kp == null) return null;
    const rounded = Math.max(0, Math.min(9, Math.round(kp)));
    return AURORA_VIEWLINE_LATITUDE[rounded];
}
