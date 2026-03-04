// Utility to extract weapon and outfit IDs from save data

export type ItemType = 'Weapon' | 'Outfit';

export interface GameItem {
  id: string;
  type: ItemType;
}

/**
 * Recursively scan the entire save JSON to find all items with type "Weapon" or "Outfit".
 * Returns deduplicated sets of weapon IDs and outfit IDs.
 */
export function extractItemIds(data: any): { weapons: string[]; outfits: string[] } {
  const weaponSet = new Set<string>();
  const outfitSet = new Set<string>();

  function scan(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      for (const item of obj) scan(item);
      return;
    }

    // Check if this object is an item with id + type
    if (obj.id && typeof obj.id === 'string' && obj.type) {
      if (obj.type === 'Weapon') weaponSet.add(obj.id);
      else if (obj.type === 'Outfit') outfitSet.add(obj.id);
    }

    for (const key of Object.keys(obj)) {
      scan(obj[key]);
    }
  }

  scan(data);

  return {
    weapons: [...weaponSet].sort(),
    outfits: [...outfitSet].sort(),
  };
}

/**
 * Classify recipes into weapons, outfits, and other (themes/rooms).
 */
export function classifyRecipes(
  recipes: string[],
  knownWeapons: Set<string>,
  knownOutfits: Set<string>
): { weapons: string[]; outfits: string[]; other: string[] } {
  const weapons: string[] = [];
  const outfits: string[] = [];
  const other: string[] = [];
  const seen = new Set<string>();

  for (const id of recipes) {
    if (seen.has(id)) continue;
    seen.add(id);

    if (knownWeapons.has(id)) weapons.push(id);
    else if (knownOutfits.has(id)) outfits.push(id);
    else other.push(id);
  }

  return { weapons: weapons.sort(), outfits: outfits.sort(), other: other.sort() };
}

/**
 * Convert a camelCase/PascalCase item ID to a human-readable label.
 * e.g. "032Pistol_Rusty" → ".32 Pistol (Rusty)"
 *      "LaserRifle_Tuned" → "Laser Rifle (Tuned)"
 */
export function itemIdToLabel(id: string): string {
  const parts = id.split('_');
  const base = parts[0];
  const variant = parts.slice(1).join(' ');

  // Insert spaces before capitals
  let label = base.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Handle leading numbers like "032"
  if (/^\d+/.test(label)) {
    label = '.' + label.replace(/^0+/, '');
  }

  if (variant) {
    label += ` (${variant.replace(/([a-z])([A-Z])/g, '$1 $2')})`;
  }

  return label;
}
