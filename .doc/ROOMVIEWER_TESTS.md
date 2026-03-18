/**
 * RoomViewer Component - Usage Examples and Test Cases
 * 
 * This file documents the expected behavior and visual output of the RoomViewer component.
 */

// EXAMPLE 1: Basic Room Structure
// When a user loads a vault save file and clicks "VAULT MODE", they should see:

const exampleVaultData = {
  vault: {
    rooms: [
      {
        type: "Entrance",
        row: 0,
        col: 3,
        mergeLevel: 2,      // Width = 2 * 3 = 6 columns
        level: 3,
        power: true,
        broken: false,
      },
      {
        type: "Elevator",
        row: 0,
        col: 9,
        mergeLevel: 1,      // Width = 1 column (Elevator exception)
        level: 1,
        power: true,
        broken: false,
      },
      {
        type: "LivingQuarters",
        row: 2,
        col: 0,
        mergeLevel: 3,      // Width = 3 * 3 = 9 columns
        level: 2,
        power: true,
        broken: false,
      },
      {
        type: "Storage",
        row: 1,
        col: 0,
        mergeLevel: 3,      // Width = 3 * 3 = 9 columns
        level: 1,
        power: false,       // This room has no power!
        broken: false,
      }
    ]
  }
};

// EXPECTED GRID VISUALIZATION:
// 
//        0   1   2   3   4   5   6   7   8   9
//  0 [ FWL FWL |  ENT  ENT  ENT  ENT | ELE |
//  1 [ Storage Storage Storage Storage Storage Storage | ??? |
//  2 [ LivingQuarters LivingQuarters LivingQuarters LivingQuarters LivingQuarters LivingQuarters | ??? |
//
// Legend:
// FWL = FakeWasteland (width 2)
// ENT = Entrance (width 6) 
// ELE = Elevator (width 1)
// ??? = Empty cells (no room)

// EXAMPLE 2: Room Status Indicators
// The component displays additional information for each room:

/*
VISUAL INDICATORS:
- Room Color: Different colors for different room types
- Room Level: Display "Lv X" in the room cell
- Power Status: Show "⚠ NO POWER" in yellow if power=false
- Broken Status: Show "✗ BROKEN" in red if broken=true
- Hover Title: Display full information in tooltip
*/

// EXAMPLE 3: Grid Rendering Algorithm
/*
1. Calculate grid bounds:
   - Find the maximum row value
   - Find the maximum col value (accounting for room widths)

2. Build position map:
   - For each room, mark all grid positions it occupies
   - Key format: "${row}-${col}"
   
3. Render rows:
   - For each row from 0 to maxRow
     - For each column from 0 to maxCol
       - If cell is part of a multi-column room and not the first column, skip it
       - Otherwise, render the cell with appropriate colSpan

4. Add column/row headers for reference
*/

// EXAMPLE 4: Color Scheme
const ROOM_CLASS_COLORS = {
  'Training': 'bg-purple-500 hover:bg-purple-600',
  'Production': 'bg-blue-500 hover:bg-blue-600',
  'Facility': 'bg-green-500 hover:bg-green-600',
  'Utility': 'bg-orange-500 hover:bg-orange-600',
  'Consumable': 'bg-red-500 hover:bg-red-600',
  'Crafting': 'bg-yellow-500 hover:bg-yellow-600',
  'Quest': 'bg-pink-500 hover:bg-pink-600',
};

// EXAMPLE 5: Real Vault Statistics
/*
Vault1.json Statistics:
- Total Rooms: 76
- Grid Size: 20 rows × 27 columns (540 cells)
- Room Types: 27 different types
- Elevators: 23 (always 1 column wide)
- Storage: 9 rooms
- LivingQuarters: 5 rooms
- Other rooms: distributed throughout

The grid visualization handles all of these efficiently with useMemo
to avoid unnecessary recalculations when the data doesn't change.
*/

// TEST CASES

// Test 1: Empty vault
const emptyVault = { vault: { rooms: [] } };
// Expected: Display "No rooms found in this vault" message

// Test 2: Single large room
const singleLargeRoom = {
  vault: {
    rooms: [
      {
        type: "Cafeteria",
        row: 0,
        col: 0,
        mergeLevel: 5,  // 15 columns wide
        level: 1,
        power: true,
        broken: false,
      }
    ]
  }
};
// Expected: Grid with 1 row × 15 columns

// Test 3: All room types
// Expected: Legend should show all represented room types

// Test 4: No power scenario
const noPowerTest = {
  vault: {
    rooms: [
      {
        type: "Storage",
        row: 0,
        col: 0,
        mergeLevel: 3,
        level: 2,
        power: false,  // Critical!
        broken: false,
      }
    ]
  }
};
// Expected: Room cell displays "⚠ NO POWER" warning in yellow

// Test 5: Broken room
const brokenRoomTest = {
  vault: {
    rooms: [
      {
        type: "WeaponFactory",
        row: 0,
        col: 0,
        mergeLevel: 3,
        level: 3,
        power: true,
        broken: true,  // Critical!
      }
    ]
  }
};
// Expected: Room cell displays "✗ BROKEN" indicator in red

// PERFORMANCE NOTES:
// - useMemo(grid calculation) prevents recalculation on every render
// - colSpan attribute prevents rendering duplicate cells for wide rooms
// - Map data structure (O(1) lookup) for fast cell resolution
// - Handles 76+ rooms efficiently without performance degradation
