# Prime Number Visualizations

An interactive web application for visualizing prime numbers using various mathematical patterns and representations.

## Features

- **6 Visualization Modes:**
  - Ulam Spiral - Classic square spiral revealing diagonal patterns
  - Sacks Spiral - Archimedean spiral showing prime distribution
  - Polar Spiral - Radial visualization with angular positioning
  - Modular Grid - Grid display with configurable modulus
  - Prime Gaps - Visualization of gaps between consecutive primes
  - 3D Spherical - Interactive 3D spherical mapping

- **Interactive Controls:**
  - Adjust number of primes (100 to 1,000,000)
  - Configurable point size
  - Number labels for primes and composites (first 100)
  - Camera reset functionality
  - Real-time performance statistics

- **High Performance:**
  - Rust/WASM for fast prime generation using Sieve of Eratosthenes
  - Efficient rendering with Three.js
  - Handles up to 1 million primes smoothly

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- Rust (for building WASM module)
- wasm-pack (for compiling Rust to WASM)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/omegasoft7/primes_visualisation.git
   cd primes_visualisation
   ```

2. Install web app dependencies:
   ```bash
   cd web-app
   npm install
   ```

3. Build the WASM module (optional - uses JS fallback if not built):
   ```bash
   npm run build:wasm
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser: http://localhost:5173

## Project Structure

- rust-primes/ - Rust WASM module for prime generation
- web-app/ - TypeScript/Vite web application

## Available Scripts (from web-app/)

- npm run dev - Start development server
- npm run build - Build for production
- npm run build:wasm - Build Rust WASM module

## Keyboard Shortcuts

- R - Reset camera view

## Technology Stack

- Frontend: TypeScript, Three.js, Vite
- Backend/WASM: Rust with wasm-bindgen
- Rendering: WebGL via Three.js

## License

MIT License
