import { useMemo, useState } from 'react';
import { FlaskConical, Sword, Shirt, Home, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { classifyRecipes, getItemLabel, getItem, formatSpecial, WEAPONS_BY_CATEGORY } from '@/lib/gameData';

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

  const recipes: string[] = data?.vault?.survivalW?.recipes || data?.survivalW?.recipes || [];
  const claimedRecipes: string[] = data?.vault?.survivalW?.claimedRecipes || data?.survivalW?.claimedRecipes || [];
  const claimedSet = useMemo(() => new Set(claimedRecipes), [claimedRecipes]);
  const recipeSet = useMemo(() => new Set(recipes), [recipes]);
  const classified = useMemo(() => classifyRecipes(recipes), [recipes]);

  const getSurvivalW = (d: any) => d?.vault?.survivalW || d?.survivalW;

  const toggleClaimed = (id: string) => {
    const updated = { ...data };
    const sw = getSurvivalW(updated);
    const current: string[] = sw.claimedRecipes || [];
    sw.claimedRecipes = current.includes(id)
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

  const renderGenericItem = (id: string) => (
    <label key={id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer">
      <Checkbox checked={claimedSet.has(id)} onCheckedChange={() => toggleClaimed(id)} />
      <span className="text-sm truncate" title={id}>{getItemLabel(id)}</span>
      <span className="text-xs text-muted-foreground ml-auto shrink-0 font-mono">{id}</span>
    </label>
  );

  if (recipes.length === 0) {
    return <div className="text-muted-foreground text-sm font-display">No recipes found in vault.survivalW.recipes.</div>;
  }

  const visibleTabs = TABS.filter(t => t.id !== 'unknown' || classified.unknown.length > 0);
  const counts: Record<RecipeTab, number> = {
    weapons: classified.weapons.length,
    outfits: classified.outfits.length,
    themes: classified.themes.length,
    unknown: classified.unknown.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">
          RECIPES ({recipes.length} total, {claimedRecipes.length} claimed)
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

      {/* WEAPONS tab */}
      {activeTab === 'weapons' && (
        <div className="space-y-4">
          {WEAPONS_BY_CATEGORY.map((group) => {
            const groupIds = group.items.filter(w => recipeSet.has(w.id)).map(w => w.id);
            // Also include heuristic-classified weapons not in known map
            const extraIds = classified.weapons.filter(id =>
              !WEAPONS_BY_CATEGORY.some(g => g.items.some(w => w.id === id)) &&
              group.category === 'Other'
            );
            const allIds = [...groupIds, ...extraIds];
            if (allIds.length === 0) return null;
            return (
              <div key={group.category} className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-1 px-2">
                  {group.category} ({allIds.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {allIds.map(renderWeaponItem)}
                </div>
              </div>
            );
          })}
          {/* Heuristic-guessed weapons not in any known category */}
          {(() => {
            const knownIds = new Set(WEAPONS_BY_CATEGORY.flatMap(g => g.items.map(w => w.id)));
            const extras = classified.weapons.filter(id => !knownIds.has(id));
            if (!extras.length) return null;
            return (
              <div className="space-y-1">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-1 px-2">Other ({extras.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">{extras.map(renderWeaponItem)}</div>
              </div>
            );
          })()}
        </div>
      )}

      {/* OUTFITS tab */}
      {activeTab === 'outfits' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {classified.outfits.map(renderOutfitItem)}
        </div>
      )}

      {/* THEMES tab */}
      {activeTab === 'themes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {classified.themes.map(renderGenericItem)}
        </div>
      )}

      {/* UNKNOWN tab (only shown if non-empty) */}
      {activeTab === 'unknown' && classified.unknown.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ces IDs n'ont pas pu être classifiés. Merci de les signaler pour enrichir la base de données.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {classified.unknown.map(renderGenericItem)}
          </div>
        </div>
      )}
    </div>
  );
}
