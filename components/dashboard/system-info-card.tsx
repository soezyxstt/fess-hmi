'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStats } from '@/types/sensor-data';
import { Info } from 'lucide-react';
import { formatUptime } from '@/lib/utils';

interface SystemInfoCardProps {
  stats: SystemStats;
}

export function SystemInfoCard({ stats }: SystemInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          System Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Messages Received</span>
            <span className="font-mono font-bold">{stats.messagesReceived}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">FFT Updates</span>
            <span className="font-mono font-bold">{stats.fftUpdates}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Connection Uptime</span>
            <span className="font-mono font-bold">{formatUptime(stats.connectionUptime)}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="text-xs text-muted-foreground">
            Last update: {new Date(stats.lastMessageTime).toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
