import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getItem, getItemLabel, formatSpecial } from '@/lib/gameData';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { DwellerCard } from '@/components/shared/DwellerCard';
import roomsData from '@/data/rooms.json';

interface DwellerPickerDialogProps {
  open: boolean;
  onClose: () => void;
  /** ID de l'item à équiper (arme ou outfit depuis l'inventaire). */
  itemId: string;
  dwellers: any[];
  rooms: any[];
  onEquip: (targetDwellerId: number) => void;
}

type SortField =
  | 'name' | 'level' | 'hp'
  | 'room' | 'roomS' | 'roomP' | 'roomE' | 'roomC' | 'roomI' | 'roomA' | 'roomL'
  | 'damage'
  | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';

const ROOM_SORT_KEYS = ['roomS', 'roomP', 'roomE', 'roomC', 'roomI', 'roomA', 'roomL'] as const;
type SortDirection = 'asc' | 'desc';
const SPECIAL_KEYS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;

const RARITY_COLORS: Record<string, string> = {
  Legendary: 'text-yellow-400',
  Rare: 'text-blue-400',
  Common: 'text-green-400',
};

export function DwellerPickerDialog({
  open,
  onClose,
  itemId,
  dwellers,
  rooms,
  onEquip,
}: DwellerPickerDialogProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>(() => {
    const data = getItem(itemId);
    const isWep = data ? ('damage' in data || 'avgDamage' in data) : false;
    if (isWep) {
      return { field: 'damage', direction: 'asc' };
    }

    let bestStat = '';
    let maxBonus = 0;
    if (data?.special) {
      const keys = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;
      for (const k of keys) {
        if (data.special[k] && data.special[k] > maxBonus) {
          maxBonus = data.special[k];
          bestStat = k;
        }
      }
    }

    if (bestStat) {
      return { field: `room${bestStat}` as SortField, direction: 'desc' };
    }

    return { field: 'name', direction: 'asc' };
  });

  const itemData = getItem(itemId);
  const itemLabel = getItemLabel(itemId);
  const isWeapon = itemData ? ('damage' in itemData || 'avgDamage' in itemData) : false;
  const itemStats = isWeapon
    ? (itemData?.avgDamage ? `${itemData.avgDamage} (${itemData.damage})` : itemData?.damage)
    : formatSpecial(itemData?.special || {});

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortButton = ({
    field,
    label,
    align = 'left',
  }: {
    field: SortField;
    label: string;
    align?: 'left' | 'center' | 'right';
  }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === 'center'
          ? 'justify-center w-full'
          : align === 'right'
            ? 'justify-end w-full'
            : 'justify-start'
          }`}
      >
        <span className="flex items-center gap-1 cursor-pointer">
          {label}
          {isActive ? (
            sortConfig.direction === 'asc' ? (
              <ArrowUp className="w-3 h-3 text-primary" />
            ) : (
              <ArrowDown className="w-3 h-3 text-primary" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100 transition-opacity" />
          )}
        </span>
      </button>
    );
  };

  const SpecialSortButton = ({ field }: { field: (typeof SPECIAL_KEYS)[number] }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center justify-center w-full text-xs font-display font-medium text-muted-foreground hover:text-foreground transition-colors"
        title={`Sort by ${field}`}
      >
        <span
          className={`flex justify-center items-center w-6 h-6 rounded-md cursor-pointer ${isActive ? 'text-primary bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'
            }`}
        >
          {field}
          {isActive &&
            (sortConfig.direction === 'asc' ? (
              <ArrowUp className="w-2.5 h-2.5 ml-[1px]" />
            ) : (
              <ArrowDown className="w-2.5 h-2.5 ml-[1px]" />
            ))}
        </span>
      </button>
    );
  };

  /* ------------------------------------------------------------------ */
  /* dwellerRooms map — même logique que VaultDwellers                   */
  /* ------------------------------------------------------------------ */
  const dwellerRooms = useMemo(() => {
    const map = new Map<number, { name: string; special: string; category: string }>();
    const roomInfoMap = new Map((roomsData.rooms as any[]).map(r => [r.type, r]));
    rooms?.forEach(room => {
      room.dwellers?.forEach((id: number) => {
        const roomInfo = roomInfoMap.get(room.type);
        map.set(id, {
          name: roomInfo?.name || room.type,
          special: roomInfo?.special || '',
          category: roomInfo?.category || '',
        });
      });
    });
    return map;
  }, [rooms]);

  /* ------------------------------------------------------------------ */
  /* Sort — identique à VaultDwellers (avec inversion Training)          */
  /* ------------------------------------------------------------------ */
  const sortedDwellers = useMemo(() => {
    return [...dwellers].sort((a, b) => {
      let comparison = 0;
      const specialLetters = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];

      switch (sortConfig.field) {
        case 'name':
          comparison = `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`);
          break;
        case 'level':
          comparison = (a.experience?.currentLevel || 1) - (b.experience?.currentLevel || 1);
          break;
        case 'hp':
          comparison = (a.health?.maxHealth || 0) - (b.health?.maxHealth || 0);
          break;
        case 'damage': {
          const wA = getItem(a.equipedWeapon?.id || '');
          const wB = getItem(b.equipedWeapon?.id || '');
          const dmgA = parseFloat(wA?.avgDamage?.toString() || wA?.damage?.toString() || '0') || 0;
          const dmgB = parseFloat(wB?.avgDamage?.toString() || wB?.damage?.toString() || '0') || 0;
          comparison = dmgA - dmgB;
          break;
        }
        case 'room': {
          const roomA = dwellerRooms.get(a.serializeId)?.name || 'Wandering';
          const roomB = dwellerRooms.get(b.serializeId)?.name || 'Wandering';
          comparison = roomA.localeCompare(roomB);
          break;
        }
        case 'roomS':
        case 'roomP':
        case 'roomE':
        case 'roomC':
        case 'roomI':
        case 'roomA':
        case 'roomL': {
          const targetStat = sortConfig.field.slice(4);
          const statIdx = specialLetters.indexOf(targetStat) + 1;
          const rInfoA = dwellerRooms.get(a.serializeId);
          const rInfoB = dwellerRooms.get(b.serializeId);
          const aInRoom = rInfoA?.special === targetStat ? 1 : 0;
          const bInRoom = rInfoB?.special === targetStat ? 1 : 0;
          if (aInRoom !== bInRoom) return bInRoom - aInRoom;
          const rawA = aInRoom ? (a.stats?.stats?.[statIdx]?.value || 0) : 0;
          const rawB = bInRoom ? (b.stats?.stats?.[statIdx]?.value || 0) : 0;
          const valA = aInRoom && rInfoA?.category === 'Training' ? -rawA : rawA;
          const valB = bInRoom && rInfoB?.category === 'Training' ? -rawB : rawB;
          comparison = valA - valB;
          break;
        }
        case 'S':
        case 'P':
        case 'E':
        case 'C':
        case 'I':
        case 'A':
        case 'L': {
          const statIndex = specialLetters.indexOf(sortConfig.field) + 1;
          comparison =
            (a.stats?.stats?.[statIndex]?.value || 0) - (b.stats?.stats?.[statIndex]?.value || 0);
          break;
        }
      }

      if (comparison === 0 && sortConfig.field !== 'name') {
        return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`);
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [dwellers, sortConfig, dwellerRooms]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col gap-3">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display tracking-wider pip-text-glow">
            {isWeapon ? 'EQUIP WEAPON' : 'EQUIP OUTFIT'}
          </DialogTitle>
        </DialogHeader>

        {/* Item being equipped */}
        <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 shrink-0 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-display uppercase tracking-wider">
            {isWeapon ? 'Weapon to equip' : 'Outfit to equip'}
          </p>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{itemLabel}</p>
            {itemStats && (
              <p className="text-xs font-display text-primary/80">{itemStats}</p>
            )}
            {itemData?.rarity && (
              <p
                className={`text-xs font-display ${RARITY_COLORS[itemData.rarity] ?? 'text-muted-foreground'
                  }`}
              >
                {itemData.rarity}
              </p>
            )}
          </div>
        </div>

        {/* Sort bar — même grille que VaultDwellers [1.5fr_1.5fr_2.2fr_1fr] */}
        <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_2.2fr_1fr] gap-4 px-4 pb-3 border-b border-border/40 items-center shrink-0">
          {/* Col 1 : Nom, Lvl, HP */}
          <div className="grid grid-cols-3 gap-2">
            <SortButton field="name" label="Name" />
            <SortButton field="level" label="Lvl" />
            <SortButton field="hp" label="HP Max" />
          </div>
          {/* Col 2 : S.P.E.C.I.A.L. */}
          <div className="grid grid-cols-7 gap-0 items-center">
            {SPECIAL_KEYS.map(key => (
              <SpecialSortButton key={key} field={key} />
            ))}
          </div>
          {/* Col 3 : Damage de l'arme équipée */}
          <div className="flex items-center">
            <SortButton field="damage" label="Damage" />
          </div>
          {/* Col 4 : Room + 7 boutons room-stat */}
          <div className="flex flex-col items-end gap-1">
            <SortButton field="room" label="Room" align="right" />
            <div className="flex gap-0">
              {ROOM_SORT_KEYS.map(rk => {
                const letter = rk.slice(4);
                const isActive = sortConfig.field === rk;
                return (
                  <button
                    key={rk}
                    onClick={() => handleSort(rk)}
                    title={`Trier par salle de stat ${letter}`}
                    className="flex items-center justify-center text-xs font-display font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span
                      className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer ${isActive
                        ? 'text-primary bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted/30'
                        }`}
                    >
                      {letter}
                      {isActive &&
                        (sortConfig.direction === 'asc' ? (
                          <ArrowUp className="w-2 h-2 ml-[1px]" />
                        ) : (
                          <ArrowDown className="w-2 h-2 ml-[1px]" />
                        ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste scrollable — même DwellerCard que VaultDwellers */}
        <div className="overflow-y-auto flex-1 flex flex-col gap-4 pr-1 min-h-0">
          {sortedDwellers.map(dweller => {
            const rInfo = dwellerRooms.get(dweller.serializeId);
            return (
              <DwellerCard
                key={dweller.serializeId}
                dweller={dweller}
                roomName={rInfo?.name}
                roomSpecial={rInfo?.special}
                onClick={() => {
                  onEquip(dweller.serializeId);
                  onClose();
                }}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
