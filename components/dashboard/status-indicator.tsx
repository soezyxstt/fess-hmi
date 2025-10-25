'use client';

import { ConnectionStatus } from '@/types/sensor-data';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status.connecting) {
    return (
      <Badge variant="secondary" className="gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Connecting...
      </Badge>
    );
  }

  if (status.connected) {
    return (
      <Badge variant="default" className="gap-2 bg-green-600">
        <Wifi className="h-3 w-3" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="gap-2">
      <WifiOff className="h-3 w-3" />
      Disconnected
    </Badge>
  );
}
