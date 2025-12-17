use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Sieve of Eratosthenes - highly optimized for generating primes up to limit
#[wasm_bindgen]
pub fn sieve_of_eratosthenes(limit: usize) -> Vec<u32> {
    if limit < 2 {
        return vec![];
    }
    
    // Use bit array for memory efficiency
    let mut is_prime = vec![true; limit + 1];
    is_prime[0] = false;
    is_prime[1] = false;
    
    let sqrt_limit = (limit as f64).sqrt() as usize;
    
    for i in 2..=sqrt_limit {
        if is_prime[i] {
            // Mark all multiples of i as composite
            let mut j = i * i;
            while j <= limit {
                is_prime[j] = false;
                j += i;
            }
        }
    }
    
    // Collect primes
    is_prime
        .iter()
        .enumerate()
        .filter_map(|(i, &is_p)| if is_p { Some(i as u32) } else { None })
        .collect()
}

/// Generate first N primes
#[wasm_bindgen]
pub fn first_n_primes(n: usize) -> Vec<u32> {
    if n == 0 {
        return vec![];
    }
    
    // Estimate upper bound using prime number theorem
    // p_n ~ n * ln(n) for large n
    let estimate = if n < 6 {
        15
    } else {
        let ln_n = (n as f64).ln();
        let ln_ln_n = ln_n.ln();
        ((n as f64) * (ln_n + ln_ln_n) * 1.3) as usize
    };
    
    let mut primes = sieve_of_eratosthenes(estimate);
    
    // If we didn't get enough, expand
    while primes.len() < n {
        let new_limit = estimate * 2;
        primes = sieve_of_eratosthenes(new_limit);
    }
    
    primes.truncate(n);
    primes
}

/// Calculate prime gaps (differences between consecutive primes)
#[wasm_bindgen]
pub fn prime_gaps(primes: &[u32]) -> Vec<u32> {
    if primes.len() < 2 {
        return vec![];
    }
    
    primes
        .windows(2)
        .map(|w| w[1] - w[0])
        .collect()
}

/// Check if a single number is prime
#[wasm_bindgen]
pub fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false;
    }
    if n == 2 {
        return true;
    }
    if n % 2 == 0 {
        return false;
    }
    
    let sqrt_n = (n as f64).sqrt() as u32;
    let mut i = 3;
    while i <= sqrt_n {
        if n % i == 0 {
            return false;
        }
        i += 2;
    }
    true
}

/// Get prime factorization of a number
#[wasm_bindgen]
pub fn prime_factorization(mut n: u32) -> Vec<u32> {
    let mut factors = Vec::new();
    
    if n < 2 {
        return factors;
    }
    
    while n % 2 == 0 {
        factors.push(2);
        n /= 2;
    }
    
    let mut i = 3;
    while i * i <= n {
        while n % i == 0 {
            factors.push(i);
            n /= i;
        }
        i += 2;
    }
    
    if n > 1 {
        factors.push(n);
    }
    
    factors
}

/// Count primes up to each value (prime counting function)
#[wasm_bindgen]
pub fn prime_counting(limit: usize) -> Vec<u32> {
    let primes = sieve_of_eratosthenes(limit);
    let mut counts = vec![0u32; limit + 1];
    let mut prime_idx = 0;
    
    for i in 0..=limit {
        while prime_idx < primes.len() && primes[prime_idx] as usize <= i {
            prime_idx += 1;
        }
        counts[i] = prime_idx as u32;
    }
    
    counts
}

