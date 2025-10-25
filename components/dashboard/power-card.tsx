'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PowerData } from '@/types/sensor-data';
import { Zap, Gauge, Battery } from 'lucide-react';
import { formatVoltage, formatCurrent, formatPower } from '@/lib/utils';

interface PowerCardProps {
  data: PowerData;
}

export function PowerCard({ data }: PowerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Power Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Battery className="h-4 w-4" />
              <span>Voltage</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              {formatVoltage(data.voltage)}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              <span>Current</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {formatCurrent(data.current)}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>Power</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatPower(data.power)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
