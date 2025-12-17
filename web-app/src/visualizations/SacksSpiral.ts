import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { primeColor } from '../utils/colors';

/**
 * Sacks Spiral Visualization
 * 
 * Devised by Robert Sacks in 1994.
 * Numbers are plotted on an Archimedean spiral where:
 * - Each perfect square lands at the same angle (on the positive x-axis)
 * - One complete rotation per perfect square
 * 
 * This means: angle = 2π * sqrt(n), radius = sqrt(n)
 * 
 * Primes form beautiful curved patterns, and Euler's polynomial
 * x² - x + 41 appears as a single continuous curve.
 */
export class SacksSpiral extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: 'Sacks Spiral',
      description: `Created by Robert Sacks in 1994. Numbers are placed on an Archimedean spiral 
        where perfect squares (1, 4, 9, 16...) all align on the positive x-axis.
        Unlike the Ulam spiral, prime-generating polynomials like x² - x + 41 
        appear as smooth curves rather than diagonal lines.
        The gaps between spiral arms reveal prime distribution patterns.`
    };
  }
  
  // Convert number n to (x, y) position in Sacks spiral
  private numberToPosition(n: number): { x: number; y: number } {
    const sqrtN = Math.sqrt(n);
    const angle = 2 * Math.PI * sqrtN;
    const radius = sqrtN;
    
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
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
    const maxPrime = primes[primes.length - 1];
    const primeSet = new Set(primes);

    // Create geometry for all numbers
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

    // Adjust camera
    const maxRadius = Math.sqrt(maxPrime);
    this.camera.position.z = maxRadius * 2.5;
  }
}

