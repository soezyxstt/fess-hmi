'use client';

import { useMQTT } from '@/hooks/useMQTT';
import { FFTChart } from '@/components/dashboard/fft-chart';
import { TemperatureCard } from '@/components/dashboard/temperature-card';
import { PowerCard } from '@/components/dashboard/power-card';
import { EnergyCard } from '@/components/dashboard/energy-card';
import { SystemInfoCard } from '@/components/dashboard/system-info-card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import { TiltCard } from '@/components/dashboard/tilt-card';

export default function Home() {
  const {
    connectionStatus,
    temperatureData,
    powerData,
    fftData,
    energyData,
    systemStats,
    resetEnergy,
    tiltData,
  } = useMQTT();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">FESS Monitoring System</h1>
              <p className="text-sm text-muted-foreground">Real-time HMI Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Current Time</p>
                <p className="font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
              <StatusIndicator status={connectionStatus} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TemperatureCard data={temperatureData} />
            <PowerCard data={powerData} />
          </div>

          {/* Middle Column - FFT Chart */}
          <FFTChart data={fftData} />

          {/* Right Column */}
          <div className="space-y-6">
            <EnergyCard data={energyData} onReset={resetEnergy} />
            {/* <SystemInfoCard stats={systemStats} /> */}
            <TiltCard data={tiltData} />
          </div>

        </div>
      </main>
    </div>
  );
}
