import { useState, useMemo } from 'react';
import { DwellerCard } from '../shared/DwellerCard';
import { WeaponPickerDialog } from '../shared/WeaponPickerDialog';
import { OutfitPickerDialog } from '../shared/OutfitPickerDialog';
import { RoomPickerDialog } from '../shared/RoomPickerDialog';
import { RoomConflictDialog } from '../shared/RoomConflictDialog';
import { DwellerEditDialog } from '../shared/DwellerEditDialog';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowRightLeft } from 'lucide-react';
import { getItem } from '@/lib/gameData';
import roomsData from '@/data/rooms.json';

interface VaultDwellersProps {
  dwellers: any[];
  rooms: any[];
  inventory: any[];
  onEquipWeapon?: (targetDwellerId: number, newWeaponId: string, sourceDwellerId?: number) => void;
  onEquipOutfit?: (targetDwellerId: number, newOutfitId: string, sourceDwellerId?: number) => void;
  onMoveDweller?: (dwellerId: number, sourceRoomIndex: number | null, targetRoomIndex: number | null, bumpedDwellerId?: number, isSwap?: boolean) => void;
  onUpdateDweller?: (dwellerId: number, changes: any) => void;
}

type SortField = 'name' | 'level' | 'hp' | 'room' | 'roomS' | 'roomP' | 'roomE' | 'roomC' | 'roomI' | 'roomA' | 'roomL' | 'damage' | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';
const ROOM_SORT_KEYS = ['roomS', 'roomP', 'roomE', 'roomC', 'roomI', 'roomA', 'roomL'] as const;
type RoomSortKey = (typeof ROOM_SORT_KEYS)[number];
type SortDirection = 'asc' | 'desc';

const SPECIAL_KEYS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;

export function VaultDwellers({ dwellers, rooms, inventory, onEquipWeapon, onEquipOutfit, onMoveDweller, onUpdateDweller }: VaultDwellersProps) {
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'name',
    direction: 'asc',
  });
  const [weaponPickerDwellerId, setWeaponPickerDwellerId] = useState<number | null>(null);
  const [outfitPickerDwellerId, setOutfitPickerDwellerId] = useState<number | null>(null);
  const [movingDwellerId, setMovingDwellerId] = useState<number | null>(null);
  const [pickerTargetRoomIndex, setPickerTargetRoomIndex] = useState<number | null>(null);
  const [editingDwellerId, setEditingDwellerId] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => {
      const isSpecial = SPECIAL_KEYS.includes(field as any) || ROOM_SORT_KEYS.includes(field as any);
      return {
        field,
        direction: prev.field === field
          ? (prev.direction === 'asc' ? 'desc' : 'asc')
          : (isSpecial ? 'desc' : 'asc')
      }
    });
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
        case 'roomS':
        case 'roomP':
        case 'roomE':
        case 'roomC':
        case 'roomI':
        case 'roomA':
        case 'roomL': {
          const targetStat = sortConfig.field.slice(4); // ex: 'roomE' -> 'E'
          const statIdx = specialLetters.indexOf(targetStat) + 1;
          const rInfoA = dwellerRooms.get(a.serializeId);
          const rInfoB = dwellerRooms.get(b.serializeId);
          const aInRoom = rInfoA?.special === targetStat ? 1 : 0;
          const bInRoom = rInfoB?.special === targetStat ? 1 : 0;
          // Groupe 1 (dans la bonne salle) avant groupe 2 (les autres)
          if (aInRoom !== bInRoom) {
            return bInRoom - aInRoom;
          }
          // Au sein du même groupe : tri par valeur de stat
          // Pour les salles Training, on inverse la valeur (priorité aux stats les plus basses)
          const rawA = aInRoom ? (a.stats?.stats?.[statIdx]?.value || 0) : 0;
          const rawB = bInRoom ? (b.stats?.stats?.[statIdx]?.value || 0) : 0;
          const isTrainingA = aInRoom && rInfoA?.category === 'Training';
          const isTrainingB = bInRoom && rInfoB?.category === 'Training';
          const valA = isTrainingA ? -rawA : rawA;
          const valB = isTrainingB ? -rawB : rawB;
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
    <div className="flex flex-col h-full">
      <div className="px-6 pt-3 pb-0 shrink-0 flex flex-col items-center">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">
          VAULT DWELLERS ({dwellers.length})
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Barre de tri — alignée sur DwellerCard [1.5fr_1.5fr_2.2fr_1fr] */}
        <div className="max-w-5xl mx-auto sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_2.2fr_1fr] gap-4 px-4 py-3 border-b border-border/40 items-center">
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
            <div className="flex flex-col items-end gap-1">
              <SortButton field="room" label="Room" align="right" />
              <div className="flex gap-0">
                {ROOM_SORT_KEYS.map(rk => {
                  const letter = rk.slice(4); // 'roomE' -> 'E'
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
        </div>

        <div className="grid grid-cols-1 gap-3 max-w-5xl mx-auto pb-10">
          {sortedDwellers.map(dweller => {
            const rInfo = dwellerRooms.get(dweller.serializeId);
            return (
              <DwellerCard
                key={dweller.serializeId}
                dweller={dweller}
                roomName={rInfo?.name}
                roomSpecial={rInfo?.special}
                onEditWeapon={() => setWeaponPickerDwellerId(dweller.serializeId)}
                onEditOutfit={() => setOutfitPickerDwellerId(dweller.serializeId)}
                onEditDweller={() => setEditingDwellerId(dweller.serializeId)}
                action={
                  onMoveDweller ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full justify-center h-8 px-2 text-xs flex items-center gap-1.5 border border-primary hover:bg-background hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMovingDwellerId(dweller.serializeId);
                      }}
                    >
                      <ArrowRightLeft className="w-3 h-3" /> Move
                    </Button>
                  ) : undefined
                }
              />
            );
          })}
        </div>
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

      {/* Outfit picker modal */}
      {outfitPickerDwellerId !== null && (() => {
        const pickerDweller = dwellers.find(d => d.serializeId === outfitPickerDwellerId);
        if (!pickerDweller) return null;
        return (
          <OutfitPickerDialog
            open
            onClose={() => setOutfitPickerDwellerId(null)}
            dweller={pickerDweller}
            allDwellers={dwellers}
            inventory={inventory}
            dwellerRooms={dwellerRooms}
            onEquip={(newOutfitId, sourceDwellerId) =>
              onEquipOutfit?.(outfitPickerDwellerId, newOutfitId, sourceDwellerId)
            }
          />
        );
      })()}

      {movingDwellerId !== null && (
        <RoomPickerDialog
          open={true}
          onClose={() => setMovingDwellerId(null)}
          dwellerId={movingDwellerId}
          dwellers={dwellers}
          rooms={rooms}
          onSelectRoom={(targetIdx) => {
            if (targetIdx === null) {
              const sourceRoomIdx = rooms.findIndex(r => r.dwellers?.includes(movingDwellerId));
              onMoveDweller?.(movingDwellerId, sourceRoomIdx !== -1 ? sourceRoomIdx : null, null);
              setMovingDwellerId(null);
            } else {
              const targetRoom = rooms[targetIdx];
              let maxCapacity = 2;
              if (targetRoom.type === 'Entrance') maxCapacity = 2;
              else if (targetRoom.type !== 'FakeWasteland') maxCapacity = (targetRoom.mergeLevel || 1) * 2;
              else maxCapacity = 999;

              if ((targetRoom.dwellers?.length || 0) >= maxCapacity) {
                setPickerTargetRoomIndex(targetIdx);
              } else {
                const sourceRoomIdx = rooms.findIndex(r => r.dwellers?.includes(movingDwellerId));
                onMoveDweller?.(movingDwellerId, sourceRoomIdx !== -1 ? sourceRoomIdx : null, targetIdx);
                setMovingDwellerId(null);
              }
            }
          }}
        />
      )}

      {movingDwellerId !== null && pickerTargetRoomIndex !== null && (
        <RoomConflictDialog
          open={true}
          onClose={() => {
            setPickerTargetRoomIndex(null);
          }}
          dwellerId={movingDwellerId}
          targetRoomIndex={pickerTargetRoomIndex}
          dwellers={dwellers}
          rooms={rooms}
          onResolve={(kickedId, isSwap) => {
            const sourceRoomIdx = rooms.findIndex(r => r.dwellers?.includes(movingDwellerId));
            onMoveDweller?.(movingDwellerId, sourceRoomIdx !== -1 ? sourceRoomIdx : null, pickerTargetRoomIndex, kickedId, isSwap);
            setPickerTargetRoomIndex(null);
            setMovingDwellerId(null);
          }}
        />
      )}

      {/* Edit dweller modal */}
      {editingDwellerId !== null && (() => {
        const d = dwellers.find(d => d.serializeId === editingDwellerId);
        if (!d) return null;
        return (
          <DwellerEditDialog
            open={true}
            onClose={() => setEditingDwellerId(null)}
            dweller={d}
            onSave={(dwellerId, changes) => onUpdateDweller?.(dwellerId, changes)}
          />
        );
      })()}
    </div>
  );
}
