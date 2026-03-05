import itemsData from '@/data/items.json';

export interface GameItem {
  id: string;
  label: string;
  category: string;
  rarity?: string;
}

// Build lookup maps from static JSON
const weaponMap = new Map<string, GameItem>(itemsData.weapons.map(w => [w.id, w]));
const outfitMap = new Map<string, GameItem>(itemsData.outfits.map(o => [o.id, o]));
const themeMap = new Map<string, GameItem>(itemsData.themes.map(t => [t.id, t]));

/** All known weapon IDs */
export const ALL_WEAPONS: GameItem[] = itemsData.weapons;
/** All known outfit IDs */
export const ALL_OUTFITS: GameItem[] = itemsData.outfits;
/** All known theme/room IDs */
export const ALL_THEMES: GameItem[] = itemsData.themes;

/** Get a human-readable label for any item ID */
export function getItemLabel(id: string): string {
  return weaponMap.get(id)?.label
    ?? outfitMap.get(id)?.label
    ?? themeMap.get(id)?.label
    ?? itemIdToLabel(id);
}

/** Get item type: 'weapon', 'outfit', 'theme', or 'unknown' */
export function getItemType(id: string): 'weapon' | 'outfit' | 'theme' | 'unknown' {
  if (weaponMap.has(id)) return 'weapon';
  if (outfitMap.has(id)) return 'outfit';
  if (themeMap.has(id)) return 'theme';
  return 'unknown';
}

/**
 * Classify recipes into weapons, outfits, themes and unknown.
 */
export function classifyRecipes(recipes: string[]): {
  weapons: string[];
  outfits: string[];
  themes: string[];
  unknown: string[];
} {
  const weapons: string[] = [];
  const outfits: string[] = [];
  const themes: string[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();

  for (const id of recipes) {
    if (seen.has(id)) continue;
    seen.add(id);
    const type = getItemType(id);
    if (type === 'weapon') weapons.push(id);
    else if (type === 'outfit') outfits.push(id);
    else if (type === 'theme') themes.push(id);
    else unknown.push(id);
  }

  return {
    weapons: weapons.sort(),
    outfits: outfits.sort(),
    themes: themes.sort(),
    unknown: unknown.sort(),
  };
}

/**
 * Fallback: Convert a camelCase/PascalCase item ID to a human-readable label.
 */
export function itemIdToLabel(id: string): string {
  const parts = id.split('_');
  const base = parts[0];
  const variant = parts.slice(1).join(' ');

  let label = base.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  if (/^\d+/.test(label)) {
    label = '.' + label.replace(/^0+/, '');
  }

  if (variant) {
    label += ` (${variant.replace(/([a-z])([A-Z])/g, '$1 $2')})`;
  }

  return label;
}
