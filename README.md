# Space Weather Alerts: Aurora & Radio Blackout

Current space weather conditions in one row, for ham and HF radio
operators, aurora tour operators and photographers, and teams whose work
depends on GPS or satellite communication. Get the geomagnetic storm
level, how far south the aurora is visible, the solar flare and radio
blackout level, and NOAA's active space weather alerts.

## What you get

One snapshot per run:

- **Geomagnetic Kp index**, plus the latitude the aurora may be visible from, so you get "aurora may be visible above about 54°N" instead of a bare number
- **Solar flare class and NOAA radio blackout level** (R1 to R5, NOAA's own scale), from live GOES X-ray readings
- **Active NOAA space weather alerts, watches and warnings**, most recent first

## Who this is for

- **Ham and HF radio operators** checking propagation and blackouts.
- **Aurora tour operators and photographers** planning by visibility latitude.
- **Drone, survey and satellite communication teams** watching for storms that affect GPS and radio.

## Input

```json
{ "maxAlerts": 10 }
```

| Field | Type | Description |
|---|---|---|
| `maxAlerts` | integer (default `10`) | How many of the most recent NOAA alert/watch/warning messages to include. |

## Output

One record per run:

```json
{
  "rowType": "conditions",
  "geomagnetic": {
    "kpIndex": 4,
    "observedAt": "2026-08-08T00:00:00",
    "auroraVisibleLatitude": 58.3
  },
  "radioBlackout": {
    "xrayFlux": 0.0000253,
    "flareClass": "M2.5",
    "observedAt": "2026-08-08T01:02:00Z",
    "rScale": "R1",
    "rScaleDescription": "Minor radio blackout"
  },
  "activeAlerts": [
    {
      "productId": "K04W",
      "issuedAt": "2026-08-04 08:10:52.687",
      "message": "Space Weather Message Code: WARK04\r\n..."
    }
  ],
  "fetchedAt": "2026-08-08T01:40:00.000Z"
}
```

## How it works

Three direct calls to NOAA's own public JSON feeds — no scraping, no proxy,
no key:

- Kp index: `services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- X-ray flux: `services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json` (the `0.1-0.8nm` long channel, GOES's standard flare-classification band)
- Alerts: `services.swpc.noaa.gov/products/alerts.json`

**R-scale thresholds** and **flare-class letters** follow NOAA's own
published definitions (see
[swpc.noaa.gov/noaa-scales-explanation](https://www.swpc.noaa.gov/noaa-scales-explanation)).
**Aurora-visible latitude** is a widely published approximate viewline table
by Kp index — a planning signal, not a guarantee; local weather, light
pollution, and time of night all matter too.

## Pricing note

Billed per **snapshot** (one run = one charge), regardless of how many
alerts are active. Cheap enough to schedule hourly for continuous
monitoring without the cost multiplying with alert volume.

## Related products

- [US Weather Forecast & Alerts API (NWS)](https://apify.com/m_ctim/us-weather-tracker): ground-level NWS forecasts and alerts for a location
- [Field Ops Risk Briefing](https://apify.com/m_ctim/field-operations-risk-briefing): combines weather with GPS/radio conditions for field crews
