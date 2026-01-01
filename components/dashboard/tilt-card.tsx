'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TiltData } from '@/types/sensor-data';
import { Activity, Move3d } from 'lucide-react';
import { Suspense } from 'react';

// --- 3D Components ---

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#f1f5f9" opacity={0.5} transparent />
      <gridHelper args={[20, 20, 0xcbd5e1, 0xe2e8f0]} />
    </mesh>
  );
}

function TiltingPlatform({ pitch, roll }: { pitch: number; roll: number }) {
  // Convert degrees to radians
  const pitchRad = (pitch * Math.PI) / 180;
  const rollRad = (roll * Math.PI) / 180;

  return (
    <group rotation={[pitchRad, 0, -rollRad]}>
      {/* The "Table" or Device Body */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[3, 0.2, 3]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Axis Indicators */}
      {/* X Axis (Roll) - Red */}
      <mesh position={[1.8, 0, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Z Axis (Pitch) - Blue */}
      <mesh position={[0, 0, 1.8]}>
        <boxGeometry args={[0.05, 0.05, 0.5]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Center Marker */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// --- Main Component ---

interface TiltCardProps {
  data: TiltData | null;
}

export function TiltCard({ data }: TiltCardProps) {
  const pitch = data?.pitch || 0;
  const roll = data?.roll || 0;

  return (
    // ADDED: h-full and flex-col to force the card to fill the parent grid cell
    <Card className="h-full flex flex-col shadow-sm border-border bg-card">
      <CardHeader className="py-3 px-4 border-b border-border bg-muted/20 flex-none">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move3d className="w-4 h-4 text-primary" />
            <span>Live Tilt</span>
          </div>
          <div className="flex gap-3 text-xs font-mono text-muted-foreground">
            <span>P: <strong className="text-foreground">{pitch.toFixed(1)}°</strong></span>
            <span>R: <strong className="text-foreground">{roll.toFixed(1)}°</strong></span>
          </div>
        </CardTitle>
      </CardHeader>

      {/* ADDED: flex-1 relative min-h-[200px] to force expansion */}
      <CardContent className="p-0 flex-1 relative min-h-[200px] w-full bg-slate-50/50 dark:bg-slate-900/50">
        <div className="absolute inset-0">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 3, 6]} fov={50} />
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />

            <ambientLight intensity={0.5} />
            <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1000} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={500} />

            <Environment preset="city" />

            <Suspense fallback={null}>
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                <TiltingPlatform pitch={pitch} roll={roll} />
              </Float>
              <GroundPlane />
            </Suspense>
          </Canvas>

          {/* Optional: Overlay Text for Context */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border border-border">
              <Activity className="w-3 h-3" />
              <span>Real-time ADXL345 feed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}