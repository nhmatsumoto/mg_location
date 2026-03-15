import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Splat, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useSplatStore } from '../../store/useSplatStore';

interface SplatSceneViewerProps {
  url?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const SplatSceneViewer: React.FC<SplatSceneViewerProps> = ({ 
  url, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1 
}) => {
  const { quality } = useSplatStore();
  
  // Map quality to splat parameters if needed
  // For now, @react-three/drei Splat is quite efficient out of box.

  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
      <Canvas 
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [5, 5, 5], fov: 45 }}
        gl={{ antialias: quality !== 'LOW' }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          <group position={position} rotation={rotation}>
            <Splat 
              src={url || ''} 
              scale={scale} 
              alphaTest={0.1}
            />
          </group>
          
          <ContactShadows 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
            color="#000000" 
          />
          
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={2} 
          maxDistance={50} 
          makeDefault 
        />
      </Canvas>

      {/* Loading Overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">
            Carregando Nuvem de Pontos...
          </p>
        </div>
      }>
        <SplatContent url={url} />
      </Suspense>
    </div>
  );
};

// Helper to wrap the Splat for Suspense handling if needed more granularly
const SplatContent = ({ url }: { url?: string }) => {
  if (!url) return null;
  return null; // The Splat component itself handles loading internally in fiber
};

export default SplatSceneViewer;
