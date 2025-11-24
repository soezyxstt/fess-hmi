import { pgTable, serial, text, real, boolean, timestamp, json, integer } from 'drizzle-orm/pg-core';

export const sensorReadings = pgTable('sensor_readings', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(), // Auto-timestamp
  
  // Temperature Sensors (store as generic float/real)
  tempMotor: real('temp_motor'),
  tempBearingTop: real('temp_bearing_top'),
  tempBearingBottom: real('temp_bearing_bottom'),

  // Vibration (FFT Data stored as JSON array, e.g., [0.1, 0.5, 0.02...])
  vibrationFft: json('vibration_fft'), 
  
  // Mechanical Status
  tiltAngle: real('tilt_angle'),
  motorSpeedRpm: integer('motor_speed_rpm'),

  // Electrical Input
  inputVoltage: real('input_voltage'),
  inputCurrent: real('input_current'),

  // Electrical Output
  outputVoltage: real('output_voltage'),
  outputCurrent: real('output_current'),

  // System Status
  isPowered: boolean('is_powered').default(false),
});