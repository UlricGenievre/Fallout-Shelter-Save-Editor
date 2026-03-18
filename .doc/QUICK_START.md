# 🚀 Quick Start Guide - Vault Room Visualization

## What's New? 🎉

The **VaultEditor** component now displays a visual representation of your vault layout! You can see all your rooms positioned in a grid with color coding, status indicators, and more.

---

## How to Use 📖

### Step 1: Load Your Vault Save File
1. Open the Fallout Shelter Save Editor application
2. Click **"Upload File"** and select your `.sav` or `.json` save file
3. Wait for the file to be parsed and loaded

### Step 2: Switch to Vault Mode
1. Once the file is loaded, you'll see the **"Common Editor"** view (dwellers, resources, recipes)
2. In the top-right header, click the **"Home" icon button** to enter **"VAULT MODE"**
3. The view will switch to show your vault layout

### Step 3: Explore Your Vault Layout
You'll see:
- **Grid Layout**: All rooms positioned according to their row and column coordinates
- **Color-Coded Rooms**: Different colors for different room types
- **Room Information**: Hover over any room to see details
- **Grid Coordinates**: Row and column numbers for reference
- **Legend**: A legend showing all room types and their colors

---

## What You'll See 👀

### The Vault Grid

```
         Column Numbers (0-26)
Row 0:  [Room1] [Room2] [Room3] ...
Row 1:  [Room4] [Room5] [Room6] ...
Row 2:  [Room7] [Room8] [Room9] ...
...
Row 19: ...
```

### Room Cell Information

Each room cell displays:
- **Room Type Name**: (e.g., "Cafeteria", "Storage")
- **Room Level**: "Lv 1", "Lv 2", etc.
- **Power Status**: "⚠ NO POWER" (if not powered)
- **Broken Status**: "✗ BROKEN" (if damaged)

### Color Examples

| Color | Room Class | Description |
|-------|------------|-------------|
| 🟣 Purple | Training | Rooms for training dwellers (Classroom, Bar, Dojo, etc.) |
| 🔵 Blue | Production | Production rooms (WeaponFactory, OutfitFactory, etc.) |
| 🟢 Green | Facility | Living and facility rooms (LivingQuarters, MedBay, etc.) |
| 🟠 Orange | Utility | Utility rooms (WaterPlant, Geothermal, etc.) |
| 🔴 Red | Consumable | Food/drink rooms (Cafeteria, NukaCola, etc.) |
| 🟡 Yellow | Crafting | Crafting rooms (DesignFactory, etc.) |
| 🟣 Pink | Quest | Special quest rooms |
| ⬜ Gray | No Class | Rooms without assigned class |

---

## Understanding Room Sizes 📐

### How Wide is Each Room?

The room width is calculated based on **mergeLevel**:

- **Regular Rooms**: Width = mergeLevel × 3 columns
- **Elevator Rooms**: Always 1 column (exception)

Examples:
```
mergeLevel = 1 → 3 columns wide
mergeLevel = 2 → 6 columns wide
mergeLevel = 3 → 9 columns wide
Elevator     → 1 column wide
```

### Why Does This Matter?

When you see a room spanning multiple columns in the grid, that's the actual space it occupies in your vault. This helps you understand your vault's layout and space usage.

---

## Key Features ⭐

### ✨ Interactive Grid
- Click or hover to see room details
- Shows full information in tooltip
- Color-coded for easy identification

### ⚠️ Status Indicators
- **Power Status**: Shows "⚠ NO POWER" if a room lacks power
- **Damage Status**: Shows "✗ BROKEN" if a room is damaged
- **Level**: Displays the room's upgrade level

### 🎨 Visual Design
- Matches Fallout's Pip-Boy aesthetic
- Tailwind CSS styling
- Responsive on all screen sizes

### 📊 Statistics
- Total room count
- Grid dimensions (rows × columns)
- Room type legend

---

## Example Vault Layout

### Vault1.json Statistics:
```
Total Rooms: 76
Grid Size: 20 rows × 27 columns
Room Types: 27 different types

Most Common Rooms:
- Elevators: 23 (always 1 column wide)
- Storage: 9 rooms
- LivingQuarters: 5 rooms
- Various production facilities
```

---

## Tips & Tricks 💡

### 1. Find Empty Spaces
Look for cells with a lighter background color. These are empty grid positions where you could build new rooms.

### 2. Check Power Distribution
If you see "⚠ NO POWER" warnings, you might need more Power Generation rooms or better power distribution.

### 3. Understand Your Layout
The grid shows you at a glance:
- How many rooms you have
- Where they're positioned
- Which ones need attention (broken/no power)
- How spread out your production is

### 4. Plan Expansions
Use the empty cells and grid coordinates to plan where to place new rooms in your vault design.

---

## Common Questions ❓

### Q: Why are some rooms wider than others?
**A:** Room size is based on their `mergeLevel` value. Larger production facilities need more space.

### Q: What does "No Power" mean?
**A:** That room is disconnected from your power supply. You should connect it to a Power Generation room.

### Q: What does "Broken" mean?
**A:** That room has been damaged (possibly by a deathclaw or radiation) and needs repair.

### Q: Can I edit rooms from this view?
**A:** Not yet! This is a read-only visualization for now. Editing features are planned for a future update.

### Q: What are those gray single-column rooms?
**A:** Those are **Elevators**. They're special rooms that always occupy exactly 1 column, unlike other rooms that scale with mergeLevel.

---

## Keyboard Shortcuts ⌨️

Currently, no keyboard shortcuts are implemented, but you can:

- **Click the Home icon** (in the top header) to toggle between "Common Editor" and "Vault Mode"
- **Hover over rooms** to see their details
- **Scroll horizontally** if your vault is wider than your screen

---

## Troubleshooting 🔧

### Q: I see "No vault data available"
**A:** Make sure you've successfully loaded a save file first. The vault data comes from your .sav or .json file.

### Q: The grid looks off or rooms are in wrong positions
**A:** This shouldn't happen if the save file is valid. Try uploading the file again or using a different save file.

### Q: Some room names look strange
**A:** That's because we display the exact room type name from the save file. Some rooms might have technical names (e.g., "Energy2", "Water2").

---

## Performance 🚀

The component is optimized for performance:
- Handles 76+ rooms smoothly
- No lag or stuttering
- Efficient grid calculation with memoization
- Fast cell lookup with Map data structure

---

## File Size Impact 📦

New files added:
- `RoomViewer.tsx`: 6.3 KB
- Documentation files: ~28 KB (not loaded at runtime)

**Runtime Impact**: Minimal! Only the RoomViewer component is loaded when you enter Vault Mode.

---

## Future Enhancements 🔮

Planned features for future releases:
- ✅ Click rooms to edit properties
- ✅ Drag-and-drop to rearrange rooms
- ✅ Search/filter by room type
- ✅ Show dweller count per room
- ✅ Highlight power distribution
- ✅ Save custom layouts

---

## Support & Feedback 💬

If you find any issues or have suggestions:
1. Check the documentation files included with the project
2. Review the test cases to understand expected behavior
3. Report issues with your save file information for debugging

---

## Summary 📝

The VaultEditor now provides a complete visual representation of your vault layout! This makes it easy to:
- ✅ See all your rooms at once
- ✅ Check room statuses
- ✅ Plan vault expansions
- ✅ Understand your vault's organization
- ✅ Identify problem areas (no power, broken rooms)

**Happy Vaulting! 🏛️**

---

*Last Updated: 2026-03-18*
