'use client'

import * as THREE from 'three'
import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, CameraControls, ContactShadows, Grid } from '@react-three/drei'
import { useMQTT } from '@/hooks/useMQTT'
import { SkeletonUtils } from 'three-stdlib'

// Temperature to heat overlay with stronger visibility
function getHeatOverlay(temp: number, minTemp = 20, maxTemp = 100) {
  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)))

  // Bright red for better visibility
  const heatColor = new THREE.Color(0xff0000) // Bright red instead of dark red

  // Color blend strength: 0 at min temp, 0.95 at max temp
  const blendStrength = normalized * 0.95

  // Emissive intensity for glow effect
  const emissiveIntensity = normalized * 2.0 // Increased from 0.95 to 2.0

  return { color: heatColor, blendStrength, emissiveIntensity }
}

interface RotatingModelProps {
  rpm?: number
  t1: number
}

function RotatingModel({ rpm = 20, t1 }: RotatingModelProps) {
  const group = useRef<THREE.Group>(null)
  const statorMeshes = useRef<{
    mesh: THREE.Mesh
    originalColor: THREE.Color
    originalEmissive: THREE.Color
    originalEmissiveIntensity: number
  }[]>([])

  const { scene } = useGLTF('/models/full.glb')
  const clonedScene = useRef<THREE.Group>(null)

  useEffect(() => {
    clonedScene.current = SkeletonUtils.clone(scene) as THREE.Group

    if (group.current && clonedScene.current) {
      group.current.clear()
      group.current.add(clonedScene.current)

      statorMeshes.current = []

      clonedScene.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log('Mesh name:', child.name)

          // Updated mesh name filter
          if (child.name.toLowerCase().includes('assembly_plastic_base')) {
            console.log('✓ Found assembly_plastic_base mesh:', child.name)

            if (Array.isArray(child.material)) {
              child.material = child.material.map(mat => mat.clone())
              const mat = child.material[0] as THREE.MeshStandardMaterial
              statorMeshes.current.push({
                mesh: child,
                originalColor: mat.color.clone(),
                originalEmissive: mat.emissive.clone(),
                originalEmissiveIntensity: mat.emissiveIntensity || 0
              })
            } else {
              const originalMat = child.material as THREE.MeshStandardMaterial

              statorMeshes.current.push({
                mesh: child,
                originalColor: originalMat.color.clone(),
                originalEmissive: originalMat.emissive.clone(),
                originalEmissiveIntensity: originalMat.emissiveIntensity || 0
              })

              child.material = originalMat.clone()
            }
          }
        }
      })

      console.log(`Total assembly_plastic_base meshes found: ${statorMeshes.current.length}`)
    }
  }, [scene])

  // Apply strong heat overlay based on temperature
  useEffect(() => {
    if (t1 === undefined || isNaN(t1)) {
      console.warn('Invalid temperature value:', t1)
      return
    }

    if (statorMeshes.current.length === 0) {
      console.warn('No assembly_plastic_base meshes found yet')
      return
    }

    const { color: heatColor, blendStrength, emissiveIntensity } = getHeatOverlay(t1)
    console.log(`Temperature: ${t1}°C, Blend: ${blendStrength.toFixed(2)}, Emissive: ${emissiveIntensity.toFixed(2)}`)

    statorMeshes.current.forEach(({ mesh, originalColor }) => {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial) {
            // Blend original color with heat color
            mat.color.copy(originalColor).lerp(heatColor, blendStrength)

            // Add strong emissive glow
            mat.emissive.copy(heatColor)
            mat.emissiveIntensity = emissiveIntensity
            mat.needsUpdate = true
          }
        })
      } else {
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial

        // Blend: originalColor at min temp → red at max temp
        mat.color.copy(originalColor).lerp(heatColor, blendStrength)

        // Strong emissive for heat glow effect
        mat.emissive.copy(heatColor)
        mat.emissiveIntensity = emissiveIntensity
        mat.needsUpdate = true
      }
    })
  }, [t1])

  // Rotation animation
  useFrame((_, dt) => {
    const omega = (2 * Math.PI * rpm) / 60
    if (group.current) group.current.rotation.y += omega * dt
  })

  return <group ref={group} />
}

export default function ThreeD() {
  const {
    connectionStatus,
    temperatureData: { t1, t2, t3 },
  } = useMQTT()

  useEffect(() => {
    console.log('Temperature t1:', t1)
  }, [t1])

  return (
    <Canvas
      className="h-screen w-full"
      shadows
      camera={{ position: [-1, 0.5, 3], fov: 45 }}
    >
      <color attach="background" args={['#e7e7e7']} />

      <Environment
        preset="studio"
        environmentIntensity={1}
        background={false}
        ground={{ height: 10, radius: 60, scale: 1000 }}
        backgroundBlurriness={0.4}
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.3}
        blur={2.5}
        far={10}
        resolution={1024}
        frames={1}
      />

      <ambientLight intensity={0.6} />
      <spotLight
        position={[6, 8, 6]}
        angle={0.35}
        penumbra={0.6}
        intensity={1500}
        castShadow
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-6, 4, -6]} intensity={0.8} />

      <Suspense fallback={null}>
        <RotatingModel rpm={20} t1={t1} />
      </Suspense>

      <CameraControls />

      <Grid sectionColor="#999" cellColor="#bbb" position={[0, -0.001, 0]} args={[30, 30]} />
    </Canvas>
  )
}

useGLTF.preload('/models/full.glb')
