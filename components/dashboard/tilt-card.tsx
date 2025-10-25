// components/dashboard/TiltCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiltData } from '@/types/sensor-data';
import { Move, ArrowUp, ArrowRight } from 'lucide-react';

interface TiltCardProps {
  data: TiltData | null;
}

export function TiltCard({ data }: TiltCardProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Tilt Angle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Waiting for tilt data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine tilt severity colors
  const getPitchColor = (pitch: number) => {
    const abs = Math.abs(pitch);
    if (abs > 30) return 'text-red-500';
    if (abs > 15) return 'text-orange-500';
    return 'text-green-400';
  };

  const getRollColor = (roll: number) => {
    const abs = Math.abs(roll);
    if (abs > 30) return 'text-red-500';
    if (abs > 15) return 'text-orange-500';
    return 'text-green-400';
  };

  // Calculate total tilt magnitude
  const totalTilt = Math.sqrt(data.pitch * data.pitch + data.roll * data.roll);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="h-5 w-5" />
          Tilt Angle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Tilt Indicator */}
          <div className="relative w-full h-48 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
            {/* Center reference */}
            <div className="absolute w-2 h-2 bg-primary rounded-full z-10"></div>

            {/* Tilt ball */}
            <div
              className="absolute w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg transition-all duration-300"
              style={{
                transform: `translate(${data.roll * 2}px, ${data.pitch * 2}px)`,
              }}
            ></div>

            {/* Grid lines */}
            <div className="absolute w-full h-px bg-border top-1/2"></div>
            <div className="absolute h-full w-px bg-border left-1/2"></div>
          </div>

          {/* Angle Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUp className="h-4 w-4" />
                <span>Pitch (Y-axis)</span>
              </div>
              <p className={`text-3xl font-bold ${getPitchColor(data.pitch)}`}>
                {data.pitch.toFixed(1)}°
              </p>
              <p className="text-xs text-muted-foreground">
                {data.pitch > 0 ? 'Forward' : data.pitch < 0 ? 'Backward' : 'Level'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span>Roll (X-axis)</span>
              </div>
              <p className={`text-3xl font-bold ${getRollColor(data.roll)}`}>
                {data.roll.toFixed(1)}°
              </p>
              <p className="text-xs text-muted-foreground">
                {data.roll > 0 ? 'Right' : data.roll < 0 ? 'Left' : 'Level'}
              </p>
            </div>
          </div>

          {/* Total Tilt */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Tilt</span>
              <span className="text-lg font-bold text-primary">
                {totalTilt.toFixed(1)}°
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="text-center">
            {totalTilt < 5 && (
              <span className="text-sm px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                ✓ Level
              </span>
            )}
            {totalTilt >= 5 && totalTilt < 20 && (
              <span className="text-sm px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                ⚠ Slight Tilt
              </span>
            )}
            {totalTilt >= 20 && (
              <span className="text-sm px-3 py-1 bg-red-500/20 text-red-400 rounded-full">
                ⚠ Significant Tilt
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
