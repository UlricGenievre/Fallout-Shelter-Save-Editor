import { useMemo } from 'react';
import { FlaskConical, Sword, Shirt, Home, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { classifyRecipes, getItemLabel, getItem, formatSpecial, WEAPONS_BY_CATEGORY, ALL_OUTFITS } from '@/lib/gameData';

interface RecipesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function RecipesEditor({ data, onChange }: RecipesEditorProps) {
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

    if (current.includes(id)) {
      sw.claimedRecipes = current.filter((r: string) => r !== id);
    } else {
      sw.claimedRecipes = [...current, id];
    }
    onChange(updated);
  };

  const renderWeaponItem = (id: string) => {
    const item = getItem(id);
    return (
      <label
        key={id}
        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        <Checkbox
          checked={claimedSet.has(id)}
          onCheckedChange={() => toggleClaimed(id)}
        />
        <span className="text-sm truncate" title={id}>
          {getItemLabel(id)}
        </span>
        {item?.damage && (
          <span className="text-xs text-muted-foreground ml-auto shrink-0">⚔ {item.damage}</span>
        )}
      </label>
    );
  };

  const renderOutfitItem = (id: string) => {
    const item = getItem(id);
    const sp = formatSpecial(item?.special);
    return (
      <label
        key={id}
        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer"
      >
        <Checkbox
          checked={claimedSet.has(id)}
          onCheckedChange={() => toggleClaimed(id)}
        />
        <span className="text-sm truncate" title={id}>
          {getItemLabel(id)}
        </span>
        {sp && (
          <span className="text-xs text-primary ml-auto shrink-0">{sp}</span>
        )}
      </label>
    );
  };

  const renderGenericItem = (id: string) => (
    <label
      key={id}
      className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer"
    >
      <Checkbox
        checked={claimedSet.has(id)}
        onCheckedChange={() => toggleClaimed(id)}
      />
      <span className="text-sm truncate" title={id}>
        {getItemLabel(id)}
      </span>
      <span className="text-xs text-muted-foreground ml-auto shrink-0">{id}</span>
    </label>
  );

  if (recipes.length === 0) {
    return (
      <div className="text-muted-foreground text-sm font-display">
        No recipes found in vault.survivalW.recipes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">
          RECIPES ({recipes.length} recipes, {claimedRecipes.length} claimed)
        </h2>
      </div>

      {/* WEAPONS by category */}
      {classified.weapons.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm pip-text-glow">WEAPONS ({classified.weapons.length})</h3>
          </div>
          {WEAPONS_BY_CATEGORY.map((group) => {
            const groupIds = group.items.filter(w => recipeSet.has(w.id)).map(w => w.id);
            if (groupIds.length === 0) return null;
            return (
              <div key={group.category} className="space-y-1 ml-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-display mb-1">{group.category} ({groupIds.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {groupIds.map(renderWeaponItem)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OUTFITS */}
      {classified.outfits.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shirt className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm pip-text-glow">OUTFITS ({classified.outfits.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {classified.outfits.map(renderOutfitItem)}
          </div>
        </div>
      )}

      {/* THEMES */}
      {classified.themes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display text-sm pip-text-glow">THEMES ({classified.themes.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {classified.themes.map(renderGenericItem)}
          </div>
        </div>
      )}

      {/* UNKNOWN */}
      {classified.unknown.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display text-sm pip-text-glow">UNKNOWN ({classified.unknown.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {classified.unknown.map(renderGenericItem)}
          </div>
        </div>
      )}
    </div>
  );
}
