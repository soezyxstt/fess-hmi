'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  TemperatureData, 
  PowerData, 
  FFTData, 
  ConnectionStatus,
  SystemStats,
  EnergyData, 
  TiltData
} from '@/types/sensor-data';

const TOPICS = {
  TEMP_1: 'ppr/temp/t1',
  TEMP_2: 'ppr/temp/t2',
  TEMP_3: 'ppr/temp/t3',
  POWER: 'ppr/power',
  FFT: 'ppr/vib/fft',
  TILT: 'ppr/tilt/angle',
};

export function useWebSocket(esp32IP: string) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
  });

  const [tiltData, setTiltData] = useState<TiltData | null>(null);
  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    t1: 0,
    t2: 0,
    t3: 0,
    timestamp: 0,
  });
  const [powerData, setPowerData] = useState<PowerData>({
    voltage: 0,
    current: 0,
    power: 0,
    timestamp: 0,
  });
  const [fftData, setFFTData] = useState<FFTData | null>(null);
  const [energyData, setEnergyData] = useState<EnergyData>({
    totalEnergy: 0,
    lastUpdate: 0,
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    messagesReceived: 0,
    fftUpdates: 0,
    connectionUptime: 0,
    lastMessageTime: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const connectionTimeRef = useRef<number>(0);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timestamps
  useEffect(() => {
    const now = Date.now();
    setTemperatureData(prev => ({ ...prev, timestamp: now }));
    setPowerData(prev => ({ ...prev, timestamp: now }));
    setEnergyData(prev => ({ ...prev, lastUpdate: now }));
    setSystemStats(prev => ({ ...prev, lastMessageTime: now }));
  }, []);

  // Energy calculation
  useEffect(() => {
    if (powerData.power > 0) {
      const now = Date.now();
      const timeDiffHours = (now - energyData.lastUpdate) / (1000 * 3600);
      const energyIncrement = (powerData.power / 1000) * timeDiffHours;

      setEnergyData(prev => ({
        totalEnergy: prev.totalEnergy + energyIncrement,
        lastUpdate: now,
      }));
    }
  }, [powerData.power, energyData.lastUpdate]);

  const resetEnergy = useCallback(() => {
    setEnergyData({
      totalEnergy: 0,
      lastUpdate: Date.now(),
    });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!esp32IP) return;

    const wsUrl = `ws://${esp32IP}/ws`;
    console.log('Connecting to WebSocket:', wsUrl);
    setConnectionStatus(prev => ({ ...prev, connecting: true }));

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        connectionTimeRef.current = Date.now();
        setConnectionStatus({
          connected: true,
          connecting: false,
          error: null,
        });

        // Start uptime counter
        uptimeIntervalRef.current = setInterval(() => {
          if (connectionTimeRef.current > 0) {
            const uptime = (Date.now() - connectionTimeRef.current) / 1000;
            setSystemStats(prev => ({ ...prev, connectionUptime: uptime }));
          }
        }, 1000);
      };

      ws.onmessage = (event) => {
        const now = Date.now();
        setSystemStats(prev => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
          lastMessageTime: now,
        }));

        try {
          const message = JSON.parse(event.data);
          const topic = message.topic;
          const payload = message.payload;

          switch (topic) {
            case TOPICS.TEMP_1:
              setTemperatureData(prev => ({
                ...prev,
                t1: typeof payload === 'string' ? parseFloat(payload) : payload,
                timestamp: now,
              }));
              break;

            case TOPICS.TEMP_2:
              setTemperatureData(prev => ({
                ...prev,
                t2: typeof payload === 'string' ? parseFloat(payload) : payload,
                timestamp: now,
              }));
              break;

            case TOPICS.TEMP_3:
              setTemperatureData(prev => ({
                ...prev,
                t3: typeof payload === 'string' ? parseFloat(payload) : payload,
                timestamp: now,
              }));
              break;

            case TOPICS.POWER:
              const powerJson = typeof payload === 'string' ? JSON.parse(payload) : payload;
              setPowerData({
                voltage: powerJson.voltage || 0,
                current: powerJson.current || 0,
                power: powerJson.power || 0,
                timestamp: now,
              });
              break;

            case TOPICS.FFT:
              const fftJson = typeof payload === 'string' ? JSON.parse(payload) : payload;
              setFFTData({
                fs: fftJson.fs || 800,
                bins: fftJson.bins || [],
                peak: fftJson.peak || 0,
                timestamp: now,
              });
              setSystemStats(prev => ({
                ...prev,
                fftUpdates: prev.fftUpdates + 1,
              }));
              break;

            case TOPICS.TILT:
              const tiltJson = typeof payload === 'string' ? JSON.parse(payload) : payload;
              setTiltData({
                pitch: tiltJson.pitch || 0,
                roll: tiltJson.roll || 0,
                x: tiltJson.x || 0,
                y: tiltJson.y || 0,
                z: tiltJson.z || 0,
                timestamp: now,
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus({
          connected: false,
          connecting: false,
          error: 'Connection error',
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus({
          connected: false,
          connecting: false,
          error: 'Disconnected',
        });

        if (uptimeIntervalRef.current) {
          clearInterval(uptimeIntervalRef.current);
        }

        // Attempt reconnection after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 2000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [esp32IP]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  return {
    connectionStatus,
    temperatureData,
    powerData,
    fftData,
    energyData,
    systemStats,
    resetEnergy,
    tiltData,
  };
}
