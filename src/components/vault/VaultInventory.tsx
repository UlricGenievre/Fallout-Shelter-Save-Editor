import { useMemo, useState } from 'react';
import { classifyRecipes, getItem, getItemLabel, formatSpecial } from '@/lib/gameData';
import { Sword, Shirt, Trash2, HelpCircle } from 'lucide-react';

interface VaultInventoryProps {
  items: any[];
}

type InvTab = 'weapons' | 'outfits' | 'junks' | 'misc';

const INV_TABS = [
  { id: 'weapons', label: 'WEAPONS', icon: Sword },
  { id: 'outfits', label: 'OUTFITS', icon: Shirt },
  { id: 'junks', label: 'JUNK', icon: Trash2 },
  { id: 'misc', label: 'MISC', icon: HelpCircle },
] as const;

export function VaultInventory({ items }: VaultInventoryProps) {
  const [activeTab, setActiveTab] = useState<InvTab>('weapons');

  const { counts, categories } = useMemo(() => {
    if (!items) return { counts: new Map<string, number>(), categories: { weapons: [], outfits: [], themes: [], junks: [], unknown: [] } };
    
    const counts = new Map<string, number>();
    items.forEach(item => {
      const id = typeof item === 'string' ? item : item?.id;
      if (id) {
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    });

    const uniqueIds = Array.from(counts.keys());
    const categories = classifyRecipes(uniqueIds);

    return { counts, categories };
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        No items in inventory.
      </div>
    );
  }

  const renderList = (ids: string[]) => {
    if (!ids || ids.length === 0) {
      return (
        <div className="flex items-center justify-center p-10 text-muted-foreground border border-dashed border-border/50 rounded-lg">
          No items found in this section.
        </div>
      );
    }
    
    const sortedIds = [...ids].sort((a, b) => getItemLabel(a).localeCompare(getItemLabel(b)));

    return (
      <div className="grid grid-cols-1 gap-3">
        {sortedIds.map(id => {
          const count = counts.get(id);
          const itemData = getItem(id);
          const label = getItemLabel(id);
          const damage = itemData?.avgDamage ? `${itemData.avgDamage} (${itemData.damage})` : itemData?.damage;
          const resell = itemData?.resellValue;
          const rarity = itemData?.rarity;
          const outfitBonus = itemData?.special ? formatSpecial(itemData.special) : undefined;
          
          return (
            <div key={id} className="border border-border/60 rounded-lg p-3 sm:p-4 bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
              <div className="grid grid-cols-1 sm:grid-cols-[auto_3fr_1.5fr_1fr] gap-4 items-center">
                <div className="flex-shrink-0 flex items-center justify-start sm:justify-center sm:border-r border-border/30 pb-2 sm:pb-0 sm:pr-4">
                  <div className="bg-primary/20 text-primary font-display font-bold px-3 py-1.5 rounded text-sm min-w-[50px] text-center border border-primary/30">
                    x{count}
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-[15px] font-bold truncate text-foreground" title={label}>{label}</p>
                  {rarity && (
                    <span className={`text-xs mt-1 font-display uppercase tracking-wider ${
                      rarity === 'Legendary' ? 'text-yellow-400' : 
                      rarity === 'Rare' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {rarity}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col justify-center text-left">
                  {damage && <span className="text-sm text-primary font-display">DMG: {damage}</span>}
                  {outfitBonus && <span className="text-sm text-primary font-display">STATS: {outfitBonus}</span>}
                </div>
                
                <div className="flex flex-col justify-center text-left">
                  {resell !== undefined && <span className="text-sm text-yellow-500 font-display">CAPS: {resell}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  let currentIds: string[] = [];
  if (activeTab === 'weapons') currentIds = categories.weapons;
  else if (activeTab === 'outfits') currentIds = categories.outfits;
  else if (activeTab === 'junks') currentIds = categories.junks;
  else currentIds = [...categories.themes, ...categories.unknown];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-0 shrink-0">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-4">VAULT INVENTORY</h2>
        
        <div className="flex space-x-1 sm:space-x-2 border-b border-border/50 overflow-x-auto pb-[1px]">
          {INV_TABS.map(({ id, label, icon: Icon }) => {
            let tabCount = 0;
            if (id === 'weapons') tabCount = categories.weapons.length;
            else if (id === 'outfits') tabCount = categories.outfits.length;
            else if (id === 'junks') tabCount = categories.junks.length;
            else tabCount = categories.themes.length + categories.unknown.length;

            if (id === 'misc' && tabCount === 0) return null;

            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-display transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === id
                    ? 'border-primary text-primary pip-text-glow bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10'
                }`}
              >
                <Icon className="w-4 h-4 hidden sm:block" />
                {label} ({tabCount})
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto pb-10">
          {renderList(currentIds)}
        </div>
      </div>
    </div>
  );
}
