/**
 * FACE RENDERER - Three.js visualization
 * 
 * Renders the geometric Face of Earth in 3D:
 * - Hexagon (planetary structure)
 * - Lemniscate infinity loops (eyes - trajectory)
 * - Asymptote curve (mouth - momentum)
 * - Interactive, real-time updateable
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { calculateFace, renderFaceGeometry } from '../lib/geometry';

export default function FaceRenderer({ coherenceData }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(new THREE.Group());

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Dark background
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    // Add reference circle (perfect coherence)
    const circleGeometry = new THREE.BufferGeometry();
    const circlePoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      circlePoints.push(
        Math.cos(angle) * 100,
        Math.sin(angle) * 100,
        0
      );
    }
    circleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(circlePoints), 3));
    const circleMaterial = new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 1 });
    const circle = new THREE.Line(circleGeometry, circleMaterial);
    scene.add(circle);

    scene.add(groupRef.current);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update visualization when data changes
  useEffect(() => {
    if (!coherenceData || !sceneRef.current || !groupRef.current) return;

    // Clear previous geometry
    while (groupRef.current.children.length > 0) {
      groupRef.current.removeChild(groupRef.current.children[0]);
    }

    try {
      // Calculate face geometry
      const coherenceScores = [
        coherenceData.current.scores.climate,
        coherenceData.current.scores.biodiversity,
        coherenceData.current.scores.soil,
        coherenceData.current.scores.water,
        coherenceData.current.scores.energy,
        coherenceData.current.scores.governance
      ];

      const currentMomentum = coherenceData.current.momentum.overall;
      const trajectoryMomentum = coherenceData.projected.trajectoryMomentum;
      const trajectoryVolatility = coherenceData.projected.trajectoryVolatility;

      const faceData = calculateFace(
        coherenceScores,
        currentMomentum,
        trajectoryMomentum,
        trajectoryVolatility
      );

      const geometry = renderFaceGeometry(faceData);

      // Render hexagon
      renderHexagon(groupRef.current, geometry.hexagon);

      // Render eyes (lemniscate)
      renderEyes(groupRef.current, geometry.eyeLeft, geometry.eyeRight);

      // Render mouth (asymptote)
      renderMouth(groupRef.current, geometry.mouth);

      // Render system labels
      renderLabels(groupRef.current, geometry.hexagon);
    } catch (error) {
      console.error('Error rendering face:', error);
    }
  }, [coherenceData]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}

function renderHexagon(group, hexagonPoints) {
  // Draw hexagon edges
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < hexagonPoints.length; i++) {
    const next = (i + 1) % hexagonPoints.length;
    positions.push(
      hexagonPoints[i].x, hexagonPoints[i].y, hexagonPoints[i].z,
      hexagonPoints[next].x, hexagonPoints[next].y, hexagonPoints[next].z
    );
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  const material = new THREE.LineBasicMaterial({ color: 0xff6b6b, linewidth: 2 });
  const lines = new THREE.LineSegments(geometry, material);
  group.add(lines);

  // Draw vertices
  for (const point of hexagonPoints) {
    const sphereGeometry = new THREE.SphereGeometry(3, 16, 16);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(0.6, 0.7, 0.5 + point.score * 0.3)
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(point.x, point.y, point.z);
    group.add(sphere);
  }

  // Draw reference circle outline
  const circleGeometry = new THREE.BufferGeometry();
  const circlePoints = [];
  for (let i = 0; i <= 128; i++) {
    const angle = (i / 128) * Math.PI * 2;
    circlePoints.push(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      0.1
    );
  }
  circleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(circlePoints), 3));
  const circleMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1 });
  const circle = new THREE.Line(circleGeometry, circleMaterial);
  group.add(circle);
}

function renderEyes(group, eyeLeft, eyeRight) {
  // Left eye
  const eyeGeometry = new THREE.SphereGeometry(eyeLeft.radius, 32, 32);
  const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
  
  const leftEyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEyeMesh.position.set(eyeLeft.x, eyeLeft.y, eyeLeft.z);
  leftEyeMesh.rotation.z = eyeLeft.rotation;
  group.add(leftEyeMesh);

  // Right eye
  const rightEyeMesh = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEyeMesh.position.set(eyeRight.x, eyeRight.y, eyeRight.z);
  rightEyeMesh.rotation.z = eyeRight.rotation;
  group.add(rightEyeMesh);

  // Draw lemniscate (infinity symbol) connecting eyes
  const lemniscateGeometry = new THREE.BufferGeometry();
  const lemniscatePoints = [];
  
  for (let t = 0; t <= 100; t++) {
    const theta = (t / 100) * Math.PI * 2;
    // Lemniscate parametric: r = a * sqrt(cos(2*theta))
    const r = 40 * Math.sqrt(Math.abs(Math.cos(2 * theta)));
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta) * 0.3; // Flatten vertically
    lemniscatePoints.push(x, y, 2);
  }

  lemniscateGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lemniscatePoints), 3));
  const lemniscateMaterial = new THREE.LineBasicMaterial({ color: 0x4ecdc4, linewidth: 2 });
  const lemniscate = new THREE.Line(lemniscateGeometry, lemniscateMaterial);
  group.add(lemniscate);
}

function renderMouth(group, mouth) {
  // Draw mouth as bezier curve
  const mouthGeometry = new THREE.BufferGeometry();
  const mouthPoints = [];

  const startX = mouth.midX - mouth.width / 2;
  const endX = mouth.midX + mouth.width / 2;
  const midY = mouth.midY;

  for (let t = 0; t <= 100; t++) {
    const ratio = t / 100;
    const x = startX + (endX - startX) * ratio;
    
    // Quadratic bezier for mouth curve
    const controlY = Math.sin(mouth.curve) * mouth.steepness * 20;
    const y = midY + Math.sin(ratio * Math.PI) * controlY;
    
    mouthPoints.push(x, y, 1);
  }

  mouthGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mouthPoints), 3));
  
  // Color mouth based on momentum
  const mouthColor = mouth.isOffFrame ? 0xff0000 : mouth.steepness > 0.15 ? 0xff6b6b : 0xffa500;
  const mouthMaterial = new THREE.LineBasicMaterial({ color: mouthColor, linewidth: 3 });
  const mouthLine = new THREE.Line(mouthGeometry, mouthMaterial);
  group.add(mouthLine);
}

function renderLabels(group, hexagonPoints) {
  // This would require canvas rendering or sprite text
  // For now, just ensure points are visible
  // Future: Add canvas texture with system names
}
