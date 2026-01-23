"""
Reciprocal Split-Sum Numbers Problem

For a number n, A_n is the set of all sums from splitting the digits of n into 2+ parts, plus n itself.

We need to find all x such that there exists n (1 ≤ n ≤ 10^6) where:
    - x ∈ A_n
    - n ∈ A_x
"""

from typing import Set, Dict, List
from collections import defaultdict

# Global cache for A_n sets
_A_cache: Dict[int, Set[int]] = {}


def compute_A(n: int) -> Set[int]:
    """
    Compute the set A_n for a given number n.
    
    A_n contains:
    - All sums from splitting n's digits into 2 or more parts
    - n itself (the trivial split)
    
    Args:
        n: The input number
        
    Returns:
        Set of all possible split-sum values
    """
    # Check cache first
    if n in _A_cache:
        return _A_cache[n]
    if n == 0:
        return {0}
    
    # Convert to string for digit manipulation
    digits = str(n)
    length = len(digits)
    
    # If only one digit, return just the number itself
    if length == 1:
        return {n}
    
    result = {n}  # Always include n itself
    
    # Generate all possible ways to split digits into 2 or more parts
    # We need at least one split position, at most length-1 split positions
    # A split position is between two digits
    
    def generate_splits(start_idx: int, current_parts: List[str]) -> None:
        """
        Recursively generate all splits starting from start_idx.
        current_parts contains the parts we've already split.
        """
        if start_idx >= length:
            # We've reached the end - check if we have at least 2 parts
            if len(current_parts) >= 2:
                # Convert parts to integers and sum them
                parts_as_ints = [int(part) for part in current_parts if part]
                if parts_as_ints:
                    result.add(sum(parts_as_ints))
            return
        
        # Try all possible split positions from start_idx
        # For each position, take digits[start_idx:end_idx] as a part
        for end_idx in range(start_idx + 1, length + 1):
            part = digits[start_idx:end_idx]
            # Recursively split the remaining digits
            generate_splits(end_idx, current_parts + [part])
    
    generate_splits(0, [])
    
    # Cache and return result
    _A_cache[n] = result
    return result


def find_reciprocal_split_sums(max_n: int = 10**6) -> tuple[int, int, List[tuple[int, int]]]:
    """
    Find all reciprocal split-sum numbers.
    
    Args:
        max_n: Maximum value of n to check (default: 10^6)
        
    Returns:
        Tuple of (sum of valid x values, count of valid x, list of sample pairs (x, n))
    """
    # Clear cache to start fresh
    global _A_cache
    _A_cache.clear()
    
    print(f"Computing A_n for all n in [1, {max_n}]...")
    
    # Precompute A_n for all n in range
    A_sets: Dict[int, Set[int]] = {}
    
    # Build reverse mapping: for each x, track which n values contain it
    x_to_ns: Dict[int, List[int]] = defaultdict(list)
    
    # Progress tracking
    progress_interval = max(1, max_n // 20)  # Show progress every 5%
    
    for n in range(1, max_n + 1):
        if n % progress_interval == 0:
            print(f"  Processing n={n:,} ({n * 100 // max_n}%)")
        
        A_n = compute_A(n)
        A_sets[n] = A_n
        
        # Build reverse mapping: for each x in A_n, record that n contains x
        for x in A_n:
            if x > 0:  # Only consider positive values
                x_to_ns[x].append(n)
    
    print(f"\nFinding reciprocal matches...")
    
    # Now find all x where there exists n such that x ∈ A_n and n ∈ A_x
    valid_x_set = set()
    sample_pairs = []
    pair_limit = 20  # Limit sample pairs for output
    
    # Get all unique x values that appeared in any A_n
    all_x_values = set(x_to_ns.keys())
    print(f"  Checking {len(all_x_values):,} unique x values...")
    
    checked_count = 0
    check_interval = max(1, len(all_x_values) // 20)  # Show progress every 5%
    
    for x in all_x_values:
        if x <= 0:
            continue
        
        checked_count += 1
        if checked_count % check_interval == 0:
            print(f"  Checked {checked_count:,}/{len(all_x_values):,} x values ({checked_count * 100 // len(all_x_values)}%)")
        
        # Compute A_x (x might be larger than max_n, so we need to compute it)
        if x not in A_sets:
            A_x = compute_A(x)
        else:
            A_x = A_sets[x]
        
        # Check if there exists any n (where x ∈ A_n) such that n ∈ A_x
        for n in x_to_ns[x]:
            if n <= max_n and n in A_x:
                # We found a reciprocal match: x ∈ A_n and n ∈ A_x
                valid_x_set.add(x)
                if len(sample_pairs) < pair_limit:
                    sample_pairs.append((x, n))
                break  # Found one match for x, no need to check other n values
    
    total_sum = sum(valid_x_set)
    count = len(valid_x_set)
    
    return total_sum, count, sample_pairs


def main():
    """Main function to solve the problem."""
    print("=" * 70)
    print("Reciprocal Split-Sum Numbers Problem")
    print("=" * 70)
    print()
    
    # Solve for n in [1, 10^6]
    print("Solving for n in [1, 10^6]:")
    print("-" * 70)
    sum_1e6, count_1e6, pairs_1e6 = find_reciprocal_split_sums(max_n=10**6)
    
    print()
    print("=" * 70)
    print("RESULTS (n <= 10^6):")
    print("=" * 70)
    print(f"Sum of all valid x values: {sum_1e6:,}")
    print(f"Count of valid x values: {count_1e6:,}")
    print()
    
    if pairs_1e6:
        print("Sample pairs (x, n) where x is in A_n and n is in A_x:")
        for x, n in pairs_1e6[:10]:  # Show first 10
            print(f"  ({x}, {n})")
        if len(pairs_1e6) > 10:
            print(f"  ... and {len(pairs_1e6) - 10} more pairs")
    
    print()
    print("=" * 70)
    
    # Optional bonus: solve for n in [1, 10^7]
    print()
    print("BONUS: Solving for n in [1, 10^7] (This will take significantly longer):")
    print("-" * 70)
    response = input("Do you want to proceed with n <= 10^7? (y/n): ").strip().lower()
    if response == 'y':
        sum_1e7, count_1e7, pairs_1e7 = find_reciprocal_split_sums(max_n=10**7)
        
        print()
        print("=" * 70)
        print("RESULTS (n <= 10^7):")
        print("=" * 70)
        print(f"Sum of all valid x values: {sum_1e7:,}")
        print(f"Count of valid x values: {count_1e7:,}")
        print()
        
        if pairs_1e7:
            print("Sample pairs (x, n) where x is in A_n and n is in A_x:")
            for x, n in pairs_1e7[:10]:
                print(f"  ({x}, {n})")
            if len(pairs_1e7) > 10:
                print(f"  ... and {len(pairs_1e7) - 10} more pairs")
    else:
        print("Skipping bonus task.")


if __name__ == "__main__":
    main()
