import { useState } from 'react';
import { getItem, getItemLabel } from '@/lib/gameData';
import { Coins, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DwellerPickerDialog } from '@/components/shared/DwellerPickerDialog';

interface InventoryOutfitsProps {
  ids: string[];
  counts: Map<string, number>;
  onSellItem?: (itemId: string, amount: number, resellValue: number) => void;
  dwellers?: any[];
  rooms?: any[];
  onEquipOutfit?: (targetDwellerId: number, outfitId: string) => void;
}

type SortField = 'name' | 'quantity' | 'rarity' | 'value' | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';
type SortDirection = 'asc' | 'desc';

const SPECIAL_KEYS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;

export function InventoryOutfits({ ids, counts, onSellItem, dwellers, rooms, onEquipOutfit }: InventoryOutfitsProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({ field: 'name', direction: 'asc' });
  const [equipPickerOutfitId, setEquipPickerOutfitId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      const isSpecial = SPECIAL_KEYS.includes(field as any);
      return {
        field,
        direction: prev.field === field
          ? (prev.direction === 'asc' ? 'desc' : 'asc')
          : (isSpecial ? 'desc' : 'asc')
      };
    });
  };

  const SortButton = ({ field, label, align = 'left' }: { field: SortField, label: string, align?: 'left' | 'center' | 'right' }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === 'center' ? 'justify-center w-full' : align === 'right' ? 'justify-end w-full' : 'justify-start'
          }`}
      >
        <span className="flex items-center gap-1 cursor-pointer">
          {label}
          {isActive ? (
            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100 transition-opacity" />
          )}
        </span>
      </button>
    );
  };

  const SpecialSortButton = ({ field }: { field: typeof SPECIAL_KEYS[number] }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center justify-center w-full text-xs font-display font-medium text-muted-foreground hover:text-foreground transition-colors"
        title={`Sort by ${field}`}
      >
        <span className={`flex justify-center items-center w-6 rounded-md cursor-pointer ${isActive ? 'text-primary bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'}`}>
          {field}
          {isActive && (
            sortConfig.direction === 'asc' ? <ArrowUp className="w-2.5 h-2.5 ml-[1px]" /> : <ArrowDown className="w-2.5 h-2.5 ml-[1px]" />
          )}
        </span>
      </button>
    );
  };

  if (!ids || ids.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground border border-dashed border-border/50 rounded-lg">
        No outfits found in this section.
      </div>
    );
  }

  const sortedIds = [...ids].sort((a, b) => {
    const itemA = getItem(a);
    const itemB = getItem(b);

    let comparison = 0;
    switch (sortConfig.field) {
      case 'name':
        comparison = getItemLabel(a).localeCompare(getItemLabel(b));
        break;
      case 'quantity':
        comparison = (counts.get(a) || 0) - (counts.get(b) || 0);
        break;
      case 'value':
        comparison = (itemA?.resellValue || 0) - (itemB?.resellValue || 0);
        break;
      case 'rarity':
        const rarityRank = { 'Legendary': 3, 'Rare': 2, 'Common': 1 };
        const rankA = rarityRank[itemA?.rarity as keyof typeof rarityRank] || 0;
        const rankB = rarityRank[itemB?.rarity as keyof typeof rarityRank] || 0;
        comparison = rankA - rankB;
        break;
      case 'S': case 'P': case 'E': case 'C': case 'I': case 'A': case 'L':
        const statA = itemA?.special?.[sortConfig.field] || 0;
        const statB = itemB?.special?.[sortConfig.field] || 0;
        comparison = statA - statB;
        break;
    }

    if (comparison === 0 && sortConfig.field !== 'name') {
      return getItemLabel(a).localeCompare(getItemLabel(b));
    }
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col">
      <div className="hidden sm:grid grid-cols-[80px_minmax(100px,2fr)_repeat(7,20px)_minmax(60px,1fr)_200px] gap-3 px-2 md:px-4 py-3 -mt-3 mb-3 border-b border-border/40 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-center border-r border-transparent pr-2 md:pr-4">
          <SortButton field="quantity" label="Qty" align="center" />
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 shrink-0 overflow-hidden">
          <SortButton field="name" label="Name" />
          <SortButton field="rarity" label="Rarity" />
        </div>

        {SPECIAL_KEYS.map(key => (
          <SpecialSortButton key={key} field={key} />
        ))}

        <div className="flex items-center pl-2 md:pl-4">
          <SortButton field="value" label="Value" align="left" />
        </div>
        <div className="flex justify-end items-center text-[10px] md:text-[11px] font-display uppercase tracking-wider text-muted-foreground/70 mr-1">
          Actions
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sortedIds.map(id => {
          const count = counts.get(id);
          const itemData = getItem(id);
          const label = getItemLabel(id);
          const resell = itemData?.resellValue;
          const rarity = itemData?.rarity;

          return (
            <div key={id} className="border border-border/60 rounded-lg p-2 bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
              <div className="grid grid-cols-1 sm:grid-cols-[80px_minmax(100px,2fr)_repeat(7,20px)_minmax(60px,1fr)_200px] gap-2 md:gap-3 items-center">
                <div className="flex-shrink-0 flex items-center justify-start sm:justify-center sm:border-r border-border/30 pb-2 sm:pb-0 pr-2 md:pr-4">
                  <div className="bg-primary/20 text-primary font-display font-bold px-2 md:px-3 py-1.5 rounded text-sm min-w-[40px] md:min-w-[50px] text-center border border-primary/30">
                    x{count || 0}
                  </div>
                </div>

                <div className="flex flex-col min-w-0 pr-2">
                  <p className="text-[14px] md:text-[15px] font-bold truncate text-foreground" title={label}>{label}</p>
                  {rarity && (
                    <span className={`text-[10px] md:text-xs mt-0.5 md:mt-1 font-display uppercase tracking-wider ${rarity === 'Legendary' ? 'text-yellow-400' :
                      rarity === 'Rare' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                      {rarity}
                    </span>
                  )}
                </div>

                {SPECIAL_KEYS.map(key => {
                  const val = itemData?.special?.[key];
                  return (
                    <div key={key} className="flex justify-center items-center text-sm font-display font-bold">
                      {val ? (
                        <span className="text-sm text-primary font-display">+{val}</span>
                      ) : (
                        <span className="text-muted-foreground/20">-</span>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-col justify-center text-left pl-2 md:pl-4">
                  {resell !== undefined && (
                    <span className="flex items-center text-sm text-yellow-500 font-display">
                      <Coins className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5" />
                      {resell}
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-1 md:gap-2">
                  {onEquipOutfit && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 md:h-8 px-1.5 md:px-2 text-[10px] md:text-xs border border-primary hover:bg-background hover:text-primary transition-colors"
                      onClick={() => setEquipPickerOutfitId(id)}
                    >
                      Equip
                    </Button>
                  )}
                  {resell !== undefined && onSellItem && (
                    <>
                      <Button variant="outline" size="sm" className="h-7 md:h-8 px-1.5 md:px-2 text-[10px] md:text-xs" onClick={() => onSellItem(id, 1, resell)}>Sell 1</Button>
                      <Button variant="outline" size="sm" className="h-7 md:h-8 px-1.5 md:px-2 text-[10px] md:text-xs" disabled={(count || 0) < 10} onClick={() => onSellItem(id, 10, resell)}>Sell 10</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {equipPickerOutfitId !== null && (
        <DwellerPickerDialog
          open
          onClose={() => setEquipPickerOutfitId(null)}
          itemId={equipPickerOutfitId}
          dwellers={dwellers || []}
          rooms={rooms || []}
          onEquip={targetDwellerId => {
            onEquipOutfit?.(targetDwellerId, equipPickerOutfitId);
            setEquipPickerOutfitId(null);
          }}
        />
      )}
    </div>
  );
}
