import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTemperature(temp: number): string {
  return `${temp.toFixed(2)}°C`;
}

export function formatPower(power: number): string {
  if (power >= 1000) {
    return `${(power / 1000).toFixed(2)} W`;
  }
  return `${power.toFixed(2)} mW`;
}

export function formatCurrent(current: number): string {
  if (current >= 1000) {
    return `${(current / 1000).toFixed(2)} A`;
  }
  return `${current.toFixed(2)} mA`;
}

export function formatVoltage(voltage: number): string {
  return `${voltage.toFixed(2)} V`;
}

export function formatEnergy(energy: number): string {
  if (energy >= 1000) {
    return `${(energy / 1000).toFixed(3)} kWh`;
  }
  return `${energy.toFixed(3)} Wh`;
}

export function formatFrequency(freq: number): string {
  return `${freq.toFixed(1)} Hz`;
}

export function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function getTemperatureColor(temp: number): string {
  if (temp >= 40) return "text-red-500";
  if (temp >= 30) return "text-orange-500";
  return "text-blue-400";
}

export function getTemperatureStatus(temp: number): string {
  if (temp >= 40) return "Hot";
  if (temp >= 30) return "Warm";
  return "Normal";
}
