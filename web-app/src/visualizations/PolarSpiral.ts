import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { hslToRgb } from '../utils/colors';

/**
 * Polar Spiral Visualization
 * 
 * Each prime p is plotted at polar coordinates (r, θ) = (p, p)
 * where p radians is the angle and p is the radius.
 * 
 * This creates mesmerizing spiral patterns:
 * - At small scale: ~6 spiral arms (because 6 radians ≈ 2π)
 * - At medium scale: ~44 spiral arms (because 44/7 ≈ 2π, related to 22/7 ≈ π)
 * - At large scale: ~710 rays (because 710/113 ≈ 2π, related to 355/113 ≈ π)
 * 
 * Missing arms correspond to residue classes that can't contain primes
 * (e.g., all even numbers, multiples of 3, etc.)
 */
export class PolarSpiral extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: 'Polar Spiral (p, p)',
      description: `Each prime p is plotted at polar coordinates where both radius and angle equal p.
        The spiral patterns emerge because:
        • 6 radians ≈ 2π → 6 spiral arms at small scale
        • 44/7 ≈ 2π (related to 22/7 ≈ π) → 44 arms at medium scale  
        • 710/113 ≈ 2π (related to 355/113 ≈ π) → rays at large scale
        Missing arms are residue classes with no primes (even numbers, multiples of 3, etc.).
        Made famous by a 3Blue1Brown video!`
    };
  }
  
  // Convert number n to (x, y) position in polar spiral
  private numberToPosition(n: number): { x: number; y: number } {
    const angle = n; // radians
    const radius = n;
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
    const primeSet = new Set(primes);

    // Only plot the primes (not all numbers)
    const positions: number[] = [];
    const colors: number[] = [];
    const positionMap = new Map<number, { x: number; y: number; z: number }>();

    const maxPrime = primes[primes.length - 1];

    // Store positions for all numbers 1-100 for labels
    for (let n = 1; n <= 100; n++) {
      const { x, y } = this.numberToPosition(n);
      positionMap.set(n, { x, y, z: 0 });
    }

    for (let i = 0; i < primes.length; i++) {
      const p = primes[i];
      const { x, y } = this.numberToPosition(p);
      positions.push(x, y, 0);

      // Color by residue class mod 6 to highlight the spiral arms
      const residue = p % 6;
      const hue = residue / 6;
      const color = hslToRgb(hue, 0.8, 0.6);
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
    this.camera.position.z = maxPrime * 1.2;
  }
}

