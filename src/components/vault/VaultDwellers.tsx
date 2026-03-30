import { useState, useMemo } from 'react';
import { DwellerCard } from '../shared/DwellerCard';
import { WeaponPickerDialog } from '../shared/WeaponPickerDialog';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getItem } from '@/lib/gameData';
import roomsData from '@/data/rooms.json';

interface VaultDwellersProps {
  dwellers: any[];
  rooms: any[];
  inventory: any[];
  onEquipWeapon?: (targetDwellerId: number, newWeaponId: string, sourceDwellerId?: number) => void;
}

type SortField = 'name' | 'level' | 'hp' | 'room' | 'damage' | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';
type SortDirection = 'asc' | 'desc';

const SPECIAL_KEYS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;

export function VaultDwellers({ dwellers, rooms, inventory, onEquipWeapon }: VaultDwellersProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'name',
    direction: 'asc',
  });
  const [weaponPickerDwellerId, setWeaponPickerDwellerId] = useState<number | null>(null);

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
        className={`flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === 'center' ? 'justify-center w-full' : align === 'right' ? 'justify-end w-full' : 'justify-start'
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

  const dwellerRooms = useMemo(() => {
    const map = new Map<number, { name: string; special: string }>();
    const roomInfoMap = new Map((roomsData.rooms as any[]).map(r => [r.type, r]));
    rooms?.forEach(room => {
      room.dwellers?.forEach((id: number) => {
        const roomInfo = roomInfoMap.get(room.type);
        map.set(id, { name: roomInfo?.name || room.type, special: roomInfo?.special || '' });
      });
    });
    return map;
  }, [rooms]);

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
          const weaponA = getItem(a.equipedWeapon?.id || '');
          const weaponB = getItem(b.equipedWeapon?.id || '');
          const dmgA = parseFloat(weaponA?.avgDamage?.toString() || weaponA?.damage?.toString() || '0') || 0;
          const dmgB = parseFloat(weaponB?.avgDamage?.toString() || weaponB?.damage?.toString() || '0') || 0;
          comparison = dmgA - dmgB;
          break;
        }
        case 'room': {
          const roomA = dwellerRooms.get(a.serializeId)?.name || 'Wandering';
          const roomB = dwellerRooms.get(b.serializeId)?.name || 'Wandering';
          comparison = roomA.localeCompare(roomB);
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
          const statA = a.stats?.stats?.[statIndex]?.value || 0;
          const statB = b.stats?.stats?.[statIndex]?.value || 0;
          comparison = statA - statB;
          break;
        }
      }

      if (comparison === 0 && sortConfig.field !== 'name') {
        return `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`);
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [dwellers, sortConfig, dwellerRooms]);

  if (!dwellers || dwellers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No dwellers found.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-4 text-center">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">
          VAULT DWELLERS ({dwellers.length})
        </h2>
      </div>

      {/* Barre de tri — alignée sur DwellerCard [1.5fr_1.5fr_2fr_1fr] */}
      <div className="max-w-5xl mx-auto mb-3">
        <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_2fr_1fr] gap-4 px-4 pb-3 border-b border-border/40 items-center">
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
          {/* Col 3 : Equipped weapon damage */}
          <div className="flex items-center">
            <SortButton field="damage" label="Damage" />
          </div>
          {/* Col 4 : Assigned room */}
          <div className="flex justify-end items-center">
            <SortButton field="room" label="Room" align="right" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto pb-10">
        {sortedDwellers.map(dweller => {
          const rInfo = dwellerRooms.get(dweller.serializeId);
          return (
            <DwellerCard
              key={dweller.serializeId}
              dweller={dweller}
              roomName={rInfo?.name}
              roomSpecial={rInfo?.special}
              onEditWeapon={() => setWeaponPickerDwellerId(dweller.serializeId)}
            />
          );
        })}
      </div>

      {/* Weapon picker modal */}
      {weaponPickerDwellerId !== null && (() => {
        const pickerDweller = dwellers.find(d => d.serializeId === weaponPickerDwellerId);
        if (!pickerDweller) return null;
        return (
          <WeaponPickerDialog
            open
            onClose={() => setWeaponPickerDwellerId(null)}
            dweller={pickerDweller}
            allDwellers={dwellers}
            inventory={inventory}
            dwellerRooms={dwellerRooms}
            onEquip={(newWeaponId, sourceDwellerId) =>
              onEquipWeapon?.(weaponPickerDwellerId, newWeaponId, sourceDwellerId)
            }
          />
        );
      })()}
    </div>
  );
}
