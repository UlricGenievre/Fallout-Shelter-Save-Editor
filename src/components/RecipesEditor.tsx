import { useMemo } from 'react';
import { FlaskConical, Sword, Shirt } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { extractItemIds, classifyRecipes, itemIdToLabel } from '@/lib/gameData';

interface RecipesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function RecipesEditor({ data, onChange }: RecipesEditorProps) {
  const recipes: string[] = data?.vault?.LunchboxesData?.recipes || [];
  const claimedRecipes: string[] = data?.vault?.LunchboxesData?.claimedRecipes || [];
  const claimedSet = useMemo(() => new Set(claimedRecipes), [claimedRecipes]);

  const { weapons: knownWeapons, outfits: knownOutfits } = useMemo(() => extractItemIds(data), [data]);

  const classified = useMemo(() => {
    return classifyRecipes(
      recipes,
      new Set(knownWeapons),
      new Set(knownOutfits)
    );
  }, [recipes, knownWeapons, knownOutfits]);

  const toggleClaimed = (id: string) => {
    const updated = { ...data };
    const current: string[] = updated.vault.LunchboxesData.claimedRecipes || [];

    if (current.includes(id)) {
      updated.vault.LunchboxesData.claimedRecipes = current.filter((r: string) => r !== id);
    } else {
      updated.vault.LunchboxesData.claimedRecipes = [...current, id];
    }
    onChange(updated);
  };

  const renderSection = (title: string, icon: React.ReactNode, items: string[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-display text-sm pip-text-glow">{title} ({items.length})</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {items.map((id) => (
            <label
              key={id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <Checkbox
                checked={claimedSet.has(id)}
                onCheckedChange={() => toggleClaimed(id)}
              />
              <span className="text-sm truncate" title={id}>
                {itemIdToLabel(id)}
              </span>
              <span className="text-xs text-muted-foreground ml-auto shrink-0">{id}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (recipes.length === 0) {
    return (
      <div className="text-muted-foreground text-sm font-display">
        Aucune recette trouvée dans la sauvegarde.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">
          RECHERCHES ({recipes.length} recettes, {claimedRecipes.length} réclamées)
        </h2>
      </div>

      {renderSection('ARMES', <Sword className="w-4 h-4 text-primary" />, classified.weapons)}
      {renderSection('TENUES', <Shirt className="w-4 h-4 text-primary" />, classified.outfits)}
      {renderSection('AUTRE', <FlaskConical className="w-4 h-4 text-muted-foreground" />, classified.other)}
    </div>
  );
}
