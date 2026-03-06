import { useMemo } from 'react';
import { FlaskConical, Sword, Shirt, Home, HelpCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { classifyRecipes, getItemLabel } from '@/lib/gameData';

interface RecipesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export function RecipesEditor({ data, onChange }: RecipesEditorProps) {
  const recipes: string[] = data?.vault?.survivalW?.recipes || data?.survivalW?.recipes || [];
  const claimedRecipes: string[] = data?.vault?.survivalW?.claimedRecipes || data?.survivalW?.claimedRecipes || [];
  const claimedSet = useMemo(() => new Set(claimedRecipes), [claimedRecipes]);

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
                {getItemLabel(id)}
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
        Aucune recette trouvée dans vault.survivalW.recipes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">
          RECETTES ({recipes.length} recettes, {claimedRecipes.length} réclamées)
        </h2>
      </div>

      {renderSection('ARMES', <Sword className="w-4 h-4 text-primary" />, classified.weapons)}
      {renderSection('TENUES', <Shirt className="w-4 h-4 text-primary" />, classified.outfits)}
      {renderSection('THÈMES', <Home className="w-4 h-4 text-muted-foreground" />, classified.themes)}
      {renderSection('INCONNU', <HelpCircle className="w-4 h-4 text-muted-foreground" />, classified.unknown)}
    </div>
  );
}
