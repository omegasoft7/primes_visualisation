import {
  BaseVisualization,
  VisualizationConfig,
  VisualizationMode,
  UlamSpiral,
  SacksSpiral,
  PolarSpiral,
  ModularGrid,
  Spherical3D,
  PrimeGaps,
} from './visualizations';
import { firstNPrimes } from './utils/primeGenerator';

// DOM Elements
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const modeSelect = document.getElementById('mode') as HTMLSelectElement;
const countSlider = document.getElementById('count') as HTMLInputElement;
const countValue = document.getElementById('countValue') as HTMLSpanElement;
const countMinusBtn = document.getElementById('countMinus') as HTMLButtonElement;
const countPlusBtn = document.getElementById('countPlus') as HTMLButtonElement;
const pointSizeSlider = document.getElementById('pointSize') as HTMLInputElement;
const modulusInput = document.getElementById('modulus') as HTMLInputElement;
const loadingEl = document.getElementById('loading') as HTMLDivElement;
const statsEl = document.getElementById('stats') as HTMLDivElement;
const infoEl = document.getElementById('info') as HTMLDivElement;
const resetViewBtn = document.getElementById('resetView') as HTMLButtonElement;
const showPrimeLabelsCheckbox = document.getElementById('showPrimeLabels') as HTMLInputElement;
const showCompositeLabelsCheckbox = document.getElementById('showCompositeLabels') as HTMLInputElement;

// State
let currentVisualization: BaseVisualization | null = null;
let currentMode: VisualizationMode = 'ulam';
let primes: number[] = [];
let animationId: number;

// Create visualization instance based on mode
function createVisualization(mode: VisualizationMode): BaseVisualization {
  switch (mode) {
    case 'ulam':
      return new UlamSpiral(canvas);
    case 'sacks':
      return new SacksSpiral(canvas);
    case 'polar':
      return new PolarSpiral(canvas);
    case 'grid':
      return new ModularGrid(canvas);
    case '3d':
      return new Spherical3D(canvas);
    case 'gaps':
      return new PrimeGaps(canvas);
    default:
      return new UlamSpiral(canvas);
  }
}

// Generate primes and update visualization
async function updateVisualization(): Promise<void> {
  const count = parseInt(countSlider.value);
  const pointSize = parseFloat(pointSizeSlider.value);
  const modulus = parseInt(modulusInput.value);
  const showPrimeLabels = showPrimeLabelsCheckbox.checked;
  const showCompositeLabels = showCompositeLabelsCheckbox.checked;

  loadingEl.style.display = 'block';

  // Use setTimeout to allow UI to update
  await new Promise(resolve => setTimeout(resolve, 10));

  const startTime = performance.now();

  // Generate primes
  primes = firstNPrimes(count);

  const genTime = performance.now() - startTime;

  const config: VisualizationConfig = {
    primes,
    pointSize,
    modulus,
    showPrimeLabels,
    showCompositeLabels,
  };

  currentVisualization?.update(config);
  
  const renderTime = performance.now() - startTime - genTime;
  
  // Update stats
  statsEl.innerHTML = `
    Primes: <span>${primes.length.toLocaleString()}</span> | 
    Max: <span>${primes[primes.length - 1]?.toLocaleString()}</span> | 
    Gen: <span>${genTime.toFixed(1)}ms</span> | 
    Render: <span>${renderTime.toFixed(1)}ms</span>
  `;
  
  // Update info panel
  const info = currentVisualization?.getInfo();
  if (info) {
    infoEl.innerHTML = `<h3>${info.title}</h3><p>${info.description}</p>`;
  }
  
  loadingEl.style.display = 'none';
}

// Switch visualization mode
function switchMode(mode: VisualizationMode): void {
  if (currentVisualization) {
    cancelAnimationFrame(animationId);
    currentVisualization.dispose();
  }

  currentMode = mode;
  currentVisualization = createVisualization(mode);

  // Enable/disable modulus input based on mode
  const isGridMode = mode === 'grid';
  modulusInput.disabled = !isGridMode;
  modulusInput.style.opacity = isGridMode ? '1' : '0.4';
  modulusInput.style.cursor = isGridMode ? 'text' : 'not-allowed';

  updateVisualization();
  animate();
}

// Animation loop
function animate(): void {
  animationId = requestAnimationFrame(animate);
  currentVisualization?.render();
}

// Event listeners
modeSelect.addEventListener('change', () => {
  switchMode(modeSelect.value as VisualizationMode);
});

countSlider.addEventListener('input', () => {
  countValue.textContent = parseInt(countSlider.value).toLocaleString();
});

countSlider.addEventListener('change', () => {
  updateVisualization();
});

pointSizeSlider.addEventListener('input', () => {
  updateVisualization();
});

modulusInput.addEventListener('change', () => {
  if (currentMode === 'grid') {
    updateVisualization();
  }
});

// Count +/- buttons
function adjustCount(delta: number): void {
  const currentCount = parseInt(countSlider.value);
  const newCount = Math.max(1, Math.min(1000000, currentCount + delta));
  countSlider.value = String(newCount);
  countValue.textContent = newCount.toLocaleString();
  updateVisualization();
}

countMinusBtn.addEventListener('click', () => adjustCount(-1));
countPlusBtn.addEventListener('click', () => adjustCount(1));

// Reset view button
resetViewBtn.addEventListener('click', () => {
  currentVisualization?.resetCamera();
});

// Label checkboxes
showPrimeLabelsCheckbox.addEventListener('change', () => {
  updateVisualization();
});

showCompositeLabelsCheckbox.addEventListener('change', () => {
  updateVisualization();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' || e.key === 'R') {
    currentVisualization?.resetCamera();
  }
});

// Initialize
function init(): void {
  // Set canvas size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  // Start with Ulam spiral
  switchMode('ulam');
}

init();

