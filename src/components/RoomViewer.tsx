import { useMemo, useState } from 'react';
import roomsData from '@/data/rooms.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getItemLabel } from '@/lib/gameData';

interface Room {
  type: string;
  row: number;
  col: number;
  mergeLevel: number;
  level?: number;
  power?: boolean;
  broken?: boolean;
  class?: string;
  dwellers?: string[];
}

interface RoomViewerProps {
  rooms: Room[];
  dwellers: any[];
}

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

const getRoomWidth = (type: string, mergeLevel: number): number => {
  return type === 'Elevator' ? 1 : mergeLevel * 3;
};

// Build a map of room types to their proper names
const roomNameMap = new Map(roomsData.rooms.map(r => [r.type, r.name]));

const getRoomName = (type: string): string => {
  return roomNameMap.get(type) || type;
};

export function RoomViewer({ rooms, dwellers }: RoomViewerProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">VAULT LAYOUT</h2>
        <p className="text-sm text-muted-foreground">
          Total rooms: {rooms.length} | Grid: {maxRow + 1} rows × {maxCol + 1} columns
        </p>
      </div>

      <div className="border border-border rounded-lg bg-card/30 p-4 overflow-x-auto">
        <table className="border-collapse gap-0">
          <tbody>
            {Array.from({ length: maxRow + 1 }).map((_, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <td className="w-12 text-right pr-3 text-xs text-muted-foreground py-1">
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
                        className="border border-border bg-background/50 w-16 h-16"
                      />
                    );
                  }

                  const width = getRoomWidth(room.type, room.mergeLevel);

                  return (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      colSpan={width}
                      className={`border border-border p-1 h-16 min-w-max cursor-help transition-colors ${getRoomColor(
                        room
                      )}`}
                      title={`${getRoomName(room.type)} (Level ${room.level || 1})${room.dwellers ? ` - ${room.dwellers.length} dwellers` : ' - 0 dwellers'}${room.power === false ? ' - NO POWER' : ''}${room.broken ? ' - BROKEN' : ''}`}
                      onClick={() => handleRoomClick(room)}
                    >
                      {room.type === 'FakeWasteland' || room.type === 'Elevator' ? (
                        <div className="text-xs text-white font-semibold break-words">
                          {getRoomName(room.type)}
                        </div>
                      ) : (
                        <div className="flex justify-between items-start h-full">
                          <div className="flex-1">
                            <div className="text-xs text-white font-semibold break-words">
                              {getRoomName(room.type)}
                            </div>
                            {room.level && (
                              <div className="text-xs text-white/70">Lv {room.level}</div>
                            )}
                            {room.power === false && (
                              <div className="text-xs text-yellow-300 font-bold">⚠ NO POWER</div>
                            )}
                            {room.broken && (
                              <div className="text-xs text-red-300 font-bold">✗ BROKEN</div>
                            )}
                          </div>
                          <div className="text-xs text-white/90 font-bold ml-1">
                            👥 {room.dwellers ? room.dwellers.length : 0}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Column headers */}
        <div className="flex mt-2">
          <div className="w-12" />
          {Array.from({ length: maxCol + 1 }).map((_, i) => (
            <div key={`col-header-${i}`} className="w-16 text-center text-xs text-muted-foreground">
              {i}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6">
        <h3 className="font-display text-sm pip-text-glow mb-3">ROOM CLASSES & SPECIAL</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
      {selectedRoom && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">
                {getRoomName(selectedRoom.type)} (Level {selectedRoom.level})
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {getRoomDwellers(selectedRoom).length === 0 ? (
                <p className="text-sm text-muted-foreground">No dwellers in this room</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {getRoomDwellers(selectedRoom).map(dweller => {
                    const level = dweller.experience?.currentLevel || 1;
                    const maxHp = dweller.health?.maxHealth || 0;
                    const outfit = dweller.equipedOutfit?.id || '';
                    const weapon = dweller.equipedWeapon?.id || '';
                    const specialStats = dweller.stats?.stats || [];

                    return (
                      <div key={dweller.serializeId} className="border border-border rounded-lg p-4 bg-card/50">
                        <div className="grid grid-cols-[200px_100px_1fr_200px] gap-4 items-center">
                          <div className="flex-shrink-0">
                            <h4 className="font-semibold text-sm">{dweller.name} {dweller.lastName}</h4>
                            <p className="text-xs text-muted-foreground">Level {level}</p>
                          </div>

                          <div className="flex-shrink-0 text-center">
                            <span className="text-xs text-muted-foreground font-display block">HP MAX</span>
                            <p className="text-sm font-semibold">{Math.round(maxHp)}</p>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="grid grid-cols-7 gap-1">
                              {['S', 'P', 'E', 'C', 'I', 'A', 'L'].map((statName, index) => {
                                const statValue = specialStats[index + 1]?.value || 0;
                                return (
                                  <div key={statName} className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-display">{statName}</span>
                                    <div className="w-4 h-8 bg-muted rounded-sm overflow-hidden flex flex-col-reverse">
                                      {Array.from({ length: 10 }, (_, i) => (
                                        <div
                                          key={i}
                                          className={`flex-1 w-full ${i < statValue ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs font-semibold">{statValue}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex-shrink-0 space-y-1">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs text-muted-foreground font-display">OUTFIT</span>
                              <p className="text-xs font-semibold truncate max-w-[120px]" title={getItemLabel(outfit)}>
                                {getItemLabel(outfit) || 'None'}
                              </p>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs text-muted-foreground font-display">WEAPON</span>
                              <p className="text-xs font-semibold truncate max-w-[120px]" title={getItemLabel(weapon)}>
                                {getItemLabel(weapon) || 'None'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
