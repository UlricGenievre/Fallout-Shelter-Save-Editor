import { useMemo, useState } from 'react';
import { classifyRecipes } from '@/lib/gameData';
import { Sword, Shirt, Trash2, HelpCircle } from 'lucide-react';
import { InventoryWeapons } from './InventoryWeapons';
import { InventoryOutfits } from './InventoryOutfits';
import { InventoryJunks } from './InventoryJunks';

interface VaultInventoryProps {
  items: any[];
  onSellItem?: (itemId: string, amount: number, resellValue: number) => void;
  dwellers?: any[];
  rooms?: any[];
  onEquipWeapon?: (targetDwellerId: number, weaponId: string) => void;
}

type InvTab = 'weapons' | 'outfits' | 'junks' | 'misc';

const INV_TABS = [
  { id: 'weapons', label: 'WEAPONS', icon: Sword },
  { id: 'outfits', label: 'OUTFITS', icon: Shirt },
  { id: 'junks', label: 'JUNK', icon: Trash2 },
  { id: 'misc', label: 'MISC', icon: HelpCircle },
] as const;

export function VaultInventory({ items, onSellItem, dwellers, rooms, onEquipWeapon }: VaultInventoryProps) {
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



  let currentIds: string[] = [];
  if (activeTab === 'weapons') currentIds = categories.weapons;
  else if (activeTab === 'outfits') currentIds = categories.outfits;
  else if (activeTab === 'junks') currentIds = categories.junks;
  else currentIds = [...categories.themes, ...categories.unknown];

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-3 pb-0 shrink-0 flex flex-col items-center">

        <div className="flex justify-center space-x-1 sm:space-x-2 border-b border-border/50 overflow-x-auto pb-[1px] w-full max-w-5xl">
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
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-display transition-colors border-b-2 whitespace-nowrap ${activeTab === id
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
          {activeTab === 'weapons' && <InventoryWeapons ids={currentIds} counts={counts} onSellItem={onSellItem} dwellers={dwellers} rooms={rooms} onEquipWeapon={onEquipWeapon} />}
          {activeTab === 'outfits' && <InventoryOutfits ids={currentIds} counts={counts} onSellItem={onSellItem} />}
          {activeTab === 'junks' && <InventoryJunks ids={currentIds} counts={counts} onSellItem={onSellItem} emptyMessage="No junk items found." />}
          {activeTab === 'misc' && <InventoryJunks ids={currentIds} counts={counts} onSellItem={onSellItem} emptyMessage="No misc items found." />}
        </div>
      </div>
    </div>
  );
}
