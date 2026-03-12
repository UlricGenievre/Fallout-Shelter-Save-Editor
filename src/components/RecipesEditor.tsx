import { useMemo, useState } from 'react';
import { FlaskConical, Sword, Shirt, Home, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getItemLabel, getItem, formatSpecial, ALL_WEAPONS, ALL_OUTFITS, ALL_THEMES, WEAPONS_BY_CATEGORY, getItemType } from '@/lib/gameData';

interface RecipesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

type RecipeTab = 'weapons' | 'outfits' | 'themes' | 'unknown';

const TABS: { id: RecipeTab; label: string; icon: typeof Sword }[] = [
  { id: 'weapons',  label: 'WEAPONS',  icon: Sword },
  { id: 'outfits',  label: 'OUTFITS',  icon: Shirt },
  { id: 'themes',   label: 'THEMES',   icon: Home },
  { id: 'unknown',  label: 'UNKNOWN',  icon: HelpCircle },
];

export function RecipesEditor({ data, onChange }: RecipesEditorProps) {
  const [activeTab, setActiveTab] = useState<RecipeTab>('weapons');

  const getSurvivalW = (d: any) => d?.vault?.survivalW || d?.survivalW;
  const sw = getSurvivalW(data);

  const claimedRecipes: string[] = sw?.claimedRecipes || [];
  const collectedThemes: string[] = sw?.collectedThemes?.themeList || [];
  const claimedSet = useMemo(() => new Set(claimedRecipes), [claimedRecipes]);
  const collectedThemeSet = useMemo(() => new Set(collectedThemes), [collectedThemes]);

  // Known item IDs from items.json
  const knownIds = useMemo(() => {
    const s = new Set<string>();
    ALL_WEAPONS.forEach(w => s.add(w.id));
    ALL_OUTFITS.forEach(o => s.add(o.id));
    ALL_THEMES.forEach(t => s.add(t.id));
    return s;
  }, []);

  // Unknown = IDs in claimedRecipes or collectedThemes that aren't in items.json
  const unknownIds = useMemo(() => {
    const unknown: string[] = [];
    const seen = new Set<string>();
    for (const id of [...claimedRecipes, ...collectedThemes]) {
      if (!seen.has(id) && !knownIds.has(id)) {
        seen.add(id);
        unknown.push(id);
      }
    }
    return unknown.sort();
  }, [claimedRecipes, collectedThemes, knownIds]);

  const toggleClaimed = (id: string) => {
    const updated = { ...data };
    const s = getSurvivalW(updated);
    const current: string[] = s.claimedRecipes || [];
    s.claimedRecipes = current.includes(id)
      ? current.filter((r: string) => r !== id)
      : [...current, id];
    onChange(updated);
  };

  const toggleTheme = (id: string) => {
    const updated = { ...data };
    const s = getSurvivalW(updated);
    if (!s.collectedThemes) s.collectedThemes = { themeList: [] };
    const current: string[] = s.collectedThemes.themeList || [];
    s.collectedThemes.themeList = current.includes(id)
      ? current.filter((r: string) => r !== id)
      : [...current, id];
    onChange(updated);
  };

  const renderWeaponItem = (id: string) => {
    const item = getItem(id);
    return (
      <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer">
        <Checkbox checked={claimedSet.has(id)} onCheckedChange={() => toggleClaimed(id)} />
        <span className="text-sm truncate" title={id}>{getItemLabel(id)}</span>
        {item?.damage && <span className="text-xs text-muted-foreground ml-auto shrink-0">⚔ {item.damage}</span>}
      </label>
    );
  };

  const renderOutfitItem = (id: string) => {
    const item = getItem(id);
    const sp = formatSpecial(item?.special);
    return (
      <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer">
        <Checkbox checked={claimedSet.has(id)} onCheckedChange={() => toggleClaimed(id)} />
        <span className="text-sm truncate" title={id}>{getItemLabel(id)}</span>
        {sp && <span className="text-xs text-primary ml-auto shrink-0">{sp}</span>}
      </label>
    );
  };

  const renderThemeItem = (id: string) => (
    <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer">
      <Checkbox checked={collectedThemeSet.has(id)} onCheckedChange={() => toggleTheme(id)} />
      <span className="text-sm truncate" title={id}>{getItemLabel(id)}</span>
    </label>
  );

  const renderUnknownItem = (id: string) => (
    <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer">
      <Checkbox checked={claimedSet.has(id) || collectedThemeSet.has(id)} disabled />
      <span className="text-sm truncate" title={id}>{getItemLabel(id)}</span>
      <span className="text-xs text-muted-foreground ml-auto shrink-0 font-mono">{id}</span>
    </label>
  );

  const weaponCount = ALL_WEAPONS.length;
  const outfitCount = ALL_OUTFITS.length;
  const themeCount = ALL_THEMES.length;

  const visibleTabs = TABS.filter(t => t.id !== 'unknown' || unknownIds.length > 0);
  const counts: Record<RecipeTab, number> = {
    weapons: weaponCount,
    outfits: outfitCount,
    themes: themeCount,
    unknown: unknownIds.length,
  };

  const claimedWeaponCount = ALL_WEAPONS.filter(w => claimedSet.has(w.id)).length;
  const claimedOutfitCount = ALL_OUTFITS.filter(o => claimedSet.has(o.id)).length;
  const collectedThemeCount = ALL_THEMES.filter(t => collectedThemeSet.has(t.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">
          RECIPES ({claimedWeaponCount + claimedOutfitCount} claimed, {collectedThemeCount} themes collected)
        </h2>
      </div>

      {/* Sub-tabs */}
      <nav className="flex border-b border-border">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-display transition-colors border-b-2 ${
              activeTab === id
                ? 'border-primary text-primary pip-text-glow'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label} ({counts[id]})
          </button>
        ))}
      </nav>

      {/* WEAPONS tab - all weapons from items.json */}
      {activeTab === 'weapons' && (
        <div className="space-y-4">
          {WEAPONS_BY_CATEGORY.map((group) => (
            <div key={group.category} className="space-y-1">
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-1 px-2">
                {group.category} ({group.items.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {group.items.map(w => renderWeaponItem(w.id))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OUTFITS tab - all outfits from items.json */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {ALL_OUTFITS.map(o => renderOutfitItem(o.id))}
        </div>
      )}

      {/* THEMES tab - all themes from items.json */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {ALL_THEMES.map(t => renderThemeItem(t.id))}
        </div>
      )}

      {/* UNKNOWN tab */}
      {activeTab === 'unknown' && unknownIds.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ces IDs sont présents dans la sauvegarde mais absents de la base de données. Merci de les signaler.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {unknownIds.map(renderUnknownItem)}
          </div>
        </div>
      )}
    </div>
  );
}
