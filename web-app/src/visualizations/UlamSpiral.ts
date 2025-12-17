import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { primeColor } from '../utils/colors';

/**
 * Ulam Spiral Visualization
 * 
 * Numbers are arranged in a square spiral pattern:
 *   17 16 15 14 13
 *   18  5  4  3 12
 *   19  6  1  2 11
 *   20  7  8  9 10
 *   21 22 23 24 25
 * 
 * Primes are highlighted, revealing diagonal patterns.
 */
export class UlamSpiral extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: 'Ulam Spiral',
      description: `Discovered by Stanisław Ulam in 1963 while doodling during a boring lecture. 
        Numbers are written in a square spiral, with primes highlighted. 
        The striking diagonal patterns correspond to prime-generating quadratic polynomials like Euler's x² − x + 41.
        Starting from 41 gives an unbroken string of 40 primes!`
    };
  }
  
  // Convert number n to (x, y) position in Ulam spiral
  private numberToPosition(n: number): { x: number; y: number } {
    if (n === 1) return { x: 0, y: 0 };
    
    // Find which "ring" the number is in
    const k = Math.ceil((Math.sqrt(n) - 1) / 2);
    const maxInRing = (2 * k + 1) ** 2;
    const sideLength = 2 * k;
    
    // Position relative to max in ring
    const offset = maxInRing - n;
    
    // Which side of the ring
    const side = Math.floor(offset / sideLength);
    const pos = offset % sideLength;
    
    switch (side) {
      case 0: // Right side (going up)
        return { x: k, y: k - pos };
      case 1: // Top side (going left)
        return { x: k - pos, y: -k };
      case 2: // Left side (going down)
        return { x: -k, y: -k + pos };
      case 3: // Bottom side (going right)
        return { x: -k + pos, y: k };
      default:
        return { x: k - pos, y: k };
    }
  }
  
  update(config: VisualizationConfig): void {
    // Dispose old geometry
    if (this.points) {
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.scene.remove(this.points);
    }

    const { primes, pointSize, showPrimeLabels, showCompositeLabels } = config;
    const maxPrime = primes[primes.length - 1];
    const primeSet = new Set(primes);

    // Create geometry for all numbers up to max prime
    const positions: number[] = [];
    const colors: number[] = [];
    const positionMap = new Map<number, { x: number; y: number; z: number }>();

    for (let n = 1; n <= maxPrime; n++) {
      const { x, y } = this.numberToPosition(n);
      positions.push(x, y, 0);

      // Store positions for labels (first 100 numbers)
      if (n <= 100) {
        positionMap.set(n, { x, y, z: 0 });
      }

      const isPrime = primeSet.has(n);
      const color = primeColor(isPrime);
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

    // Adjust camera to fit
    const maxK = Math.ceil((Math.sqrt(maxPrime) - 1) / 2);
    this.camera.position.z = maxK * 2.5;
  }
}

