import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface VisualizationConfig {
  primes: number[];
  pointSize: number;
  modulus: number;
  showPrimeLabels: boolean;
  showCompositeLabels: boolean;
}

export interface VisualizationInfo {
  title: string;
  description: string;
}

export abstract class BaseVisualization {
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  protected renderer: THREE.WebGLRenderer;
  protected controls: OrbitControls;
  protected points: THREE.Points | null = null;
  protected container: HTMLElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.container = canvas.parentElement!;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1624);
    
    // Camera
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100000);
    this.camera.position.z = 500;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Controls
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    
    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  protected handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    
    this.renderer.setSize(width, height);
  }
  
  abstract update(config: VisualizationConfig): void;
  abstract getInfo(): VisualizationInfo;
  
  render(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  dispose(): void {
    if (this.points) {
      this.points.geometry.dispose();
      (this.points.material as THREE.Material).dispose();
      this.scene.remove(this.points);
    }
    this.clearLabels();
    this.controls.dispose();
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
  
  protected createPointsMaterial(size: number, vertexColors: boolean = true): THREE.PointsMaterial {
    return new THREE.PointsMaterial({
      size,
      vertexColors,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
  }

  resetCamera(): void {
    this.camera.position.set(0, 0, 500);
    this.controls.reset();
  }

  protected labelsGroup: THREE.Group | null = null;

  protected clearLabels(): void {
    if (this.labelsGroup) {
      this.labelsGroup.traverse((obj) => {
        if (obj instanceof THREE.Sprite) {
          obj.material.map?.dispose();
          obj.material.dispose();
        }
      });
      this.scene.remove(this.labelsGroup);
      this.labelsGroup = null;
    }
  }

  protected createTextSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // All labels are red
    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(material);
    // Size to fit within a 1x1 box with margins (0.8 = 80% of box, leaving 10% margin on each side)
    sprite.scale.set(0.8, 0.8, 1);

    return sprite;
  }

  protected addLabels(
    positions: Map<number, { x: number; y: number; z: number }>,
    primeSet: Set<number>,
    showPrimeLabels: boolean,
    showCompositeLabels: boolean
  ): void {
    this.clearLabels();

    if (!showPrimeLabels && !showCompositeLabels) return;

    this.labelsGroup = new THREE.Group();
    this.labelsGroup.name = 'labels';

    for (let n = 1; n <= 100; n++) {
      const pos = positions.get(n);
      if (!pos) continue;

      const isPrime = primeSet.has(n);

      if (isPrime && !showPrimeLabels) continue;
      if (!isPrime && !showCompositeLabels) continue;

      const sprite = this.createTextSprite(String(n));
      sprite.position.set(pos.x, pos.y, pos.z + 0.5);

      this.labelsGroup.add(sprite);
    }

    this.scene.add(this.labelsGroup);
  }
}

