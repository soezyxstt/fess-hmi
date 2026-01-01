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

export interface RPMData {
  value: number;
  timestamp: number;
}

export interface DualPowerData {
  input: {
    voltage: number;
    current: number;
    power: number;
  };
  output: {
    voltage: number;
    current: number;
    power: number;
  };
  efficiency: number; // Calculated percentage (0-100)
  timestamp: number;
}

export interface MechanicalHealth {
  alignmentUpper: number; // Load Cell Top (Newtons)
  alignmentLower: number; // Load Cell Bottom (Newtons)
  isCompressorOn: boolean; // Active Cooling Status
  timestamp: number;
}

export interface FFTBin {
  f: number; // Frequency
  m: number; // Magnitude
}

export interface SingleFFTData {
  fs: number;          // Sampling Frequency
  bins: FFTBin[];      // Spectrum Bins
  peak: number;        // Peak Frequency (Hz)
  peakAmplitude?: number; // Peak Magnitude (g/m/s²) - Optional calculated field
}

export interface DualFFTData {
  sensor1: SingleFFTData | null; // Upper Sensor
  sensor2: SingleFFTData | null; // Lower Sensor
  timestamp: number;
}

export interface EnergyData {
  totalEnergy: number; // Wh
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