// components/dashboard/FFTChart.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FFTData } from '@/types/sensor-data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity } from 'lucide-react';
import { formatFrequency } from '@/lib/utils';

interface FFTChartProps {
  data: FFTData | null;
}

export function FFTChart({ data }: FFTChartProps) {
  if (!data || !data.bins || data.bins.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            FFT Frequency Spectrum
          </CardTitle>
          <CardDescription>Bearing Vibration Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Waiting for FFT data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.bins.map(bin => ({
    frequency: bin.f,
    magnitude: bin.m,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          FFT Frequency Spectrum
        </CardTitle>
        <CardDescription>
          Bearing Vibration Analysis - Peak: {formatFrequency(data.peak)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">Dominant Frequency</p>
          <p className="text-2xl font-bold text-primary">{formatFrequency(data.peak)}</p>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMagnitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="frequency" 
              stroke="#52525b"
              label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5, fill: '#a1a1aa' }}
              tickFormatter={(value) => `${value.toFixed(0)}`}
            />
            <YAxis 
              stroke="#52525b"
              label={{ value: 'Magnitude', angle: -90, position: 'insideLeft', fill: '#a1a1aa' }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '1px solid #27272a',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => `${formatFrequency(Number(value))}`}
              formatter={(value: number) => [value.toFixed(3), 'Magnitude']}
            />
            <Area 
              type="monotone" 
              dataKey="magnitude" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorMagnitude)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
