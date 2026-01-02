'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SingleFFTData } from '@/types/sensor-data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';

interface FFTChartProps {
  data: SingleFFTData | null | undefined;
}

export function FFTChart({ data }: FFTChartProps) {
  // Helper for formatting logic directly here if utils is missing, 
  // or use the imported one. keeping it simple:
  const formatFreq = (val: number) => `${val.toFixed(1)} Hz`;

  if (!data || !data.bins || data.bins.length === 0) {
    return (
      <Card className="h-full border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Frequency Spectrum
          </CardTitle>
          <CardDescription>Waiting for sensor data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground/50 animate-pulse">
            Waiting for FFT stream...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for Recharts
  const chartData = data.bins.map(bin => ({
    frequency: bin.f,
    magnitude: bin.m,
  }));

  return (
    <Card className="h-full border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Spectrum Analysis
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Dominant Freq</p>
            <p className="text-xl font-bold text-primary">{formatFreq(data.peak)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="h-[calc(100%-80px)] min-h-[300px] w-full p-0 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMagnitude" x1="0" y1="0" x2="0" y2="1">
                {/* Use CSS variables for theme-aware colors */}
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Grid using theme border color */}
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

            <XAxis
              dataKey="frequency"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toFixed(0)}`}
              label={{
                value: 'Frequency (Hz)',
                position: 'insideBottom',
                offset: -5,
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10
              }}
            />

            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: 'Magnitude (g)',
                angle: -90,
                position: 'insideLeft',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              labelFormatter={(value) => `Freq: ${Number(value).toFixed(1)} Hz`}
              formatter={(value: number) => [value.toFixed(4), 'Magnitude']}
            />

            <Area
              type="monotone"
              dataKey="magnitude"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorMagnitude)"
              animationDuration={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}