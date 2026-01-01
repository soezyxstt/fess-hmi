// utils/vibration-analysis.ts

// --- CONFIGURATION: BEARING GEOMETRY (Example: 608 Ceramic) ---
const BALL_COUNT = 7;
const BALL_DIAMETER = 3.969; // mm
const PITCH_DIAMETER = 22.0; // mm
const CONTACT_ANGLE = 0;     // degrees

// --- THRESHOLDS (in 'g' or 'm/s²' depending on your sensor) ---
const THRESHOLD_WARNING = 0.5; // Example value
const THRESHOLD_DANGER = 1.0;  // Example value

export type HealthStatus = 'NORMAL' | 'WARNING' | 'DANGER';

export interface DiagnosisResult {
  status: HealthStatus;
  fault: string;
  confidence: number; // 0-100%
  amplitude: number;
}

export function analyzeVibration(
  rpm: number,
  peakFreq: number,
  peakAmp: number
): DiagnosisResult {
  
  // 1. Determine Severity based on Amplitude
  let status: HealthStatus = 'NORMAL';
  if (peakAmp >= THRESHOLD_DANGER) status = 'DANGER';
  else if (peakAmp >= THRESHOLD_WARNING) status = 'WARNING';

  // If essentially not rotating or no vibration, return clean state
  if (rpm < 100 || peakAmp < 0.05) {
    return { status: 'NORMAL', fault: 'System Idle / Stable', confidence: 100, amplitude: peakAmp };
  }

  // 2. Calculate Characteristic Frequencies (Hz)
  const freqRot = rpm / 60; // 1x RPM (Fundamental)
  const cosPhi = Math.cos((CONTACT_ANGLE * Math.PI) / 180);
  const factor = BALL_DIAMETER / PITCH_DIAMETER;

  // Bearing Fault Formulas
  const bpfo = (BALL_COUNT / 2) * freqRot * (1 - factor * cosPhi);
  const bpfi = (BALL_COUNT / 2) * freqRot * (1 + factor * cosPhi);
  const ftf = (freqRot / 2) * (1 - factor * cosPhi);
  const bsf = (PITCH_DIAMETER / (2 * BALL_DIAMETER)) * freqRot * (1 - (factor * cosPhi) ** 2);

  // 3. Match Peak Frequency to Faults (with 10% tolerance)
  const tolerance = 0.1; // +/- 10%
  const isMatch = (target: number) => Math.abs(peakFreq - target) / target <= tolerance;

  let fault = 'Unknown Vibration';
  let confidence = 0;

  if (isMatch(freqRot)) {
    fault = 'Unbalance (1x RPM)';
    confidence = 90;
  } else if (isMatch(2 * freqRot)) {
    fault = 'Misalignment (2x RPM)';
    confidence = 85;
  } else if (isMatch(3 * freqRot)) {
    fault = 'Mechanical Looseness (3x RPM)';
    confidence = 80;
  } else if (isMatch(bpfo)) {
    fault = 'Bearing Outer Race (BPFO)';
    confidence = 95;
  } else if (isMatch(bpfi)) {
    fault = 'Bearing Inner Race (BPFI)';
    confidence = 95;
  } else if (isMatch(ftf)) {
    fault = 'Cage Fault (FTF)';
    confidence = 70;
  } else if (isMatch(bsf)) {
    fault = 'Ball Spin Fault (BSF)';
    confidence = 70;
  } else {
    // If high vibration but no frequency match
    if (status !== 'NORMAL') {
      fault = 'Unclassified High Vibration';
      confidence = 50;
    } else {
      fault = 'Normal Operation';
      confidence = 100;
    }
  }

  return { status, fault, confidence, amplitude: peakAmp };
}