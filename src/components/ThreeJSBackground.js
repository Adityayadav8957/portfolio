import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 20;
      posArray[i + 1] = (Math.random() - 0.5) * 20;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
      
      // Create color variation
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5);
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Create geometric shapes
    const shapes = [];

    // Torus
    const torusGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x3a86ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-3, 2, -5);
    // scene.add(torus);
    shapes.push(torus);

    // Icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(1, 0);
    const icosahedronMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x667eea, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4 
    });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(3, -2, -3);
    // scene.add(icosahedron);
    shapes.push(icosahedron);

    // Octahedron
    const octahedronGeometry = new THREE.OctahedronGeometry(1.2, 0);
    const octahedronMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x764ba2, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.35 
    });
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.set(0, 3, -4);
    // scene.add(octahedron);
    shapes.push(octahedron);

    // Tetrahedron
    const tetrahedronGeometry = new THREE.TetrahedronGeometry(1, 0);
    const tetrahedronMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x5a67d8, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.4 
    });
    const tetrahedron = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
    tetrahedron.position.set(-2, -3, -6);
    // scene.add(tetrahedron);
    shapes.push(tetrahedron);

    // Box
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4c51bf, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.3 
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(4, 0, -7);
    // scene.add(box);
    shapes.push(box);

    // Camera position
    camera.position.z = 5;

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Rotate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      // Rotate shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 * (index + 1);
        shape.rotation.y += 0.005 * (index + 1);
        shape.rotation.z += 0.003 * (index + 1);
        
        // Subtle floating motion
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.003;
      });

      // Mouse interaction
      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Dispose of geometries and materials
      shapes.forEach(shape => {
        shape.geometry.dispose();
        shape.material.dispose();
      });
      
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} id="threejs-canvas" />;
};

export default ThreeJSBackground;