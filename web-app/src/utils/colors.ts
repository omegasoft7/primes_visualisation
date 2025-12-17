/**
 * Color utilities for prime visualizations
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): RGB {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r, g, b };
}

// Generate color based on value (for gaps, modular arithmetic, etc.)
export function valueToColor(value: number, max: number, colorScheme: 'rainbow' | 'heat' | 'cool' = 'rainbow'): RGB {
  const normalized = Math.min(value / max, 1);
  
  switch (colorScheme) {
    case 'rainbow':
      return hslToRgb(normalized * 0.8, 0.8, 0.5);
    case 'heat':
      // Black -> Red -> Orange -> Yellow -> White
      if (normalized < 0.25) {
        return { r: normalized * 4, g: 0, b: 0 };
      } else if (normalized < 0.5) {
        return { r: 1, g: (normalized - 0.25) * 4, b: 0 };
      } else if (normalized < 0.75) {
        return { r: 1, g: 1, b: (normalized - 0.5) * 4 };
      } else {
        return { r: 1, g: 1, b: 1 };
      }
    case 'cool':
      // Deep blue -> Cyan -> Green
      return hslToRgb(0.5 + normalized * 0.2, 0.8, 0.3 + normalized * 0.4);
  }
}

// Color for prime vs composite
export function primeColor(isPrime: boolean): RGB {
  if (isPrime) {
    return { r: 0, g: 0.83, b: 1 }; // Cyan for primes
  }
  return { r: 0.15, g: 0.15, b: 0.2 }; // Dark for composites
}

// Color based on residue class
export function residueColor(value: number, modulus: number): RGB {
  const residue = value % modulus;
  const hue = residue / modulus;
  return hslToRgb(hue, 0.7, 0.5);
}

// Color based on smallest prime factor
export function factorColor(factors: number[]): RGB {
  if (factors.length === 0) return { r: 0.3, g: 0.3, b: 0.3 };
  if (factors.length === 1) return { r: 0, g: 0.83, b: 1 }; // Prime
  
  const smallestFactor = factors[0];
  const hue = (smallestFactor * 0.1) % 1;
  return hslToRgb(hue, 0.7, 0.5);
}

// Convert RGB to hex string
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// Convert RGB to Three.js compatible number
export function rgbToNumber(rgb: RGB): number {
  return (Math.round(rgb.r * 255) << 16) | (Math.round(rgb.g * 255) << 8) | Math.round(rgb.b * 255);
}

