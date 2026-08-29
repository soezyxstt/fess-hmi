# ARES Monitor | FESS HMI

Real-time monitoring and diagnostic HMI for a flywheel energy storage system.

## Features

- Live MQTT telemetry
- RPM, power, energy, temperature, and alignment monitoring
- Vibration diagnostics with FFT-derived features
- Alerts for abnormal vibration
- 3D machine visualization
- Spectral-analysis view
- PostgreSQL-backed historical data

## Stack

`Next.js 16` `React 19` `TypeScript` `MQTT.js` `React Three Fiber` `Three.js` `Recharts` `PostgreSQL` `Drizzle ORM` `Tailwind CSS`

## Architecture

```text
Sensors / FESS hardware
        │
        ▼
      MQTT
        │
        ▼
  ARES Monitor
 dashboard + diagnostics + FFT + 3D view
        │
        ▼
   PostgreSQL
```

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

The MQTT endpoint for the hardware setup is defined in `hooks/useMQTT.ts`.
