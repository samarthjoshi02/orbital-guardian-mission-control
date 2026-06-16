'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, PositionData } from '../store/useStore';

const EARTH_R3F_RADIUS = 2.0;
const ALTITUDE_SCALE = 2.0 / 6378.137; // Scale altitude to match Earth radius of 2.0

// Helper to convert lat, lon, alt (km) to 3D Cartesian coordinates
function getCartesian(lat: number, lon: number, alt: number) {
  const r = EARTH_R3F_RADIUS + (alt * ALTITUDE_SCALE);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(r * Math.sin(phi) * Math.sin(theta));
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

// 3D Earth Globe Component
function EarthGlobe() {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Rotate Earth slowly in real-time
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.03;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.02;
    }
  });

  // Create grid lines geometry procedurally
  const gridGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(EARTH_R3F_RADIUS, 30, 30);
    return new THREE.EdgesGeometry(geo);
  }, []);

  return (
    <group>
      {/* Glow / Atmosphere Sphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_R3F_RADIUS * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#22D3EE"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main Earth Body (Futuristic Dark Mirror) */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[EARTH_R3F_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color="#0B1120"
          roughness={0.15}
          metalness={0.9}
          emissive="#0B1120"
          emissiveIntensity={0.2}
        />
        
        {/* Holographic Continents wireframe overlay */}
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial color="#8B5CF6" transparent opacity={0.15} />
        </lineSegments>

        {/* Equatorial Ring Grid line */}
        <gridHelper 
          args={[EARTH_R3F_RADIUS * 2.5, 10, '#22D3EE', '#111827']} 
          position={[0, 0, 0]} 
          rotation={[0, 0, 0]}
        />
      </mesh>
    </group>
  );
}

// Active orbits visualizer
function OrbitLines() {
  const { selectedObject, selectedConjunction, positions } = useStore();

  const orbitPath = useMemo(() => {
    let targetId: number | null = null;
    
    if (selectedObject) {
      targetId = selectedObject.norad_id;
    } else if (selectedConjunction) {
      targetId = selectedConjunction.satellite_id;
    }

    if (!targetId || positions.length === 0) return null;

    // Search for target object position
    const target = positions.find((p) => p.id === targetId);
    if (!target) return null;

    // Approximate a circular orbit path based on current position and altitude
    const points: THREE.Vector3[] = [];
    const r = EARTH_R3F_RADIUS + (target.alt * ALTITUDE_SCALE);
    
    // We construct a circle rotated according to inclination proxy
    // In LEO, orbits are circular approximations.
    const steps = 64;
    const posVec = new THREE.Vector3(target.r[0], target.r[1], target.r[2]).normalize();
    
    // Create an orthonormal basis around the position vector to make a circle
    const randomVec = new THREE.Vector3(0, 1, 0);
    if (Math.abs(posVec.dot(randomVec)) > 0.99) {
      randomVec.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(posVec, randomVec).normalize();
    const up = new THREE.Vector3().crossVectors(posVec, right).normalize();

    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      const point = new THREE.Vector3()
        .addScaledVector(right, x)
        .addScaledVector(up, y);
      points.push(point);
    }

    return new THREE.CatmullRomCurve3(points);
  }, [selectedObject, selectedConjunction, positions]);

  if (!orbitPath) return null;

  return (
    <group>
      <mesh>
        <tubeGeometry args={[orbitPath, 64, 0.008, 8, true]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Render Space Satellites & Debris using InstancedMesh for high performance
function SpaceObjectsMesh() {
  const { positions, selectedObject, selectedConjunction, setSelectedObject } = useStore();
  const satMeshRef = useRef<THREE.InstancedMesh>(null);
  const debMeshRef = useRef<THREE.InstancedMesh>(null);

  const satelliteList = useMemo(() => positions.filter((p) => !p.is_debris), [positions]);
  const debrisList = useMemo(() => positions.filter((p) => p.is_debris), [positions]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // 1. Update Satellites instanced positions
    if (satMeshRef.current && satelliteList.length > 0) {
      satelliteList.forEach((sat, index) => {
        const pos = getCartesian(sat.lat, sat.lon, sat.alt);
        dummy.position.copy(pos);
        
        // Scale selected satellite slightly larger
        const isSelected = selectedObject?.norad_id === sat.id || selectedConjunction?.satellite_id === sat.id;
        dummy.scale.setScalar(isSelected ? 2.5 : 1.0);
        
        dummy.updateMatrix();
        satMeshRef.current!.setMatrixAt(index, dummy.matrix);
        
        // Highlight color
        if (isSelected) {
          color.set('#22D3EE'); // Bright cyan
        } else {
          color.set('#10B981'); // Green safe
        }
        satMeshRef.current!.setColorAt(index, color);
      });
      satMeshRef.current.instanceMatrix.needsUpdate = true;
      if (satMeshRef.current.instanceColor) {
        satMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    // 2. Update Debris instanced positions
    if (debMeshRef.current && debrisList.length > 0) {
      debrisList.forEach((deb, index) => {
        const pos = getCartesian(deb.lat, deb.lon, deb.alt);
        dummy.position.copy(pos);
        
        const isSelected = selectedObject?.norad_id === deb.id || selectedConjunction?.debris_id === deb.id;
        dummy.scale.setScalar(isSelected ? 2.5 : 1.0);
        
        dummy.updateMatrix();
        debMeshRef.current!.setMatrixAt(index, dummy.matrix);
        
        // Set color depending on conjunction participation
        if (isSelected) {
          color.set('#F59E0B'); // Orange selected
        } else if (selectedConjunction && selectedConjunction.debris_id === deb.id) {
          color.set('#EF4444'); // Red danger
        } else {
          color.set('#F59E0B'); // Normal yellow/orange debris
        }
        debMeshRef.current!.setColorAt(index, color);
      });
      debMeshRef.current.instanceMatrix.needsUpdate = true;
      if (debMeshRef.current.instanceColor) {
        debMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [satelliteList, debrisList, selectedObject, selectedConjunction]);

  return (
    <group>
      {/* Satellites: spheres */}
      {satelliteList.length > 0 && (
        <instancedMesh
          ref={satMeshRef}
          args={[null as any, null as any, satelliteList.length]}
        >
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial />
        </instancedMesh>
      )}

      {/* Debris: small boxes/spheres */}
      {debrisList.length > 0 && (
        <instancedMesh
          ref={debMeshRef}
          args={[null as any, null as any, debrisList.length]}
        >
          <boxGeometry args={[0.012, 0.012, 0.012]} />
          <meshBasicMaterial />
        </instancedMesh>
      )}
    </group>
  );
}

// Main 3D Earth visualization container
export default function EarthCanvas() {
  const { isPlaying, simulationTime, timeScale, fetchPositions, setSimulationTime } = useStore();

  // Handle simulation clock tick on frontend
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const current = new Date(simulationTime);
      // Advance clock based on timeScale (e.g. 10x means 10 seconds per wall-clock second)
      const nextTime = new Date(current.getTime() + (1000 * timeScale));
      const nextIso = nextTime.toISOString();
      setSimulationTime(nextIso);
      fetchPositions(nextIso);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, simulationTime, timeScale, fetchPositions, setSimulationTime]);

  // Fetch initial positions
  useEffect(() => {
    fetchPositions(simulationTime);
  }, []);

  return (
    <div className="w-full h-full relative scanline-container">
      {/* Background HUD Grid details */}
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-30 z-0"></div>
      
      {/* HUD Corners */}
      <div className="hud-corner hud-corner-tl m-2"></div>
      <div className="hud-corner hud-corner-tr m-2"></div>
      <div className="hud-corner hud-corner-bl m-2"></div>
      <div className="hud-corner hud-corner-br m-2"></div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
        className="w-full h-full z-10"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 3, 5]} intensity={3.5} />
        
        {/* Starfield background */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />
        
        <EarthGlobe />
        <OrbitLines />
        <SpaceObjectsMesh />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={15.0}
          zoomSpeed={0.8}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* R3F Overlay Legend */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2 font-mono text-xs text-starlight-white opacity-80 bg-space-black/80 px-3 py-2 border border-starlight-white/10 rounded">
        <div className="text-[10px] text-electric-cyan font-bold tracking-wider mb-1">VISUALIZATION METRICS</div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span>Active Satellites</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-amber-500"></div>
          <span>Debris Objects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-electric-cyan"></div>
          <span>Selected Orbit Path</span>
        </div>
      </div>
    </div>
  );
}
