'use client';

import Link from 'next/link';
import { useMQTT } from '@/hooks/useMQTT';
import { analyzeVibration, HealthStatus } from '@/lib/vibration-analysis';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import { TiltCard } from '@/components/dashboard/tilt-card'; // Importing your existing component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Zap,
  Thermometer,
  RotateCw,
  Scale,
  ArrowRight,
  Gauge,
  AlertTriangle,
  CheckCircle,
  AlertOctagon,
  Fan
} from 'lucide-react';

export default function Home() {
  const {
    connectionStatus,
    rpmData,
    powerData,
    temperatureData,
    mechHealth,
    energyData,
    tiltData,
    fftData
  } = useMQTT();

  // --- Live AI Diagnostics ---
  const diag1 = analyzeVibration(
    rpmData.value,
    fftData.sensor1?.peak || 0,
    fftData.sensor1?.peakAmplitude || 0
  );

  const diag2 = analyzeVibration(
    rpmData.value,
    fftData.sensor2?.peak || 0,
    fftData.sensor2?.peakAmplitude || 0
  );

  // Helper: Colorize Efficiency
  const getEffColor = (eff: number) => {
    if (eff >= 45) return 'text-green-500';
    if (eff >= 30) return 'text-yellow-500';
    return 'text-destructive';
  };

  // Helper: Status Badge Component
  const StatusBadge = ({ status }: { status: HealthStatus }) => {
    if (status === 'DANGER') {
      return (
        <Badge variant="destructive" className="gap-1 animate-pulse">
          <AlertOctagon className="w-3 h-3" /> CRITICAL
        </Badge>
      );
    }
    if (status === 'WARNING') {
      return (
        <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200 gap-1">
          <AlertTriangle className="w-3 h-3" /> WARNING
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 gap-1">
        <CheckCircle className="w-3 h-3" /> NORMAL
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* --- Header --- */}
      <header className="flex items-center justify-between bg-card/50 backdrop-blur border-b border-border p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">
              ARES <span className="text-muted-foreground font-normal">Monitor</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(diag1.status === 'DANGER' || diag2.status === 'DANGER') && (
            <div className="hidden sm:flex animate-pulse items-center gap-2 text-destructive font-bold text-xs bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
              <AlertOctagon className="w-4 h-4" /> HIGH VIBRATION DETECTED
            </div>
          )}
          <StatusIndicator status={connectionStatus} />
        </div>
      </header>

      {/* --- Metric Cards Grid (Top Row) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. RPM Card */}
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Flywheel Speed</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold tracking-tighter text-card-foreground">
                  {rpmData.value.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">RPM</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-muted/50">
              <RotateCw
                className={`w-6 h-6 text-foreground ${rpmData.value > 100 ? 'animate-spin' : ''}`}
                style={{ animationDuration: '3s' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 2. Efficiency Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Efficiency</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-3xl font-bold tracking-tighter ${getEffColor(powerData.efficiency)}`}>
                  {powerData.efficiency.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">%</span>
              </div>
            </div>
            <Gauge className="w-8 h-8 text-muted-foreground/20" />
          </CardContent>
        </Card>

        {/* 3. Alignment Stress (Dual) */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Alignment Stress</p>
              <Scale className="w-4 h-4 text-muted-foreground/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Upper</span>
                <span className="text-xl font-bold tracking-tight text-card-foreground">
                  {mechHealth.alignmentUpper.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">N</span>
                </span>
              </div>
              <div className="border-l border-border pl-3">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Lower</span>
                <span className="text-xl font-bold tracking-tight text-card-foreground">
                  {mechHealth.alignmentLower.toFixed(1)} <span className="text-[10px] font-normal text-muted-foreground">N</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Vibration Diagnostics (AI) */}
        <Card className={`shadow-sm border-l-4 ${(diag1.status === 'DANGER' || diag2.status === 'DANGER') ? 'border-l-destructive' : 'border-l-purple-500'}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <p className="text-xs font-medium text-muted-foreground uppercase">Vibration Health</p>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>

            {/* Sensor 1 (Upper) */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-foreground">Upper</span>
              <StatusBadge status={diag1.status} />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {diag1.fault} <span className="font-mono">({diag1.amplitude.toFixed(2)}g)</span>
            </p>

            <div className="h-px bg-border" />

            {/* Sensor 2 (Lower) */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-foreground">Lower</span>
              <StatusBadge status={diag2.status} />
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {diag2.fault} <span className="font-mono">({diag2.amplitude.toFixed(2)}g)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- Detailed Data Section (Inline Grid) --- */}
      {/* Changed to grid-cols-4 to allow inline positioning */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* 1. Power Matrix (Spans 2 Columns) */}
        <Card className="lg:col-span-2 shadow-sm h-full">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> Power Flow Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-border">
              {/* Input Section */}
              <div className="p-4 space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Charging (Input)</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-card-foreground">
                    {powerData.input.power.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">W</span>
                  </span>
                  <div className="text-right text-xs text-muted-foreground space-y-0.5">
                    <div>{powerData.input.voltage.toFixed(1)} V</div>
                    <div>{powerData.input.current.toFixed(2)} A</div>
                  </div>
                </div>
              </div>

              {/* Output Section */}
              <div className="p-4 space-y-1 bg-muted/5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Discharging (Output)</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-card-foreground">
                    {powerData.output.power.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">W</span>
                  </span>
                  <div className="text-right text-xs text-muted-foreground space-y-0.5">
                    <div>{powerData.output.voltage.toFixed(1)} V</div>
                    <div>{powerData.output.current.toFixed(2)} A</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border p-3 bg-muted/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant={mechHealth.isCompressorOn ? "default" : "secondary"} className="text-[10px] h-5">
                  {mechHealth.isCompressorOn ? "COOLING ACTIVE" : "COOLING IDLE"}
                </Badge>
                {mechHealth.isCompressorOn && <Fan className="w-3 h-3 text-blue-500 animate-spin" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Energy Accumulation</span>
                <span className="font-mono font-bold text-sm text-foreground">{energyData.totalEnergy.toFixed(4)} Wh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Thermal Card (Spans 1 Column) */}
        <Card className="lg:col-span-1 shadow-sm h-full">
          <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-red-500" /> Thermal Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col justify-center h-[calc(100%-50px)]">
            <div className="grid grid-cols-1 gap-3 text-center">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 flex justify-between items-center px-4">
                <div className="text-xs text-red-500 font-bold">T1</div>
                <div className="font-mono font-bold text-foreground text-lg">{temperatureData.t1.toFixed(1)}°</div>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 flex justify-between items-center px-4">
                <div className="text-xs text-orange-500 font-bold">T2</div>
                <div className="font-mono font-bold text-foreground text-lg">{temperatureData.t2.toFixed(1)}°</div>
              </div>
              <div className="p-2 bg-muted rounded-lg border border-border flex justify-between items-center px-4">
                <div className="text-xs text-muted-foreground font-bold">T3</div>
                <div className="font-mono font-bold text-foreground text-lg">{temperatureData.t3.toFixed(1)}°</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Tilt Card (Spans 1 Column) */}
        <div className="lg:col-span-1 h-full">
          <TiltCard data={tiltData} />
        </div>

      </div>

      {/* --- Footer Navigation --- */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/3d" className="group">
          <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">3D Digital Twin</h3>
                <p className="text-xs text-muted-foreground">Visualize Thermal & Rotation</p>
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-muted-foreground group-hover:text-primary" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/fft" className="group">
          <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">Spectral Analysis</h3>
                <div className="flex gap-2 mt-1">
                  {diag1.status === 'DANGER' && <Badge variant="destructive" className="text-[10px] py-0 h-5">Upper Alert</Badge>}
                  {diag2.status === 'DANGER' && <Badge variant="destructive" className="text-[10px] py-0 h-5">Lower Alert</Badge>}
                  {diag1.status !== 'DANGER' && diag2.status !== 'DANGER' && <p className="text-xs text-muted-foreground">Full FFT Graphs</p>}
                </div>
              </div>
              <Activity className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}