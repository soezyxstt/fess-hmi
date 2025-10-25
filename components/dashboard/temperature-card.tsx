// components/dashboard/TemperatureCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemperatureData } from '@/types/sensor-data';
import { Thermometer, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatTemperature, getTemperatureColor, getTemperatureStatus } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TemperatureCardProps {
  data: TemperatureData;
}

export function TemperatureCard({ data }: TemperatureCardProps) {
  const sensors = [
    { label: 'Sensor 1', value: data.t1, key: 't1' },
    { label: 'Sensor 2', value: data.t2, key: 't2' },
    { label: 'Sensor 3', value: data.t3, key: 't3' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Temperature Sensors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sensors.map((sensor) => (
            <div key={sensor.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{sensor.label}</span>
                <Badge variant={sensor.value >= 40 ? 'destructive' : sensor.value >= 30 ? 'default' : 'secondary'}>
                  {getTemperatureStatus(sensor.value)}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getTemperatureColor(sensor.value)}`}>
                  {sensor.value.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">°C</span>
              </div>
              {sensor.key !== 't3' && <div className="h-px bg-border" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
