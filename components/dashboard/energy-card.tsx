'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnergyData } from '@/types/sensor-data';
import { Battery, RotateCcw } from 'lucide-react';
import { formatEnergy } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EnergyCardProps {
  data: EnergyData;
  onReset: () => void;
}

export function EnergyCard({ data, onReset }: EnergyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Total Energy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Accumulated Energy</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {formatEnergy(data.totalEnergy)}
            </p>
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Counter
          </Button>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Calculated by integrating power over time
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
