# Space Weather Alert — Aurora Visibility & HF Radio Blackout

One snapshot combining the space-weather numbers ham radio operators, aurora
chasers, and HF/satellite comms people currently check by hand across
several NOAA pages:

- **Geomagnetic Kp index** — plus a computed aurora-visible latitude, so you
  get "aurora may be visible above ~54°N" instead of a bare number
- **GOES X-ray flare class & NOAA R-scale** — the same R1–R5 radio-blackout
  severity scale NOAA itself publishes, derived from live X-ray flux
- **Active NOAA space weather alerts/watches/warnings** — the official text
  bulletins, most recent first

Built for ham radio operators tracking HF propagation, aurora
photographers/tourism operators planning by visibility latitude, and anyone
who currently refreshes spaceweather.gov manually.

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
