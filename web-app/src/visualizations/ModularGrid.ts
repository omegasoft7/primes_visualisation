import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { hslToRgb } from '../utils/colors';

/**
 * Modular Grid Visualization
 * 
 * Numbers are arranged in a grid with 'modulus' columns.
 * Each column represents a residue class (n mod m).
 * 
 * For modulus 6: primes (except 2,3) only appear in columns 1 and 5
 * For modulus 10: primes (except 2,5) only appear in columns 1, 3, 7, 9
 * 
 * This reveals the structure of residue classes and Dirichlet's theorem:
 * primes are approximately evenly distributed among valid residue classes.
 */
export class ModularGrid extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: 'Modular Grid',
      description: `Numbers arranged in a grid with 'modulus' columns. 
        Each column is a residue class (n mod m).
        
        For mod 6: primes only appear in columns 1 and 5 (except 2, 3)
        For mod 10: primes only appear in columns 1, 3, 7, 9 (last digits of primes!)
        
        Dirichlet's Theorem states that primes are equally distributed 
        among residue classes that are coprime to the modulus.
        Change the modulus to explore different patterns!`
    };
  }
  
  private spacing = 1.2;

  // Convert number n to (x, y) position in grid
  private numberToPosition(n: number, modulus: number): { x: number; y: number } {
    const col = (n - 1) % modulus;
    const row = Math.floor((n - 1) / modulus);
    return {
      x: (col - modulus / 2) * this.spacing,
      y: -row * this.spacing
    };
  }

  update(config: VisualizationConfig): void {
    // Dispose old geometry
    if (this.points) {
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.scene.remove(this.points);
    }

    const { primes, pointSize, modulus, showPrimeLabels, showCompositeLabels } = config;
    const maxPrime = primes[primes.length - 1];
    const primeSet = new Set(primes);

    const positions: number[] = [];
    const colors: number[] = [];
    const positionMap = new Map<number, { x: number; y: number; z: number }>();

    for (let n = 1; n <= maxPrime; n++) {
      const { x, y } = this.numberToPosition(n, modulus);
      positions.push(x, y, 0);

      // Store positions for labels (first 100 numbers)
      if (n <= 100) {
        positionMap.set(n, { x, y, z: 0 });
      }

      const isPrime = primeSet.has(n);
      if (isPrime) {
        // Color primes by their residue class
        const col = (n - 1) % modulus;
        const hue = col / modulus;
        const color = hslToRgb(hue, 0.9, 0.6);
        colors.push(color.r, color.g, color.b);
      } else {
        // Dim composite numbers
        colors.push(0.1, 0.1, 0.15);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = this.createPointsMaterial(pointSize * 1.5);
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    // Add labels for numbers 1-100
    this.addLabels(positionMap, primeSet, showPrimeLabels, showCompositeLabels);

    // Adjust camera
    const rows = Math.ceil(maxPrime / modulus);
    this.camera.position.set(0, -rows * this.spacing / 2, Math.max(modulus * 3, rows * 0.5));
  }
}

