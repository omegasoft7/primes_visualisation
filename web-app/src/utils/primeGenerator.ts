/**
 * Prime number generation utilities
 * Uses optimized Sieve of Eratosthenes algorithm
 */

export function sieveOfEratosthenes(limit: number): number[] {
  if (limit < 2) return [];
  
  const isComposite = new Uint8Array(limit + 1);
  const primes: number[] = [];
  
  for (let i = 2; i <= limit; i++) {
    if (!isComposite[i]) {
      primes.push(i);
      // Mark multiples as composite
      for (let j = i * i; j <= limit; j += i) {
        isComposite[j] = 1;
      }
    }
  }
  
  return primes;
}

export function firstNPrimes(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [2];
  
  // Estimate upper bound using prime number theorem
  // p_n ≈ n * (ln(n) + ln(ln(n)))
  const lnN = Math.log(n);
  const estimate = n < 6 ? 15 : Math.ceil(n * (lnN + Math.log(lnN)) * 1.3);
  
  let primes = sieveOfEratosthenes(estimate);
  
  // Expand if we didn't get enough
  let multiplier = 2;
  while (primes.length < n) {
    primes = sieveOfEratosthenes(estimate * multiplier);
    multiplier *= 2;
  }
  
  return primes.slice(0, n);
}

export function primeGaps(primes: number[]): number[] {
  if (primes.length < 2) return [];
  
  const gaps: number[] = [];
  for (let i = 1; i < primes.length; i++) {
    gaps.push(primes[i] - primes[i - 1]);
  }
  return gaps;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  const sqrt = Math.sqrt(n);
  for (let i = 3; i <= sqrt; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

export function primeFactorization(n: number): number[] {
  const factors: number[] = [];
  if (n < 2) return factors;
  
  while (n % 2 === 0) {
    factors.push(2);
    n = Math.floor(n / 2);
  }
  
  for (let i = 3; i * i <= n; i += 2) {
    while (n % i === 0) {
      factors.push(i);
      n = Math.floor(n / i);
    }
  }
  
  if (n > 1) factors.push(n);
  return factors;
}

// Create a Set for fast prime lookup
export function createPrimeSet(primes: number[]): Set<number> {
  return new Set(primes);
}

// Get all numbers up to max and mark which are prime
export function getNumbersWithPrimeFlags(max: number): { number: number; isPrime: boolean }[] {
  const primeSet = new Set(sieveOfEratosthenes(max));
  const result: { number: number; isPrime: boolean }[] = [];
  
  for (let i = 1; i <= max; i++) {
    result.push({ number: i, isPrime: primeSet.has(i) });
  }
  
  return result;
}

