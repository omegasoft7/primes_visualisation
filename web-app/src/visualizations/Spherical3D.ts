import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { hslToRgb } from '../utils/colors';

/**
 * 3D Spherical Visualization
 * 
 * Extends the polar spiral concept to 3D using spherical coordinates.
 * Each prime p is plotted at:
 *   x = p * cos(p) * sin(p)
 *   y = p * sin²(p)  
 *   z = p * cos(p)
 * 
 * This creates a beautiful 3D "infinity spiral" pattern where the
 * galactic arms weave in and out of each other.
 */
export class Spherical3D extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: '3D Spherical Spiral',
      description: `Extends the 2D polar spiral into 3D using spherical coordinates.
        Each prime p is plotted at (p, p, p) in spherical coordinates, creating
        an "infinity spiral" where galactic arms weave in and out.
        
        The same residue class patterns appear, but now you can see
        how the spiral arms interconnect in 3D space.
        
        Rotate the view to explore the structure!`
    };
  }
  
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    // Enable rotation for 3D view
    this.controls.enableRotate = true;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
  }
  
  // Convert number n to (x, y, z) position in 3D spherical
  private numberToPosition(n: number): { x: number; y: number; z: number } {
    const theta = n; // Azimuthal angle
    const phi = n;   // Polar angle
    const r = Math.sqrt(n) * 10; // Use sqrt for better distribution

    return {
      x: r * Math.cos(theta) * Math.sin(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(phi)
    };
  }

  update(config: VisualizationConfig): void {
    // Dispose old geometry
    if (this.points) {
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.scene.remove(this.points);
    }

    const { primes, pointSize, showPrimeLabels, showCompositeLabels } = config;
    const primeSet = new Set(primes);

    const positions: number[] = [];
    const colors: number[] = [];
    const positionMap = new Map<number, { x: number; y: number; z: number }>();

    const maxPrime = primes[primes.length - 1];

    // Store positions for all numbers 1-100 for labels
    for (let n = 1; n <= 100; n++) {
      positionMap.set(n, this.numberToPosition(n));
    }

    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const pos = this.numberToPosition(p);
      positions.push(pos.x, pos.y, pos.z);

      // Color by position in sequence (creates gradient effect)
      const hue = (i / primes.length) * 0.8;
      const color = hslToRgb(hue, 0.8, 0.55);
      colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = this.createPointsMaterial(pointSize);
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    // Add labels for numbers 1-100
    this.addLabels(positionMap, primeSet, showPrimeLabels, showCompositeLabels);

    // Add some ambient structure - coordinate axes
    this.addAxes(Math.sqrt(maxPrime) * 12);

    // Adjust camera
    this.camera.position.set(
      Math.sqrt(maxPrime) * 15,
      Math.sqrt(maxPrime) * 10,
      Math.sqrt(maxPrime) * 15
    );
    this.controls.update();
  }
  
  private addAxes(size: number): void {
    // Remove existing axes
    const existingAxes = this.scene.getObjectByName('axes');
    if (existingAxes) {
      this.scene.remove(existingAxes);
    }
    
    const axesGroup = new THREE.Group();
    axesGroup.name = 'axes';

    // X axis (red tint)
    const xGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-size, 0, 0),
      new THREE.Vector3(size, 0, 0)
    ]);
    axesGroup.add(new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: 0x442222, transparent: true, opacity: 0.3 })));
    
    // Y axis (green tint)
    const yGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -size, 0),
      new THREE.Vector3(0, size, 0)
    ]);
    axesGroup.add(new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0x224422, transparent: true, opacity: 0.3 })));
    
    // Z axis (blue tint)
    const zGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -size),
      new THREE.Vector3(0, 0, size)
    ]);
    axesGroup.add(new THREE.Line(zGeom, new THREE.LineBasicMaterial({ color: 0x222244, transparent: true, opacity: 0.3 })));
    
    this.scene.add(axesGroup);
  }
}

