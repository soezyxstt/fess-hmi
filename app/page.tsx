'use client';

// import { useState, useEffect } from 'react';
import { useMQTT } from '@/hooks/useMQTT';
// import { useWebSocket } from '@/hooks/use-web-sockets';
import { FFTChart } from '@/components/dashboard/fft-chart';
import { TemperatureCard } from '@/components/dashboard/temperature-card';
import { PowerCard } from '@/components/dashboard/power-card';
import { EnergyCard } from '@/components/dashboard/energy-card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import { TiltCard } from '@/components/dashboard/tilt-card';

// type ConnectionType = 'mqtt' | 'websocket';

export default function Home() {
  // Initialize with function to avoid hydration issues
  // const [connectionType, setConnectionType] = useState<ConnectionType>('mqtt');
  // const [esp32IP, setEsp32IP] = useState<string>(() => {
  //   // Only access localStorage on client side
  //   if (typeof window !== 'undefined') { 
  //     return localStorage.getItem('esp32IP') || '';
  //   }
  //   return '';
  // });
  // const [savedIP, setSavedIP] = useState<string>('');

  // Load saved IP after mount
  // useEffect(() => {
  //   const saved = localStorage.getItem('esp32IP');
  //   if (saved) {
  //     setSavedIP(saved);
  //   }
  // }, []);

  // MQTT connection (always active for database logging)
  const mqttData = useMQTT();

  // WebSocket connection (only connect when savedIP exists)
  // const wsData = useWebSocket(savedIP);

  // Select active connection data based on mode
  const activeData = mqttData;

  // const handleSaveIP = () => {
  //   if (!esp32IP.trim()) {
  //     alert('Please enter a valid IP address');
  //     return;
  //   }
  //   localStorage.setItem('esp32IP', esp32IP);
  //   setSavedIP(esp32IP);
  // };

  // const handleConnectionTypeChange = (type: ConnectionType) => {
  //   // Allow switching to websocket mode even without IP
  //   // User will see disconnected status until they enter IP
  //   setConnectionType(type);
  // };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ARES Monitoring System</h1>
              <p className="text-sm text-muted-foreground">Real-time HMI Dashboard</p>
            </div>
            <div className="flex items-center gap-4 max-sm:flex-col">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Current Time</p>
                <p className="font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
              <StatusIndicator status={activeData.connectionStatus} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-0 gap-6 lg:gap-x-6">
          {/* Left Column */}
          <div className="space-y-6 w-full">
            <TemperatureCard data={activeData.temperatureData} />
            <PowerCard data={activeData.powerData} />
          </div>

          {/* Middle Column - FFT Chart */}
          <FFTChart data={activeData.fftData} />

          {/* Right Column */}
          <div className="space-y-6">
            <EnergyCard data={activeData.energyData} onReset={activeData.resetEnergy} />
            <TiltCard data={activeData.tiltData} />
          </div>
        </div>
      </main>
    </div>
  );
}
