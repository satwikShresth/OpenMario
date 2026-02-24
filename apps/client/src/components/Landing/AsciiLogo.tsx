import { useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';

const VIDEO_ASPECT = 640 / 360; // 16:9
const CLIP_START   = 0;
const CLIP_END     = 98.64;

function VideoPlane() {
   const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

   useEffect(() => {
      const video = document.createElement('video');
      video.src = '/dragon-fight.mp4';
      video.muted = true;
      video.playsInline = true;

      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;

      const onMeta   = () => { video.currentTime = CLIP_START; };
      const onSeeked = () => { video.play().catch(() => {}); };

      video.addEventListener('loadedmetadata', onMeta);
      video.addEventListener('seeked', onSeeked, { once: true });
      video.load();
      setTexture(tex);

      return () => {
         video.removeEventListener('loadedmetadata', onMeta);
         video.removeEventListener('seeked', onSeeked);
         video.pause();
         video.src = '';
         tex.dispose();
      };
   }, []);

   useFrame(() => {
      if (!texture) return;
      const video = texture.image as HTMLVideoElement;
      if (video.readyState >= 2) {
         if (video.currentTime >= CLIP_END) video.currentTime = CLIP_START;
         texture.needsUpdate = true;
      }
   });

   return (
      <mesh>
         <planeGeometry args={[VIDEO_ASPECT * 2, 2]} />
         <meshBasicMaterial map={texture ?? undefined} />
      </mesh>
   );
}

export function AsciiLogo() {
   return (
      <div
         role='img'
         aria-label='Mario timelapse rendered as ASCII art'
         style={{ width: '100%', aspectRatio: `${640 / 360}` }}
      >
         <Canvas
            style={{ width: '100%', height: '100%' }}
            gl={{ alpha: true }}
            orthographic
            camera={{
               left: -VIDEO_ASPECT,
               right: VIDEO_ASPECT,
               top: 1,
               bottom: -1,
               near: 0.1,
               far: 10,
               position: [0, 0, 5],
            }}
         >
            <VideoPlane />
            <AsciiRenderer
               characters=' .,:;|=+xX$#@'
               invert={false}
               resolution={0.2}
               fgColor='white'
               bgColor='transparent'
            />
         </Canvas>
      </div>
   );
}
