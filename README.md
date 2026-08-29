# ARES Monitor — FESS HMI

Real-time monitoring and diagnostic HMI for a **flywheel energy storage system (FESS)**.

The application receives live machine telemetry over MQTT, visualizes electrical and mechanical operating conditions, performs vibration diagnostics, and exposes deeper views for FFT analysis and a 3D digital twin.

## Engineering highlights

- Live MQTT telemetry from the physical system
- Flywheel RPM, input/output power, energy, temperature, and alignment monitoring
- Vibration-health analysis using FFT-derived features
- Alert states for abnormal mechanical vibration
- 3D machine visualization with React Three Fiber
- Dedicated spectral-analysis view
- Persistent data layer using PostgreSQL + Drizzle
- Browser-based industrial dashboard designed for fast operator inspection

## Stack

- **Next.js 16**
- **React 19 + TypeScript**
- **MQTT.js**
- **React Three Fiber / Drei / Three.js**
- **Recharts**
- **PostgreSQL + Drizzle ORM**
- **Tailwind CSS**

## High-level architecture

```text
Sensors / FESS hardware
        │
        │ telemetry
        ▼
      MQTT
        │
        ▼
ARES Monitor
 ├─ Live operational dashboard
 ├─ Vibration diagnostics
 ├─ FFT / spectral analysis
 ├─ 3D digital twin
 └─ Historical data persistence
```

## Main monitored domains

- Rotational speed
- Charging / discharging power
- Energy accumulation
- Thermal condition
- Mechanical alignment
- Tilt
- Vibration spectra and fault indicators

## Local development

Create `.env` from the provided template and configure the PostgreSQL connection:

```bash
cp .env.example .env
npm install
npm run dev
```

The MQTT endpoint used by the current hardware setup is defined in `hooks/useMQTT.ts`.

## Project context

This project demonstrates the intersection of mechanical systems, condition monitoring, IIoT, and full-stack software engineering.
