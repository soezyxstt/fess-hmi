export interface TemperatureData {
  t1: number;
  t2: number;
  t3: number;
  timestamp: number;
}

export interface TiltData {
  pitch: number;
  roll: number;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}


export interface PowerData {
  voltage: number;
  current: number;
  power: number;
  timestamp: number;
}

export interface FFTBin {
  f: number; // frequency in Hz
  m: number; // magnitude
}

export interface FFTData {
  fs: number; // sampling frequency
  bins: FFTBin[];
  peak: number; // dominant frequency
  timestamp: number;
}

export interface VibrationData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface EnergyData {
  totalEnergy: number; // in Wh
  lastUpdate: number;
}

export interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export interface SystemStats {
  messagesReceived: number;
  fftUpdates: number;
  connectionUptime: number;
  lastMessageTime: number;
}
