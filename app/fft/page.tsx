'use client';

import Link from 'next/link';
import { useMQTT } from '@/hooks/useMQTT';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FFTChart } from '@/components/dashboard/fft-chart';
import { ArrowLeft, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function FFTPage() {
  const { connectionStatus, fftData, systemStats } = useMQTT();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dual Vibration Spectrum</h1>
            <p className="text-xs text-muted-foreground">Real-time FFT: Upper vs Lower Sensors</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <StatusIndicator status={connectionStatus} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Sensor 1 Chart */}
        <Card className="flex flex-col h-[75vh] lg:h-auto border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1 bg-blue-500/10 rounded">
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
              Sensor 1 (Upper)
            </CardTitle>
            <div className="flex gap-3 text-xs">
              <div>FS: <span className="font-mono font-bold">{fftData.sensor1?.fs || 0}</span> Hz</div>
              <div>Peak: <span className="font-mono font-bold text-destructive">{fftData.sensor1?.peak.toFixed(1) || 0}</span> Hz</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 min-h-0">
            {/* Render Sensor 1 Data */}
            {/* Note: Ensure FFTChart accepts 'data' of type SingleFFTData */}
            <FFTChart data={fftData.sensor1} />
          </CardContent>
        </Card>

        {/* Sensor 2 Chart */}
        <Card className="flex flex-col h-[75vh] lg:h-auto border-border bg-card">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1 bg-purple-500/10 rounded">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              Sensor 2 (Lower)
            </CardTitle>
            <div className="flex gap-3 text-xs">
              <div>FS: <span className="font-mono font-bold">{fftData.sensor2?.fs || 0}</span> Hz</div>
              <div>Peak: <span className="font-mono font-bold text-destructive">{fftData.sensor2?.peak.toFixed(1) || 0}</span> Hz</div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-4 min-h-0">
            {/* Render Sensor 2 Data */}
            <FFTChart data={fftData.sensor2} />
          </CardContent>
        </Card>

      </main>

      {/* Footer Stats */}
      <footer className="border-t border-border bg-muted/20 px-6 py-2 text-xs text-muted-foreground flex justify-between">
        <span>Updates Received: {systemStats.fftUpdates}</span>
        <span>Last Sync: {new Date(systemStats.lastMessageTime).toLocaleTimeString()}</span>
      </footer>
    </div>
  );
}