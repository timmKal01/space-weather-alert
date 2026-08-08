import { Actor, log } from 'apify';
import { fetchLatestKp, fetchLatestXrayFlux, fetchAlerts, classifyFlareClass, classifyRScale, auroraVisibleLatitude } from './noaa.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { maxAlerts = 10 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const SNAPSHOT_EVENT = 'space-weather-snapshot';

let kp = null;
try {
    kp = await fetchLatestKp();
} catch (err) {
    log.warning('Kp index fetch failed', { error: err.message });
}

let xray = null;
try {
    xray = await fetchLatestXrayFlux();
} catch (err) {
    log.warning('X-ray flux fetch failed', { error: err.message });
}

let alerts = [];
try {
    alerts = await fetchAlerts(maxAlerts);
} catch (err) {
    log.warning('Alerts fetch failed', { error: err.message });
}

const rScale = classifyRScale(xray?.flux);

await Actor.pushData({
    geomagnetic: {
        kpIndex: kp?.value ?? null,
        observedAt: kp?.timeTag ?? null,
        auroraVisibleLatitude: auroraVisibleLatitude(kp?.value),
    },
    radioBlackout: {
        xrayFlux: xray?.flux ?? null,
        flareClass: classifyFlareClass(xray?.flux),
        observedAt: xray?.timeTag ?? null,
        rScale: rScale.rScale,
        rScaleDescription: rScale.description,
    },
    activeAlerts: alerts,
    fetchedAt: new Date().toISOString(),
});
await Actor.charge({ eventName: SNAPSHOT_EVENT });

log.info('Space weather snapshot recorded', { kp: kp?.value, rScale: rScale.rScale, alertCount: alerts.length });

await Actor.exit();
