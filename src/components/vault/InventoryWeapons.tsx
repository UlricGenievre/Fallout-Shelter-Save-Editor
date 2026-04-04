import { useState } from 'react';
import { getItem, getItemLabel } from '@/lib/gameData';
import { Coins, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DwellerPickerDialog } from '@/components/shared/DwellerPickerDialog';

interface InventoryWeaponsProps {
  ids: string[];
  counts: Map<string, number>;
  onSellItem?: (itemId: string, amount: number, resellValue: number) => void;
  dwellers?: any[];
  rooms?: any[];
  onEquipWeapon?: (targetDwellerId: number, weaponId: string) => void;
}

type SortField = 'name' | 'quantity' | 'rarity' | 'value' | 'damage';
type SortDirection = 'asc' | 'desc';

export function InventoryWeapons({ ids, counts, onSellItem, dwellers, rooms, onEquipWeapon }: InventoryWeaponsProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({ field: 'name', direction: 'asc' });
  const [equipPickerWeaponId, setEquipPickerWeaponId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortButton = ({ field, label, align = 'left' }: { field: SortField, label: string, align?: 'left' | 'center' | 'right' }) => {
    const isActive = sortConfig.field === field;
    return (
      <button 
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${
          align === 'center' ? 'justify-center w-full' : align === 'right' ? 'justify-end w-full' : 'justify-start'
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

  if (!ids || ids.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground border border-dashed border-border/50 rounded-lg">
        No weapons found in this section.
      </div>
    );
  }

  const sortedIds = [...ids].sort((a, b) => {
    const itemA = getItem(a);
    const itemB = getItem(b);
    
    let comparison = 0;
    switch(sortConfig.field) {
      case 'name':
        comparison = getItemLabel(a).localeCompare(getItemLabel(b));
        break;
      case 'quantity':
        comparison = (counts.get(a) || 0) - (counts.get(b) || 0);
        break;
      case 'value':
        comparison = (itemA?.resellValue || 0) - (itemB?.resellValue || 0);
        break;
      case 'damage':
        const dmgA = parseFloat(itemA?.avgDamage?.toString() || itemA?.damage?.toString() || '0') || 0;
        const dmgB = parseFloat(itemB?.avgDamage?.toString() || itemB?.damage?.toString() || '0') || 0;
        comparison = dmgA - dmgB;
        break;
      case 'rarity':
        const rarityRank = { 'Legendary': 3, 'Rare': 2, 'Common': 1 };
        const rankA = rarityRank[itemA?.rarity as keyof typeof rarityRank] || 0;
        const rankB = rarityRank[itemB?.rarity as keyof typeof rarityRank] || 0;
        comparison = rankA - rankB;
        break;
    }
    
    if (comparison === 0 && sortConfig.field !== 'name') {
      return getItemLabel(a).localeCompare(getItemLabel(b));
    }
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="flex flex-col">
      <div className="hidden sm:grid grid-cols-[80px_3fr_1.5fr_1fr_200px] gap-4 px-4 py-3 -mt-3 mb-2 border-b border-border/40 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-center border-r border-transparent pr-4">
          <SortButton field="quantity" label="Qty" align="center" />
        </div>
        <div className="flex gap-6">
          <SortButton field="name" label="Name" />
          <SortButton field="rarity" label="Rarity" />
        </div>
        <div className="flex items-center">
          <SortButton field="damage" label="Damage" align="left" />
        </div>
        <div className="flex items-center">
          <SortButton field="value" label="Value" align="left" />
        </div>
        <div className="flex justify-end items-center text-[11px] font-display uppercase tracking-wider text-muted-foreground/70 mr-1">
          Actions
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sortedIds.map(id => {
          const count = counts.get(id);
          const itemData = getItem(id);
          const label = getItemLabel(id);
          const damage = itemData?.avgDamage ? `${itemData.avgDamage} (${itemData.damage})` : itemData?.damage;
          const resell = itemData?.resellValue;
          const rarity = itemData?.rarity;

          return (
            <div key={id} className="border border-border/60 rounded-lg p-3 sm:p-4 bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5">
              <div className="grid grid-cols-1 sm:grid-cols-[80px_3fr_1.5fr_1fr_200px] gap-4 items-center">
                <div className="flex-shrink-0 flex items-center justify-start sm:justify-center sm:border-r border-border/30 pb-2 sm:pb-0 sm:pr-4">
                  <div className="bg-primary/20 text-primary font-display font-bold px-3 py-1.5 rounded text-sm min-w-[50px] text-center border border-primary/30">
                    x{count || 0}
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-[15px] font-bold truncate text-foreground" title={label}>{label}</p>
                  {rarity && (
                    <span className={`text-xs mt-1 font-display uppercase tracking-wider ${rarity === 'Legendary' ? 'text-yellow-400' :
                      rarity === 'Rare' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                      {rarity}
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-center text-left">
                  {damage && <span className="text-sm text-primary font-display tracking-widest">{damage}</span>}
                </div>

                <div className="flex flex-col justify-center text-left">
                  {resell !== undefined && (
                    <span className="flex items-center text-sm text-yellow-500 font-display">
                      <Coins className="w-4 h-4 mr-1.5" />
                      {resell}
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {onEquipWeapon && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => setEquipPickerWeaponId(id)}
                    >
                      Equip
                    </Button>
                  )}
                  {resell !== undefined && onSellItem && (
                    <>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => onSellItem(id, 1, resell)}>Sell 1</Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs" disabled={(count || 0) < 10} onClick={() => onSellItem(id, 10, resell)}>Sell 10</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {equipPickerWeaponId !== null && (
        <DwellerPickerDialog
          open
          onClose={() => setEquipPickerWeaponId(null)}
          itemId={equipPickerWeaponId}
          dwellers={dwellers || []}
          rooms={rooms || []}
          onEquip={targetDwellerId => {
            onEquipWeapon?.(targetDwellerId, equipPickerWeaponId);
            setEquipPickerWeaponId(null);
          }}
        />
      )}
    </div>
  );
}
