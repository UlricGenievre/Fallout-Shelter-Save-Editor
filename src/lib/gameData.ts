import weaponsData from '@/data/weapons.json';
import themesData from '@/data/themes.json';
import outfitsData from '@/data/outfits.json';
import junksData from '@/data/junks.json';

export interface GameItem {
  id: string;
  label: string;
  category: string;
  rarity?: string;
  damage?: string;
  avgDamage?: string;
  special?: Partial<Record<'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L', number>>;
  resellValue?: number;
}

/** Format SPECIAL bonuses as a short string like "S+3 E+2" */
export function formatSpecial(special?: GameItem['special']): string {
  if (!special) return '';
  return Object.entries(special)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => `${k}+${v}`)
    .join(' ');
}

/** Get full item data by ID */
export function getItem(id: string): GameItem | undefined {
  return weaponMap.get(id) ?? outfitMap.get(id) ?? themeMap.get(id) ?? junkMap.get(id);
}

// Build lookup maps from static JSON
const weaponMap = new Map<string, GameItem>(weaponsData.map(w => [w.id, w]));
const outfitMap = new Map<string, GameItem>(outfitsData.map((o: any) => [o.id, o]));
const themeMap = new Map<string, GameItem>(themesData.map(t => [t.id, t]));
const junkMap = new Map<string, GameItem>(junksData.map(j => [j.id, { ...j, label: j.name, category: 'Junk' } as GameItem]));

/** All known weapon IDs */
export const ALL_WEAPONS: GameItem[] = weaponsData;

/** Weapon category display order matching the wiki */
const WEAPON_CATEGORY_ORDER = ['Melee', 'Pistol', 'Energy Pistol', 'Rifle', 'Energy Rifle', 'Shotgun', 'Heavy'];

/** Weapons grouped by category, ordered like the wiki */
export const WEAPONS_BY_CATEGORY: { category: string; items: GameItem[] }[] = (() => {
  const grouped = new Map<string, GameItem[]>();
  for (const w of weaponsData) {
    const cat = w.category || 'Other';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(w);
  }
  return WEAPON_CATEGORY_ORDER
    .filter(c => grouped.has(c))
    .map(c => ({ category: c, items: grouped.get(c)! }));
})();
/** All known outfit IDs */
export const ALL_OUTFITS: GameItem[] = outfitsData as any[];
/** All known theme/room IDs */
export const ALL_THEMES: GameItem[] = themesData;
/** All known junk IDs */
export const ALL_JUNKS: GameItem[] = junksData.map(j => ({ ...j, label: j.name, category: 'Junk' })) as any[];

/** Get a human-readable label for any item ID */
export function getItemLabel(id: string): string {
  return weaponMap.get(id)?.label
    ?? outfitMap.get(id)?.label
    ?? themeMap.get(id)?.label
    ?? junkMap.get(id)?.label
    ?? itemIdToLabel(id);
}

// Known weapon ID prefixes / patterns (from save files)
const WEAPON_ID_PATTERNS = [
  /^(Melee|Pistol|Rifle|Shotgun|Heavy|Energy|Laser|Plasma|Alien|Minigun|MissileLauncher|FlameGun|GatlingLaser|FatMan|RailwayRifle|Flamer|Gauss|Junk|Institute|HuntingRifle|CombatRifle|CombatShotgun|AssaultRifle|SubmachineGun|AcidSoaker|Broadsider|Cryolator|Deathclaw|DragonsTooth|Shishkebab|RiotShotgun|LeverRifle|Overseers|RevolutionaryBlade|WestTekSaw)/i,
  /Pistol/i,
  /Rifle/i,
  /Shotgun/i,
  /Sword|Blade|Bat|Knife|Axe|Baton|Club|Hammer|Glove|Fist|Knuckle/i,
];

// Known outfit ID patterns
const OUTFIT_ID_PATTERNS = [
  /^(VaultSuit|Armored|Outfit|Suit|Armor|Uniform|Dress|Coat|Jacket|Robe|Hazmat|PowerArmor|BrotherhoodArmor|RaiderArmor|EnclaveTrooper|Minutemen|VaultTech|Scientist|Military|Mechanic|Surgeon|Nurse|Doctor|Hunter|Explorer|Settler|Ghoul|Wastelander|Nuka|Institute|Railroad|Synth|Courser|Gunner|BoS)/i,
  /Suit|Armor|Dress|Uniform|Coat|Robe/i,
];

// Known theme/room ID patterns
const THEME_ID_PATTERNS = [
  /^(LivingQuarters|Cafeteria)/i,
];

/**
 * Heuristic fallback: try to guess the category of an unknown ID by its naming pattern.
 * Returns 'weapon', 'outfit', 'theme', or 'unknown'.
 */
export function guessItemType(id: string): 'weapon' | 'outfit' | 'theme' | 'junk' | 'unknown' {
  if (THEME_ID_PATTERNS.some(p => p.test(id))) return 'theme';
  if (WEAPON_ID_PATTERNS.some(p => p.test(id))) return 'weapon';
  if (OUTFIT_ID_PATTERNS.some(p => p.test(id))) return 'outfit';
  return 'unknown';
}

/** Get item type: 'weapon', 'outfit', 'theme', 'junk' or 'unknown' */
export function getItemType(id: string): 'weapon' | 'outfit' | 'theme' | 'junk' | 'unknown' {
  if (weaponMap.has(id)) return 'weapon';
  if (outfitMap.has(id)) return 'outfit';
  if (themeMap.has(id)) return 'theme';
  if (junkMap.has(id)) return 'junk';
  return 'unknown';
}

/**
 * Classify recipes into weapons, outfits, themes and unknown.
 * Unknown IDs are re-classified via heuristics so the unknown bucket stays empty.
 */
export function classifyRecipes(recipes: string[]): {
  weapons: string[];
  outfits: string[];
  themes: string[];
  junks: string[];
  unknown: string[];
} {
  const weapons: string[] = [];
  const outfits: string[] = [];
  const themes: string[] = [];
  const junks: string[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();

  for (const id of recipes) {
    if (seen.has(id)) continue;
    seen.add(id);
    const type = getItemType(id);
    if (type === 'weapon') weapons.push(id);
    else if (type === 'outfit') outfits.push(id);
    else if (type === 'theme') themes.push(id);
    else if (type === 'junk') junks.push(id);
    else {
      // Try heuristic classification
      const guessed = guessItemType(id);
      if (guessed === 'weapon') weapons.push(id);
      else if (guessed === 'outfit') outfits.push(id);
      else if (guessed === 'junk') junks.push(id);
      else unknown.push(id);
    }
  }

  return {
    weapons: weapons.sort(),
    outfits: outfits.sort(),
    themes: themes.sort(),
    junks: junks.sort(),
    unknown: unknown.sort(),
  };
}

/**
 * Fallback: Convert a camelCase/PascalCase item ID to a human-readable label.
 */
export function itemIdToLabel(id: string): string {
  if (typeof id !== 'string') return String(id);
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

  return '[' + label + ']';
}
