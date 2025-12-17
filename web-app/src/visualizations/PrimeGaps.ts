import * as THREE from 'three';
import { BaseVisualization, VisualizationConfig, VisualizationInfo } from './BaseVisualization';
import { hslToRgb } from '../utils/colors';
import { primeGaps } from '../utils/primeGenerator';

/**
 * Prime Gaps Visualization
 * 
 * Shows the gaps (differences) between consecutive prime numbers.
 * 
 * The distribution of gaps reveals:
 * - Twin primes have gap = 2 (smallest possible for primes > 2)
 * - Cousin primes have gap = 4
 * - Sexy primes have gap = 6
 * - Gaps can be arbitrarily large (prime deserts)
 * 
 * The Twin Prime Conjecture states that there are infinitely many
 * pairs of primes with gap = 2 (still unproven!)
 */
export class PrimeGaps extends BaseVisualization {
  
  getInfo(): VisualizationInfo {
    return {
      title: 'Prime Gaps',
      description: `Visualizes the gaps between consecutive primes.
        
        • Gap 2: Twin primes (3,5), (11,13), (17,19)...
        • Gap 4: Cousin primes (7,11), (13,17)...
        • Gap 6: Sexy primes (5,11), (7,13)...
        
        The Twin Prime Conjecture (still unproven!) states there are
        infinitely many twin primes.
        
        Watch for "prime deserts" - large gaps where no primes exist.
        Color intensity shows gap size (brighter = larger gap).`
    };
  }
  
  update(config: VisualizationConfig): void {
    // Dispose old geometry
    if (this.points) {
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.scene.remove(this.points);
    }
    
    const { primes, pointSize } = config;
    const gaps = primeGaps(primes);

    // Clear any existing labels (gaps view doesn't use labels)
    this.clearLabels();
    
    if (gaps.length === 0) return;
    
    const maxGap = Math.max(...gaps);
    
    const positions: number[] = [];
    const colors: number[] = [];
    
    // Plot each gap as a point
    // X = prime index, Y = gap size
    for (let i = 0; i < gaps.length; i++) {
      const gap = gaps[i];
      
      // Arrange in a flowing pattern
      // X based on index, Y based on gap size
      const x = i * 0.5;
      const y = gap * 2;
      
      positions.push(x, y, 0);
      
      // Color by gap size
      // Small gaps (twin primes) = cyan
      // Medium gaps = yellow
      // Large gaps = red/magenta
      const normalized = gap / maxGap;
      const hue = 0.5 - normalized * 0.5; // Cyan to red
      const color = hslToRgb(hue, 0.9, 0.5 + normalized * 0.2);
      colors.push(color.r, color.g, color.b);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = this.createPointsMaterial(pointSize);
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
    
    // Add gap distribution histogram
    this.addHistogram(gaps, maxGap);
    
    // Center camera
    const centerX = gaps.length * 0.25;
    this.camera.position.set(centerX, maxGap, gaps.length * 0.4);
    this.controls.target.set(centerX, maxGap / 2, 0);
  }
  
  private addHistogram(gaps: number[], maxGap: number): void {
    // Remove existing histogram
    const existing = this.scene.getObjectByName('histogram');
    if (existing) {
      this.scene.remove(existing);
    }
    
    // Count gap frequencies
    const counts: Map<number, number> = new Map();
    for (const gap of gaps) {
      counts.set(gap, (counts.get(gap) || 0) + 1);
    }
    
    const histGroup = new THREE.Group();
    histGroup.name = 'histogram';
    
    const maxCount = Math.max(...counts.values());
    const barWidth = 0.8;
    
    counts.forEach((count, gap) => {
      if (gap % 2 !== 0 && gap !== 1) return; // Only even gaps (except 1)
      
      const height = (count / maxCount) * 50;
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
      
      const hue = 0.5 - (gap / maxGap) * 0.5;
      const color = hslToRgb(hue, 0.7, 0.4);
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(color.r, color.g, color.b),
        transparent: true,
        opacity: 0.6
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(-50 + gap * 2, height / 2, -20);
      histGroup.add(bar);
    });
    
    this.scene.add(histGroup);
  }
}

