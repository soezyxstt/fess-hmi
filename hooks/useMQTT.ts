'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { 
  TemperatureData, 
  PowerData, 
  FFTData, 
  ConnectionStatus,
  SystemStats,
  EnergyData, 
  TiltData
} from '@/types/sensor-data';

const MQTT_BROKER = 'ws://47.84.93.46:1884'; // WebSocket port
const TOPICS = {
  TEMP_1: 'ppr/temp/t1',
  TEMP_2: 'ppr/temp/t2',
  TEMP_3: 'ppr/temp/t3',
  POWER: 'ppr/power',
  FFT: 'ppr/vib/fft',
  TILT: 'ppr/tilt/angle',
};

export function useMQTT() {
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

  const clientRef = useRef<MqttClient | null>(null);
  const connectionTimeRef = useRef<number>(0);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timestamps on mount to avoid calling Date.now() during render
  useEffect(() => {
    const now = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const energyIncrement = (powerData.power / 1000) * timeDiffHours; // Convert mW to W, then to Wh

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnergyData(prev => ({
        totalEnergy: prev.totalEnergy + energyIncrement,
        lastUpdate: now,
      }));
    }
  }, [powerData.power]);

  const resetEnergy = useCallback(() => {
    setEnergyData({
      totalEnergy: 0,
      lastUpdate: Date.now(),
    });
  }, []);

  useEffect(() => {
    console.log('Initializing MQTT connection...');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConnectionStatus(prev => ({ ...prev, connecting: true }));

    try {
      const client = mqtt.connect(MQTT_BROKER, {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      });

      clientRef.current = client;

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        connectionTimeRef.current = Date.now();
        
        setConnectionStatus({
          connected: true,
          connecting: false,
          error: null,
        });

        // Subscribe to all topics
        Object.values(TOPICS).forEach(topic => {
          client.subscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err);
            } else {
              console.log(`Subscribed to ${topic}`);
            }
          });
        });

        // Start uptime counter
        uptimeIntervalRef.current = setInterval(() => {
          if (connectionTimeRef.current > 0) {
            const uptime = (Date.now() - connectionTimeRef.current) / 1000;
            setSystemStats(prev => ({ ...prev, connectionUptime: uptime }));
          }
        }, 1000);
      });

      client.on('message', (topic, message) => {
        const now = Date.now();
        setSystemStats(prev => ({
          ...prev,
          messagesReceived: prev.messagesReceived + 1,
          lastMessageTime: now,
        }));

        try {
          const payload = message.toString();

          switch (topic) {
            case TOPICS.TEMP_1:
              setTemperatureData(prev => ({
                ...prev,
                t1: parseFloat(payload),
                timestamp: now,
              }));
              break;

            case TOPICS.TEMP_2:
              setTemperatureData(prev => ({
                ...prev,
                t2: parseFloat(payload),
                timestamp: now,
              }));
              break;

            case TOPICS.TEMP_3:
              setTemperatureData(prev => ({
                ...prev,
                t3: parseFloat(payload),
                timestamp: now,
              }));
              break;

            case TOPICS.POWER:
              const powerJson = JSON.parse(payload);
              setPowerData({
                voltage: powerJson.voltage || 0,
                current: powerJson.current || 0,
                power: powerJson.power || 0,
                timestamp: now,
              });
              break;

            case TOPICS.FFT:
              const fftJson = JSON.parse(payload);
              setFFTData({
                fs: fftJson.fs || 3200,
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
              const tiltJson = JSON.parse(payload);
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
          console.error(`Error parsing message from ${topic}:`, error);
        }
      });

      client.on('error', (error) => {
        console.error('MQTT Error:', error);
        setConnectionStatus({
          connected: false,
          connecting: false,
          error: error.message,
        });
      });

      client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
        setConnectionStatus(prev => ({ ...prev, connecting: true }));
      });

      client.on('disconnect', () => {
        console.log('Disconnected from MQTT broker');
        setConnectionStatus({
          connected: false,
          connecting: false,
          error: 'Disconnected',
        });
      });

    } catch (error) {
      console.error('Failed to initialize MQTT client:', error);
      setConnectionStatus({
        connected: false,
        connecting: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Cleanup
    return () => {
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, []);

  return {
    connectionStatus,
    temperatureData,
    powerData,
    fftData,
    energyData,
    systemStats,
    resetEnergy,
    tiltData
  };
}
