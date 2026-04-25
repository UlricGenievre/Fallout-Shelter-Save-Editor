import { useMemo, useState, useEffect } from 'react';
import roomsData from '@/data/rooms.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DwellerCard } from '../shared/DwellerCard';
import { WeaponPickerDialog } from '../shared/WeaponPickerDialog';
import { OutfitPickerDialog } from '../shared/OutfitPickerDialog';
import { RoomPickerDialog } from '../shared/RoomPickerDialog';
import { RoomConflictDialog } from '../shared/RoomConflictDialog';
import { DwellerEditDialog } from '../shared/DwellerEditDialog';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Sparkles, Users, Search, Home } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Room {
  type: string;
  row: number;
  col: number;
  mergeLevel: number;
  level?: number;
  power?: boolean;
  broken?: boolean;
  class?: string;
  dwellers?: number[];
}

interface RoomViewerProps {
  rooms: Room[];
  dwellers: any[];
  inventory?: any[];
  onEquipWeapon?: (targetDwellerId: number, newWeaponId: string, sourceDwellerId?: number) => void;
  onEquipOutfit?: (targetDwellerId: number, newOutfitId: string, sourceDwellerId?: number) => void;
  onMoveDweller?: (dwellerId: number, sourceRoomIndex: number | null, targetRoomIndex: number | null, bumpedDwellerId?: number, isSwap?: boolean) => void;
  onUpdateDweller?: (dwellerId: number, changes: any) => void;
  vaultName?: string;
  onUpdateVaultName?: (newName: string) => void;
  onUpdateRooms?: (newRooms: Room[]) => void;
  movingDwellerId: number | null;
  onSetMovingDwellerId: (id: number | null) => void;
  onSelectRoom: (targetIdx: number | null) => void;
  onOpenRoomPicker: () => void;
}

import { VaultLayoutEditor } from './VaultLayoutEditor';

const ROOM_CLASS_COLORS: Record<string, string> = {
  'Training': 'bg-purple-500 hover:bg-purple-600',
  'Production': 'bg-blue-500 hover:bg-blue-600',
  'Facility': 'bg-green-500 hover:bg-green-600',
  'Utility': 'bg-orange-500 hover:bg-orange-600',
  'Consumable': 'bg-red-500 hover:bg-red-600',
  'Crafting': 'bg-yellow-500 hover:bg-yellow-600',
  'Quest': 'bg-pink-500 hover:bg-pink-600',
};

// Special color for Wasteland rooms (FakeWasteland type)
const getRoomColor = (room: Room): string => {
  // Special color for Wasteland
  if (room.type === 'FakeWasteland') {
    return 'bg-amber-700 hover:bg-amber-800';
  }

  // Color based on class only
  const roomClass = room.class || 'NoClass';
  return ROOM_CLASS_COLORS[roomClass] || 'bg-slate-600 hover:bg-slate-700';
};

const getRoomOverlayColor = (room: Room): string => {
  if (room.type === 'FakeWasteland') return 'bg-amber-900/60';

  const colors: Record<string, string> = {
    'Training': 'bg-purple-900/60',
    'Production': 'bg-blue-900/60',
    'Facility': 'bg-green-900/60',
    'Utility': 'bg-orange-900/60',
    'Consumable': 'bg-red-900/60',
    'Crafting': 'bg-yellow-900/60',
    'Quest': 'bg-pink-900/60',
  };

  return colors[room.class || 'NoClass'] || 'bg-slate-900/60';
};

const getRoomWidth = (type: string, mergeLevel: number): number => {
  return type === 'Elevator' ? 1 : mergeLevel * 3;
};

// Build a map of room types to their proper names
const roomNameMap = new Map(roomsData.rooms.map(r => [r.type, r.name]));

const getRoomName = (type: string): string => {
  return roomNameMap.get(type) || type;
};

export function RoomViewer({ 
  rooms, 
  dwellers, 
  inventory, 
  onEquipWeapon, 
  onEquipOutfit, 
  onMoveDweller, 
  onUpdateDweller, 
  vaultName = '000', 
  onUpdateVaultName,
  onUpdateRooms,
  movingDwellerId,
  onSetMovingDwellerId,
  onSelectRoom,
  onOpenRoomPicker
}: RoomViewerProps) {
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingVaultName, setEditingVaultName] = useState(false);
  const [localVaultName, setLocalVaultName] = useState(vaultName ?? '000');

  // Sync internal state if prop changes (e.g. from another save file)
  useEffect(() => {
    setLocalVaultName(vaultName ?? '000');
  }, [vaultName]);

  const activeRoom = useMemo(() => {
    if (!selectedRoom) return null;
    return rooms.find(r => r.row === selectedRoom.row && r.col === selectedRoom.col) || null;
  }, [rooms, selectedRoom]);

  const [weaponPickerDwellerId, setWeaponPickerDwellerId] = useState<number | null>(null);
  const [outfitPickerDwellerId, setOutfitPickerDwellerId] = useState<number | null>(null);
  const [editingDwellerId, setEditingDwellerId] = useState<number | null>(null);
  const roomInfoMap = new Map((roomsData.rooms as any[]).map(r => [r.type, r]));

  const dwellerRooms = useMemo(() => {
    const map = new Map<number, { name: string; special: string; category: string }>();
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

  const { maxRow, maxCol, grid } = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return { maxRow: 0, maxCol: 0, grid: new Map<string, Room>() };
    }

    let maxRow = 0;
    let maxCol = 0;
    const grid = new Map<string, Room>();

    rooms.forEach((room) => {
      const width = getRoomWidth(room.type, room.mergeLevel);
      const endRow = room.row;
      const endCol = room.col + width - 1;

      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);

      // Mark all grid positions occupied by this room
      for (let c = room.col; c <= endCol; c++) {
        const key = `${room.row}-${c}`;
        grid.set(key, room);
      }
    });

    return { maxRow, maxCol, grid };
  }, [rooms]);

  const getRoomDwellers = (room: Room) => {
    if (!room.dwellers || !dwellers) return [];
    return room.dwellers.map(serializeId =>
      dwellers.find(d => d.serializeId === serializeId)
    ).filter(Boolean);
  };

  const handleRoomClick = (room: Room) => {
    if (movingDwellerId !== null) {
      const roomIdx = rooms.findIndex(r => r === room || (r.row === room.row && r.col === room.col));
      if (roomIdx !== -1) {
        onSelectRoom(roomIdx);
      }
      return;
    }
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-center">
        <p className="text-muted-foreground">No rooms found in this vault</p>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <VaultLayoutEditor
        initialRooms={rooms}
        onSave={(newRooms) => {
          onUpdateRooms?.(newRooms);
          setIsEditMode(false);
        }}
        onCancel={() => setIsEditMode(false)}
        vaultName={vaultName}
      />
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      {movingDwellerId !== null && (() => {
        const dweller = dwellers.find(d => d.serializeId === movingDwellerId);
        return (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between animate-in slide-in-from-top duration-300 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <ArrowRightLeft className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wider">MOVING DWELLER</p>
                <p className="text-xs text-muted-foreground">Select a destination for <span className="text-primary font-bold">{dweller?.name} {dweller?.lastName}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 border-primary/50 text-xs gap-1.5" onClick={() => onOpenRoomPicker()}>
                <Search className="w-3.5 h-3.5" /> Search
              </Button>
              <Button variant="outline" size="sm" className="h-8 border-primary/50 text-xs gap-1.5" onClick={() => onSelectRoom(null)}>
                <Home className="w-3.5 h-3.5" /> Coffee Break
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => onSetMovingDwellerId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        );
      })()}
      <div className="mb-6 relative flex items-center justify-center min-h-[40px]">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest uppercase text-center flex items-center gap-3">
          <span>Vault</span>
          {editingVaultName ? (
            <input
              autoFocus
              className="bg-black/40 border-b-2 border-primary text-primary outline-none w-[4.5rem] text-center font-display text-2xl animate-in fade-in zoom-in-95 duration-200"
              value={localVaultName}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                setLocalVaultName(val);
              }}
              onBlur={() => {
                setEditingVaultName(false);
                if (localVaultName.length === 3) {
                  onUpdateVaultName?.(localVaultName);
                } else {
                  setLocalVaultName(vaultName ?? '000');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                } else if (e.key === 'Escape') {
                  setLocalVaultName(vaultName ?? '000');
                  setEditingVaultName(false);
                }
              }}
            />
          ) : (
            <span
              className="cursor-pointer hover:text-primary transition-all duration-300 border-b-2 border-primary/50 hover:border-primary px-1 mt-0.5"
              onClick={() => setEditingVaultName(true)}
              title="Click to edit Vault number"
            >
              {vaultName}
            </span>
          )}
          <span>
            ({rooms.length} rooms)
          </span>
        </h2>
        <div className="absolute right-0 flex items-center gap-3">
          <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border shadow-sm">
            <span className="text-sm font-display text-muted-foreground">EDIT MODE</span>
            <Switch
              id="layout-edit-mode"
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
              disabled={movingDwellerId !== null}
            />
          </div>
          <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-full border border-border shadow-sm">
            <Sparkles className={`w-4 h-4 ${isMagicMode ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            <Switch
              id="magic-mode"
              checked={isMagicMode}
              onCheckedChange={setIsMagicMode}
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card/30 p-4 overflow-x-auto">
        <div
          className="mx-auto w-full min-w-[600px] flex flex-col"
          style={{ maxWidth: `calc(3rem + ${(maxCol + 1) * 4}rem)` }}
        >
          <table className="w-full table-fixed border-collapse gap-0">
            <colgroup>
              <col className="w-8 sm:w-12 shrink-0" />
              {Array.from({ length: maxCol + 1 }).map((_, i) => (
                <col key={`col-width-${i}`} />
              ))}
            </colgroup>
            <tbody>
              {Array.from({ length: maxRow + 2 }).map((_, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  <td className="text-right pr-2 sm:pr-3 text-[10px] sm:text-xs text-muted-foreground py-1 truncate">
                    {rowIndex}
                  </td>
                  {Array.from({ length: maxCol + 1 }).map((_, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    const room = grid.get(key);

                    // Skip cells that are part of a larger room already rendered
                    if (
                      room &&
                      colIndex > 0 &&
                      grid.get(`${rowIndex}-${colIndex - 1}`) === room
                    ) {
                      return null;
                    }

                    if (!room) {
                      return (
                        <td
                          key={`cell-${rowIndex}-${colIndex}`}
                          className="border border-border bg-background/50 h-12 sm:h-16 empty-cell"
                        />
                      );
                    }

                    const width = getRoomWidth(room.type, room.mergeLevel);

                    const roomInfo = roomsData.rooms.find(r => r.type === room.type) as any;
                    const imagesForLevel = roomInfo?.images?.[(room.level || 1).toString()];
                    const imageUrl = isMagicMode && (imagesForLevel?.[(room.mergeLevel || 1).toString()] || imagesForLevel?.["1"]) ||
                      (isMagicMode && room.type === 'Elevator' && roomInfo?.images?.["1"]?.["1"]);

                    const baseUrl = import.meta.env.BASE_URL || '/';
                    const fullImageUrl = imageUrl ? (baseUrl + imageUrl).replace(/\/+/g, '/') : undefined;

                    const aspectRatio = room.type === 'Elevator' ? '1/2' : `${(room.mergeLevel || 1) * 3}/2`;

                    return (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        colSpan={width}
                        className={`border border-border p-1 md:p-1.5 cursor-help transition-all duration-500 overflow-hidden relative group ${isMagicMode
                          ? getRoomColor(room).split(' ').filter(c => c.startsWith('hover:')).join(' ') + ' bg-transparent p-0 shadow-inner'
                          : getRoomColor(room) + ' h-12 sm:h-16'
                          }`}
                        style={{
                          backgroundImage: fullImageUrl ? `url("${fullImageUrl}")` : undefined,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                        title={`${getRoomName(room.type)} (Level ${room.level || 1})${room.dwellers ? ` - ${room.dwellers.length} dwellers` : ' - 0 dwellers'}${room.power === false ? ' - NO POWER' : ''}${room.broken ? ' - BROKEN' : ''}`}
                        onClick={() => handleRoomClick(room)}
                      >
                        <div
                          className={`flex flex-col h-full w-full transition-all duration-500 justify-start`}
                          style={{
                            aspectRatio: isMagicMode ? aspectRatio : undefined,
                            minHeight: isMagicMode ? 'unset' : undefined
                          }}
                        >
                          <div className={`p-1.5 flex justify-between items-start transition-all duration-500 ${isMagicMode ? `${getRoomOverlayColor(room)} backdrop-blur-md rounded-b-sm border-b border-white/10 opacity-0 group-hover:opacity-100` : 'h-full'}`}>
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="text-[10px] sm:text-xs text-white font-bold truncate drop-shadow-md">
                                {getRoomName(room.type)}{roomInfoMap.get(room.type)?.special ? ` (${roomInfoMap.get(room.type)?.special})` : ''}
                              </div>
                              {room.type !== 'FakeWasteland' && room.type !== 'Elevator' && (
                                <div className="flex items-center gap-2">
                                  {room.level && (
                                    <div className="text-[9px] sm:text-[10px] text-white/90 truncate font-semibold">Lv {room.level}</div>
                                  )}
                                </div>
                              )}
                              {room.power === false && (
                                <div className="text-[9px] sm:text-[10px] text-yellow-300 font-bold truncate animate-pulse bg-black/40 px-1 rounded inline-block mt-0.5">⚠ POWER</div>
                              )}
                              {room.broken && (
                                <div className="text-[9px] sm:text-[10px] text-red-300 font-bold truncate animate-pulse bg-black/40 px-1 rounded inline-block mt-0.5">✗ BROKEN</div>
                              )}
                            </div>
                            {room.type !== 'FakeWasteland' && room.type !== 'Elevator' && (
                              <div className="text-[10px] sm:text-xs text-white/90 font-bold shrink-0 flex items-center gap-1 drop-shadow-md">
                                <Users className="w-3 h-3" /> {room.dwellers ? room.dwellers.length : 0}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Column headers */}
          <div className="flex mt-2 w-full">
            <div className="w-8 sm:w-12 shrink-0" />
            {Array.from({ length: maxCol + 1 }).map((_, i) => (
              <div key={`col-header-${i}`} className="flex-1 text-center text-[10px] sm:text-xs text-muted-foreground">
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-col items-center">
        <h3 className="font-display text-sm pip-text-glow mb-3 text-center">ROOM CLASSES & SPECIAL</h3>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-4xl">
          {/* Special room type */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-amber-700" />
            <span className="text-muted-foreground">Wasteland</span>
          </div>

          {/* All room classes */}
          {Object.entries(ROOM_CLASS_COLORS).map(([className, colorClass]) => (
            <div key={className} className="flex items-center gap-2 text-sm">
              <div className={`w-4 h-4 rounded ${colorClass}`} />
              <span className="text-muted-foreground">{className}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded bg-slate-600" />
            <span className="text-muted-foreground">No Class</span>
          </div>
        </div>
      </div>

      {/* Room Details Modal */}
      {activeRoom && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">
                {getRoomName(activeRoom.type)} (Level {activeRoom.level})
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {getRoomDwellers(activeRoom).length === 0 ? (
                <p className="text-sm text-muted-foreground">No dwellers in this room</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {getRoomDwellers(activeRoom).map(dweller => {
                    const roomName = getRoomName(activeRoom.type);
                    const roomData: any = roomsData.rooms.find(r => r.type === activeRoom.type);
                    const roomSpecial = roomData?.special;
                    return (
                      <DwellerCard
                        key={dweller.serializeId}
                        dweller={dweller}
                        roomName={roomName}
                        roomSpecial={roomSpecial}
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
                                setIsModalOpen(false); // Close details modal when starting move
                                onSetMovingDwellerId(dweller.serializeId);
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
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {weaponPickerDwellerId !== null && (() => {
        const pickerDweller = dwellers.find(d => d.serializeId === weaponPickerDwellerId);
        if (!pickerDweller) return null;
        return (
          <WeaponPickerDialog
            open
            onClose={() => setWeaponPickerDwellerId(null)}
            dweller={pickerDweller}
            allDwellers={dwellers}
            inventory={inventory || []}
            dwellerRooms={dwellerRooms}
            onEquip={(newWeaponId, sourceDwellerId) =>
              onEquipWeapon?.(weaponPickerDwellerId, newWeaponId, sourceDwellerId)
            }
          />
        );
      })()}

      {outfitPickerDwellerId !== null && (() => {
        const pickerDweller = dwellers.find(d => d.serializeId === outfitPickerDwellerId);
        if (!pickerDweller) return null;
        return (
          <OutfitPickerDialog
            open
            onClose={() => setOutfitPickerDwellerId(null)}
            dweller={pickerDweller}
            allDwellers={dwellers}
            inventory={inventory || []}
            dwellerRooms={dwellerRooms}
            onEquip={(newOutfitId, sourceDwellerId) =>
              onEquipOutfit?.(outfitPickerDwellerId, newOutfitId, sourceDwellerId)
            }
          />
        );
      })()}


      {/* Edit Dweller Dialog */}
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
