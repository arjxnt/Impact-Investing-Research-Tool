import heapq
from dataclasses import dataclass, field
from typing import List, Tuple, Optional

# --- CONFIGURATION ---
GRID_WIDTH = 12
GRID_HEIGHT = 12
START_POS = (0, 0)  # Top-left corner
END_POS = (11, 11)  # Bottom-right corner (may need adjustment)

# Left grid: 12 rows × 6 columns (covers columns 0-5)
# Format: [value, color] where color is 'R' (red), 'B' (blue), 'W' (white/uncolored)
# From puzzle description - row-major order [row][col]
LEFT_GRID = [
    [3, 2, 4, 5, 0, 6],  # Row 0
    [3, 0, 0, 2, 4, 0],  # Row 1
    [4, 0, 2, 7, 0, 0],  # Row 2
    [4, 2, 5, 2, 2, 9],  # Row 3
    [3, 1, 1, 4, 0, 9],  # Row 4
    [2, 7, 2, 6, 5, 4],  # Row 5
    [3, 6, 5, 2, 0, 1],  # Row 6
    [2, 1, 1, 4, 0, 8],  # Row 7
    [3, 2, 3, 0, 4, 7],  # Row 8
    [0, 4, 2, 2, 9, 2],  # Row 9
    [1, 4, 3, 9, 5, 7],  # Row 10
    [3, 5, 0, 5, 6, 6],  # Row 11
]

# Top-right grid: 7 rows × 12 columns (covers rows 0-6)
TOP_RIGHT_GRID = [
    [3, 3, 6, 1, 1, 1, 1, 1, 1, 7, 5, 2],  # Row 0
    [0, 6, 0, 0, 4, 5, 6, 3, 1, 9, 6, 5],  # Row 1
    [3, 4, 3, 0, 0, 5, 9, 4, 3, 5, 1, 3],  # Row 2
    [1, 9, 5, 2, 4, 2, 5, 5, 2, 3, 0, 7],  # Row 3
    [9, 2, 2, 9, 2, 3, 1, 9, 9, 0, 0, 5],  # Row 4
    [7, 8, 1, 5, 3, 0, 0, 3, 1, 7, 6, 6],  # Row 5
    [6, 4, 2, 1, 4, 8, None, None, None, None, None, None],  # Row 6 (last 6 cols are None)
]

@dataclass(order=True)
class State:
    cost: float
    time: int = field(compare=False)
    x: int = field(compare=False)
    y: int = field(compare=False)
    path: tuple = field(compare=False, default=())

def get_cost_at_cell(x: int, y: int, time: int) -> Optional[int]:
    """
    Returns the cost to move into cell (x, y) at time `time`.
    Returns None if the cell is impassable at this time.
    
    Rules:
    - Even time (t even): Use LEFT_GRID (only valid if y < 6)
    - Odd time (t odd): Use TOP_RIGHT_GRID (only valid if x < 7)
    - Cells where x >= 7 AND y >= 6 are always impassable
    """
    # Check if cell is in the always-impassable region
    if x >= 7 and y >= 6:
        return None
    
    if time % 2 == 0:  # Even time: use left grid
        if y >= 6:  # Left grid only covers columns 0-5
            return None
        if x >= 12:  # Out of bounds
            return None
        return LEFT_GRID[x][y]
    else:  # Odd time: use top-right grid
        if x >= 7:  # Top-right grid only covers rows 0-6
            return None
        if y >= 12:  # Out of bounds
            return None
        value = TOP_RIGHT_GRID[x][y]
        if value is None:
            return None
        return value

def get_neighbors(state: State) -> List[State]:
    """
    Generates valid next states based on puzzle rules.
    Movement is 4-directional (Up, Down, Left, Right).
    """
    candidates = []
    moves = [(0, 1), (0, -1), (1, 0), (-1, 0)]  # Right, Left, Down, Up
    
    for dx, dy in moves:
        nx, ny = state.x + dx, state.y + dy
        
        # Bounds check
        if not (0 <= nx < GRID_WIDTH and 0 <= ny < GRID_HEIGHT):
            continue
        
        # Calculate new time (increments by 1)
        new_time = state.time + 1
        
        # Get cost for moving into this cell at the new time
        cell_cost = get_cost_at_cell(nx, ny, new_time)
        if cell_cost is None:
            continue  # Cell is impassable at this time
        
        new_cost = state.cost + cell_cost
        new_path = state.path + ((nx, ny),)
        
        candidates.append(State(new_cost, new_time, nx, ny, new_path))
    
    return candidates

def solve():
    queue = []
    start_node = State(0, 0, START_POS[0], START_POS[1], ((START_POS[0], START_POS[1]),))
    heapq.heappush(queue, start_node)
    
    # Visited set: (x, y, time) - need time because same cell may have different costs at different times
    visited = set()
    
    best_solution = None
    nodes_expanded = 0
    
    while queue:
        current = heapq.heappop(queue)
        nodes_expanded += 1
        
        x, y, t = current.x, current.y, current.time
        
        # Pruning: if we've been to this exact state before, skip
        state_key = (x, y, t)
        if state_key in visited:
            continue
        visited.add(state_key)
        
        # TARGET CHECK
        if (x, y) == END_POS:
            if best_solution is None or current.cost < best_solution.cost:
                best_solution = current
                print(f"Found solution! Cost: {current.cost}, Time: {current.time}, Path length: {len(current.path)}")
                # Continue searching in case there's a better solution
        
        # Expand neighbors
        for next_state in get_neighbors(current):
            # Prune if we've seen this exact state before
            next_key = (next_state.x, next_state.y, next_state.time)
            if next_key not in visited:
                heapq.heappush(queue, next_state)
    
    print(f"\nTotal nodes expanded: {nodes_expanded}")
    if best_solution:
        print(f"\nBest solution:")
        print(f"  Cost: {best_solution.cost}")
        print(f"  Time: {best_solution.time}")
        print(f"  Path length: {len(best_solution.path)}")
        print(f"  Path: {best_solution.path[:10]}..." if len(best_solution.path) > 10 else f"  Path: {best_solution.path}")
        return f"Optimal cost: {best_solution.cost}"
    else:
        return "No solution found."

if __name__ == "__main__":
    result = solve()
    print(f"\n{result}")


