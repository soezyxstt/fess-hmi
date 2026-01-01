'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { 
  TemperatureData, 
  DualPowerData, 
  DualFFTData, 
  SingleFFTData,
  ConnectionStatus,
  SystemStats,
  EnergyData, 
  TiltData,
  RPMData,       
  MechanicalHealth 
} from '@/types/sensor-data';

// Constants
const MQTT_BROKER = process.env.NODE_ENV === 'production'
  ? 'wss://broker.iot.hmmitb.com'
  : 'ws://broker.iot.hmmitb.com:1884';

const TOPICS = {
  // Thermal
  TEMP_1: 'ppr/temp/t1',
  TEMP_2: 'ppr/temp/t2',
  TEMP_3: 'ppr/temp/t3',
  
  // Power & Energy
  POWER_IN: 'ppr/power/input',
  POWER_OUT: 'ppr/power/output',
  
  // Mechanical / Rotational
  RPM: 'ppr/rpm',
  TILT: 'ppr/tilt/angle',
  
  // Mechanical Health (New)
  ALIGN_UPPER: 'ppr/mech/align/upper', 
  ALIGN_LOWER: 'ppr/mech/align/lower',
  MECH_COOL: 'ppr/mech/cool',
  
  // Vibration Analysis (New Dual Sensors)
  FFT_1: 'ppr/vib/fft/1',
  FFT_2: 'ppr/vib/fft/2',
};

export function useMQTT() {
  // --- State Definitions ---

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    messagesReceived: 0,
    fftUpdates: 0,
    connectionUptime: 0,
    lastMessageTime: 0,
  });

  // 1. Rotational Data
  const [rpmData, setRpmData] = useState<RPMData>({ 
    value: 0, 
    timestamp: 0 
  });

  // 2. Mechanical Health (Load Cells & Cooling)
  const [mechHealth, setMechHealth] = useState<MechanicalHealth>({ 
    alignmentUpper: 0, 
    alignmentLower: 0, 
    isCompressorOn: false, 
    timestamp: 0 
  });

  // 3. Environment (Tilt)
  const [tiltData, setTiltData] = useState<TiltData | null>(null);

  // 4. Thermal
  const [temperatureData, setTemperatureData] = useState<TemperatureData>({ 
    t1: 0, 
    t2: 0, 
    t3: 0, 
    timestamp: 0 
  });
  
  // 5. Power & Efficiency
  const [powerData, setPowerData] = useState<DualPowerData>({
    input: { voltage: 0, current: 0, power: 0 },
    output: { voltage: 0, current: 0, power: 0 },
    efficiency: 0,
    timestamp: 0,
  });

  const [energyData, setEnergyData] = useState<EnergyData>({ 
    totalEnergy: 0, 
    lastUpdate: 0 
  });

  // 6. Vibration (Dual FFT)
  const [fftData, setFFTData] = useState<DualFFTData>({ 
    sensor1: null, 
    sensor2: null, 
    timestamp: 0 
  });

  // --- Refs ---
  const clientRef = useRef<MqttClient | null>(null);
  const connectionTimeRef = useRef<number>(0);

  // --- Helpers ---

  // Helper to process raw FFT JSON and extract max amplitude for the diagnostic AI
  const processFFT = (payload: string): SingleFFTData => {
    const parsed = JSON.parse(payload);
    
    // Calculate peak amplitude from bins if not explicitly provided
    let maxAmp = 0;
    if (parsed.bins && Array.isArray(parsed.bins)) {
      // Find the highest magnitude 'm' in the bins array
      maxAmp = parsed.bins.reduce((max: number, bin: any) => Math.max(max, bin.m || 0), 0);
    }

    return {
      fs: parsed.fs || 0,
      bins: parsed.bins || [],
      peak: parsed.peak || 0,
      peakAmplitude: maxAmp, // Added for diagnostic logic
    };
  };

  // --- Effects ---

  // Initialize timestamps on mount
  useEffect(() => {
    const now = Date.now();
    setTemperatureData(p => ({ ...p, timestamp: now }));
    setPowerData(p => ({ ...p, timestamp: now }));
    setEnergyData(p => ({ ...p, lastUpdate: now }));
  }, []);

  // Energy Integration Logic (Wh Calculation)
  // Integrates Input Power over time
  useEffect(() => {
    if (powerData.input.power > 0) {
      const now = Date.now();
      // Calculate time difference in hours
      const timeDiffHours = (now - energyData.lastUpdate) / (1000 * 3600);
      
      // Filter out massive time jumps (e.g., wake from sleep)
      if (timeDiffHours > 0 && timeDiffHours < 1) {
        const increment = (powerData.input.power / 1000) * timeDiffHours; // kW * h = kWh -> W * h / 1000 = Wh ? No.
        // Power is in Watts. Energy in Wh. 
        // Energy (Wh) = Power (W) * Time (h)
        const energyIncrement = powerData.input.power * timeDiffHours;
        
        setEnergyData(prev => ({ 
          totalEnergy: prev.totalEnergy + energyIncrement, 
          lastUpdate: now 
        }));
      } else {
         // Just update timestamp if jump was too big
         setEnergyData(prev => ({ ...prev, lastUpdate: now }));
      }
    } else {
      // Update timestamp even if power is 0 to keep delta time correct
      setEnergyData(prev => ({ ...prev, lastUpdate: Date.now() }));
    }
  }, [powerData.input.power, energyData.lastUpdate]);

  const resetEnergy = useCallback(() => {
    setEnergyData({ totalEnergy: 0, lastUpdate: Date.now() });
  }, []);

  // MQTT Connection Logic
  useEffect(() => {
    setConnectionStatus(prev => ({ ...prev, connecting: true }));

    try {
      console.log(`Connecting to MQTT Broker: ${MQTT_BROKER}`);
      const client = mqtt.connect(MQTT_BROKER, {
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 2000,
      });

      clientRef.current = client;

      client.on('connect', () => {
        console.log('Connected to MQTT');
        connectionTimeRef.current = Date.now();
        setConnectionStatus({ connected: true, connecting: false, error: null });
        
        // Subscribe to all topics
        const topicList = Object.values(TOPICS);
        client.subscribe(topicList, (err) => {
           if (err) console.error("Subscription error:", err);
           else console.log(`Subscribed to ${topicList.length} topics`);
        });
      });

      client.on('message', (topic, message) => {
        const now = Date.now();
        const payload = message.toString();

        setSystemStats(prev => ({ 
          ...prev, 
          messagesReceived: prev.messagesReceived + 1, 
          lastMessageTime: now 
        }));

        try {
          switch (topic) {
            // --- Mechanical ---
            case TOPICS.RPM:
              setRpmData({ value: parseFloat(payload), timestamp: now });
              break;
            
            case TOPICS.ALIGN_UPPER:
              setMechHealth(prev => ({ ...prev, alignmentUpper: parseFloat(payload), timestamp: now }));
              break;
            
            case TOPICS.ALIGN_LOWER:
              setMechHealth(prev => ({ ...prev, alignmentLower: parseFloat(payload), timestamp: now }));
              break;

            case TOPICS.MECH_COOL:
              // Handles "1", "true", "ON"
              const isCool = payload === '1' || payload.toLowerCase() === 'true' || payload === 'ON';
              setMechHealth(prev => ({ ...prev, isCompressorOn: isCool, timestamp: now }));
              break;

            case TOPICS.TILT:
              const t = JSON.parse(payload);
              setTiltData({ ...t, timestamp: now });
              break;

            // --- Power ---
            case TOPICS.POWER_IN:
              const pIn = JSON.parse(payload);
              setPowerData(prev => {
                // Calculate Efficiency: Output / Input
                const efficiency = pIn.power > 0 ? (prev.output.power / pIn.power) * 100 : 0;
                return { ...prev, input: pIn, efficiency, timestamp: now };
              });
              break;

            case TOPICS.POWER_OUT:
              const pOut = JSON.parse(payload);
              setPowerData(prev => {
                const efficiency = prev.input.power > 0 ? (pOut.power / prev.input.power) * 100 : 0;
                return { ...prev, output: pOut, efficiency, timestamp: now };
              });
              break;

            // --- Thermal ---
            case TOPICS.TEMP_1:
              setTemperatureData(prev => ({ ...prev, t1: parseFloat(payload), timestamp: now }));
              break;
            case TOPICS.TEMP_2:
              setTemperatureData(prev => ({ ...prev, t2: parseFloat(payload), timestamp: now }));
              break;
            case TOPICS.TEMP_3:
              setTemperatureData(prev => ({ ...prev, t3: parseFloat(payload), timestamp: now }));
              break;
            
            // --- Vibration (FFT) ---
            case TOPICS.FFT_1:
              const f1 = processFFT(payload);
              setFFTData(prev => ({ ...prev, sensor1: f1, timestamp: now }));
              setSystemStats(prev => ({ ...prev, fftUpdates: prev.fftUpdates + 1 }));
              break;
            
            case TOPICS.FFT_2:
              const f2 = processFFT(payload);
              setFFTData(prev => ({ ...prev, sensor2: f2, timestamp: now }));
              setSystemStats(prev => ({ ...prev, fftUpdates: prev.fftUpdates + 1 }));
              break;
          }
        } catch (e) {
          console.error(`Error parsing MQTT message on ${topic}:`, e);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT Error:', err);
        setConnectionStatus(prev => ({ ...prev, error: err.message }));
      });

      client.on('offline', () => {
        setConnectionStatus(prev => ({ ...prev, connected: false }));
      });

    } catch (error) {
       console.error("MQTT Setup Error:", error);
       setConnectionStatus({ connected: false, connecting: false, error: 'Setup Failed' });
    }

    return () => {
      if (clientRef.current) {
        console.log("Closing MQTT connection");
        clientRef.current.end();
      }
    };
  }, []);

  return {
    connectionStatus,
    temperatureData,
    powerData,
    rpmData,
    mechHealth,
    fftData, 
    energyData,
    systemStats,
    resetEnergy,
    tiltData
  };
}