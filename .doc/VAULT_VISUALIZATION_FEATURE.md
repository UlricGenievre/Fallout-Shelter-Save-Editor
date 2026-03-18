# VaultEditor - Room Visualization Feature

## Overview
Added a comprehensive room visualization feature to the VaultEditor component that displays the vault layout in a grid-based format.

## What's New

### Components Created

#### 1. **RoomViewer.tsx**
A new React component that renders the vault rooms in a visual grid layout.

**Features:**
- **Grid-based rendering**: Displays rooms in a table format based on their `row` and `col` coordinates
- **Proper sizing**: Calculates room width based on `mergeLevel`:
  - Regular rooms: width = mergeLevel × 3 columns
  - Elevators: width = 1 column (exception)
- **Color-coded rooms**: Different room types have distinct background colors for easy identification
- **Room information**: Hover over rooms to see additional details:
  - Room type
  - Room level
  - Power status (highlights "NO POWER" if not powered)
  - Broken status indicator
- **Responsive legend**: Shows all available room type colors
- **Grid coordinates**: Row and column numbers for reference

### Modified Components

#### 1. **VaultEditor.tsx**
Updated to accept and use vault data:
- Now accepts a `data` prop containing the full save file data
- Extracts rooms from `data.vault.rooms`
- Delegates rendering to `RoomViewer` component
- Provides user-friendly fallback message if no data available

#### 2. **SaveEditor.tsx**
Updated to pass vault data to VaultEditor:
- Changed `<VaultEditor />` to `<VaultEditor data={data} />`

## Technical Details

### Room Grid Calculation
The component calculates the grid layout in the `useMemo` hook:

1. **Find grid bounds**: Iterates through all rooms to determine `maxRow` and `maxCol`
2. **Build position map**: Creates a Map of grid positions to room objects
   - Key format: `${row}-${col}`
   - Each position holds a reference to the room occupying it
3. **Render grid**: Iterates through all rows and columns, using `colSpan` to merge cells for multi-column rooms

### Room Type Colors
Predefined color scheme for 16+ common room types:
- Entrance: Blue
- Cafeteria: Red
- LivingQuarters: Green
- WaterPlant: Cyan
- Geothermal: Orange
- And more...
- **Special purple color for Training class rooms** (class: "Training")

Fallback color (slate) for unknown room types.

### 3. **Color-Coded Room Classes**
- 7 predefined room class colors (Training, Production, Facility, Utility, etc.)
- Color scheme based on room **class** only, not type
- Fallback color for rooms without class
- Color scheme matches Fallout's aesthetic

### Data Structure Expected
```typescript
interface Room {
  type: string;        // Room type (e.g., "Cafeteria", "Storage", "Elevator")
  row: number;         // Row position (0-based, top to bottom)
  col: number;         // Column position (0-based, left to right)
  mergeLevel: number;  // Size multiplier for room width
  level?: number;      // Optional: room level (1-5)
  power?: boolean;     // Optional: power status
  broken?: boolean;    // Optional: broken status
}
```

## Usage

1. Load a vault save file through the FileUpload component
2. Click the "VAULT MODE" button in the header
3. View the vault layout visualization

The component will:
- Display all rooms in their correct grid positions
- Show grid coordinates (0-indexed)
- Display room information with color coding
- Render a legend of room types

## Example Vault Statistics
From Vault1.json:
- Total rooms: 76
- Grid size: 20 rows × 27 columns
- Room types: 27 different types
- Most common: Elevator (23), Storage (9), LivingQuarters (5)

## Responsive Design
- The grid container uses `overflow-auto` for scrolling on smaller screens
- Each cell is 64px × 64px minimum
- Tailwind CSS classes for styling consistency with the rest of the app
- Follows the existing "pip-boy" themed UI design

## Future Enhancements
Potential features that could be added:
- Click rooms to edit their properties
- Drag-and-drop to rearrange rooms
- Search/filter by room type
- Room performance metrics (power consumption, dwellers assigned)
- Room upgrade suggestions
