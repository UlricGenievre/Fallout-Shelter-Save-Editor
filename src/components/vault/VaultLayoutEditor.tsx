import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, X, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import roomsData from '@/data/rooms.json';

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
  deserializeID?: number;
}

interface VaultLayoutEditorProps {
  initialRooms: Room[];
  onSave: (newRooms: Room[]) => void;
  onCancel: () => void;
  vaultName: string;
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

const getRoomColor = (room: Room): string => {
  if (room.type === 'FakeWasteland') return 'bg-amber-700 border-amber-900';
  const roomClass = room.class || 'NoClass';
  return ROOM_CLASS_COLORS[roomClass] || 'bg-slate-600 border-slate-800';
};

const getRoomWidth = (type: string, mergeLevel: number): number => {
  return type === 'Elevator' ? 1 : mergeLevel * 3;
};

const roomNameMap = new Map(roomsData.rooms.map(r => [r.type, r.name]));

const getRoomName = (type: string): string => {
  return roomNameMap.get(type) || type;
};

export function VaultLayoutEditor({ initialRooms, onSave, onCancel, vaultName }: VaultLayoutEditorProps) {
  const [currentRooms, setCurrentRooms] = useState<Room[]>([]);
  const [unplacedRooms, setUnplacedRooms] = useState<Room[]>([]);
  const [isMagicMode, setIsMagicMode] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number, col: number } | null>(null);
  const [draggedRoomWidth, setDraggedRoomWidth] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);

  useEffect(() => {
    // Deep clone to avoid mutating props directly during edit
    setCurrentRooms(JSON.parse(JSON.stringify(initialRooms)));
    setUnplacedRooms([]);
  }, [initialRooms]);

  // Compute grid bounds
  const { maxRow, maxCol } = useMemo(() => {
    let maxR = 0;
    let maxC = 0;
    currentRooms.forEach((r) => {
      maxR = Math.max(maxR, r.row);
      maxC = Math.max(maxC, r.col + getRoomWidth(r.type, r.mergeLevel) - 1);
    });
    // Add some padding vertically to allow placing rooms deeper, but strictly cap columns to 25 (26 columns max)
    return { maxRow: Math.max(20, maxR + 3), maxCol: Math.max(25, maxC) };
  }, [currentRooms]);

  const grid = useMemo(() => {
    const map = new Map<string, Room>();
    currentRooms.forEach(room => {
      const width = getRoomWidth(room.type, room.mergeLevel);
      for (let c = room.col; c < room.col + width; c++) {
        map.set(`${room.row}-${c}`, room);
      }
    });
    return map;
  }, [currentRooms]);

  const handleRoomClick = (room: Room) => {
    if (room.type === 'FakeWasteland' || room.type === 'Entrance') return; // Cannot move these

    // Remove from current layout
    setCurrentRooms(prev => prev.filter(r => r !== room));

    if (room.type === 'Elevator') {
      // Elevators are deleted completely
      return;
    }

    // Add to unplaced rooms
    setUnplacedRooms(prev => [...prev, room]);
  };

  const handleUnplacedRoomClick = (index: number, room: Room) => {
    let placed = false;
    for (let r = 0; r <= maxRow; r++) {
      for (let c = 0; c <= maxCol; c++) {
        if (canPlaceRoom(room.type, room.mergeLevel, r, c)) {
          setCurrentRooms(prev => [...prev, { ...room, row: r, col: c }]);
          setUnplacedRooms(prev => prev.filter((_, i) => i !== index));
          toast.success(`Automatically placed at row ${r}, col ${c}`);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    
    if (!placed) {
      toast.error("No valid empty space found for this room in the layout bounds!");
    }
  };

  const canPlaceRoom = (roomType: string, roomMergeLevel: number, targetRow: number, targetCol: number, ignoringCoord?: string) => {
    const width = getRoomWidth(roomType, roomMergeLevel);

    // Check bounds
    if (targetCol < 0 || targetCol + width > maxCol + 1) return false;
    if (targetRow < 0) return false; // Usually Vault max top is row 0 or somewhat minus for Wasteland, but Wasteland isn't movable.

    // Check collisions
    for (let c = targetCol; c < targetCol + width; c++) {
      const existing = grid.get(`${targetRow}-${c}`);
      if (existing) {
        if (ignoringCoord && `${existing.row}-${existing.col}` === ignoringCoord) {
          continue;
        }
        return false;
      }
    }
    return true;
  };

  const handleDragStart = (e: React.DragEvent, type: string, index?: number, room?: Room) => {
    e.dataTransfer.effectAllowed = 'move';

    // Bundle all Drag Drop info into standard JSON MIME type for perfect browser retention
    const payload = {
      source: type,
      index: index,
      originCoord: room ? `${room.row}-${room.col}` : undefined
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', JSON.stringify(payload)); // Fallback

    let width = 1;
    let offset = 0;

    if (room) {
      width = getRoomWidth(room.type, room.mergeLevel);
      setDraggedRoomWidth(width);

      if (type === 'placed-room' || type === 'unplaced-room') {
        const targetEl = e.currentTarget as HTMLElement;
        const rect = targetEl.getBoundingClientRect();
        let clickX = e.clientX - rect.left;

        if (type === 'placed-room') {
          const cellWidth = rect.width / width;
          offset = Math.max(0, Math.min(Math.floor(clickX / cellWidth), width - 1)) || 0;
        } else {
          // Proportionnal offset for Unplaced Rooms side-panel thumbnails
          const ratio = clickX / rect.width;
          offset = Math.max(0, Math.min(Math.floor(ratio * width), width - 1)) || 0;
        }
      }
    } else if (type === 'new-elevator') {
      setDraggedRoomWidth(1);

      const targetEl = e.currentTarget as HTMLElement;
      const rect = targetEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      offset = Math.max(0, Math.min(Math.floor(ratio * 1), 0)) || 0;
    }

    setDragOffset(offset);
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    setHoveredCell(null);
    setDraggedRoomWidth(0);
    setDragOffset(0);

    if (isNaN(targetCol) || isNaN(targetRow)) {
      toast.error("Drop coords were NaN. Aborting.");
      return;
    }

    let payloadStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!payloadStr) {
      // Some strict environments wipe the dataTransfer mid-drag if dev tools are interacting
      toast.error("Format de glisser-déposer perdu par le navigateur.");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast.error("Failed to parse drag payload JSON.");
      return;
    }
    const { source, index, originCoord } = payload;

    if (source === 'new-elevator') {
      if (canPlaceRoom('Elevator', 1, targetRow, targetCol)) {
        // Find the maximum deserializeID currently in use
        const maxId = Math.max(0, ...currentRooms.map(r => r.deserializeID || 0));
        const newId = maxId + 1;

        const newElevator: any = {
          emergencyDone: false,
          type: 'Elevator',
          class: 'Utility',
          mergeLevel: 1,
          row: targetRow,
          col: targetCol,
          power: true,
          roomHealth: { damageValue: 0, initialValue: 0 },
          mrHandyList: [],
          rushTask: -1,
          level: 1,
          dwellers: [],
          deadDwellers: [],
          currentStateName: 'Idle',
          currentState: {},
          deserializeID: newId,
          assignedDecoration: '',
          roomVisibility: false,
          roomOutline: false,
          withHole: false
        };

        setCurrentRooms(prev => [...prev, newElevator]);
      } else {
        toast.error("An elevator cannot be placed here (cell occupied or out of bounds).");
      }
    } else if (source === 'unplaced-room') {
      if (index === undefined || index === null) {
        toast.error("Unplaced room index missing.");
        return;
      }
      const room = unplacedRooms[index];

      if (canPlaceRoom(room.type, room.mergeLevel, targetRow, targetCol)) {
        // Place room
        const placedRoom = { ...room, row: targetRow, col: targetCol };
        setCurrentRooms(prev => [...prev, placedRoom]);
        setUnplacedRooms(prev => prev.filter((_, i) => i !== index));
      } else {
        toast.error("This room cannot be placed here.");
      }
    } else if (source === 'placed-room') {
      if (!originCoord) {
        toast.error("Placed room origin missing.");
        return;
      }
      const [oRowStr, oColStr] = originCoord.split('-');
      const oRow = parseInt(oRowStr, 10);
      const oCol = parseInt(oColStr, 10);
      const room = currentRooms.find(r => r.row === oRow && r.col === oCol);

      if (room && canPlaceRoom(room.type, room.mergeLevel, targetRow, targetCol, originCoord)) {
        // If dropped on exactly identical location, do nothing
        if (targetRow === oRow && targetCol === oCol) {
          // Un-comment to see explicit no-op tracing: toast("Room didn't move.");
          return;
        }

        setCurrentRooms(prev => prev.map(r =>
          (r === room) ? { ...r, row: targetRow, col: targetCol } : r
        ));
      } else {
        toast.error("This room cannot be moved here.");
      }
    }
  };

  const validateLayout = () => {
    if (unplacedRooms.length > 0) {
      toast.error(`There are still ${unplacedRooms.length} unplaced rooms.`);
      return false;
    }

    // BFS Validation for Connectivity
    // Build adjacency list
    const adj = new Map<Room, Set<Room>>();
    currentRooms.forEach(r => adj.set(r, new Set()));

    for (let i = 0; i < currentRooms.length; i++) {
      for (let j = i + 1; j < currentRooms.length; j++) {
        const A = currentRooms[i];
        const B = currentRooms[j];

        let connected = false;
        // Rule 1: Horizontally connected
        if (A.row === B.row) {
          const wA = getRoomWidth(A.type, A.mergeLevel);
          const wB = getRoomWidth(B.type, B.mergeLevel);
          if (A.col + wA === B.col || B.col + wB === A.col) {
            connected = true;
          }
        }

        // Rule 2: Vertically connected via Elevators
        if (A.type === 'Elevator' && B.type === 'Elevator') {
          if (A.col === B.col && Math.abs(A.row - B.row) === 1) {
            connected = true;
          }
        }

        if (connected) {
          adj.get(A)?.add(B);
          adj.get(B)?.add(A);
        }
      }
    }

    // Find Entrance
    const entrance = currentRooms.find(r => r.type === 'Entrance');
    // Fast path: if there are no rooms except FakeWasteland we pass (though unlikely)
    const validRooms = currentRooms.filter(r => r.type !== 'FakeWasteland');
    if (validRooms.length > 0 && !entrance) {
      toast.error("Vault Door (Entrance) is missing!");
      return false;
    }

    if (entrance) {
      const visited = new Set<Room>();
      const queue: Room[] = [entrance];
      visited.add(entrance);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr);
        if (neighbors) {
          neighbors.forEach(n => {
            if (!visited.has(n)) {
              visited.add(n);
              queue.push(n);
            }
          });
        }
      }

      const unreached = validRooms.filter(r => !visited.has(r));
      if (unreached.length > 0) {
        toast.error(`Layout disconnected! ${unreached.length} room(s) cannot be reached from the Vault Door via elevators or adjacent rooms.`);
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    if (validateLayout()) {
      onSave(currentRooms);
    }
  };

  return (
    <div className="flex h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Main Grid Area (75%) */}
      <div className="w-3/4 flex flex-col h-full border-r border-border/50">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/20 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-xl pip-text-glow tracking-widest uppercase flex items-center gap-2">
              <span>Edit Vault Layout</span>
            </h2>
            <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-full border border-border shadow-sm">
              <Sparkles className={`w-3.5 h-3.5 ${isMagicMode ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <Switch
                id="edit-magic-mode"
                checked={isMagicMode}
                onCheckedChange={setIsMagicMode}
                className="scale-75 origin-left"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-black/40 p-4 sm:p-6">
          <div
            className="mx-auto w-full min-w-[500px] flex flex-col border border-border/50 rounded-lg bg-card/10 p-2 sm:p-4"
            style={{ maxWidth: `calc(3rem + ${(maxCol + 1) * 4}rem)` }}
          >
            <table className="w-full table-fixed border-collapse gap-0 bg-black/20" style={{ borderSpacing: 0 }}>
              <colgroup>
                <col className="w-8 sm:w-12 shrink-0" />
                {Array.from({ length: maxCol + 1 }).map((_, i) => (
                  <col key={`col-width-${i}`} />
                ))}
              </colgroup>
              <tbody>
                {Array.from({ length: maxRow + 1 }).map((_, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    <td className="text-right pr-2 sm:pr-3 text-[10px] sm:text-xs text-muted-foreground py-1 bg-background/50 border-r border-border/30 sticky left-0 z-10 truncate">
                      {rowIndex}
                    </td>
                    {Array.from({ length: maxCol + 1 }).map((_, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const room = grid.get(key);

                      // Skip spanning cells
                      if (room && colIndex > 0 && grid.get(`${rowIndex}-${colIndex - 1}`) === room) {
                        return null;
                      }

                      // Check if this empty cell falls into the area of the dragged room
                      const isHoveredEmpty = hoveredCell?.row === rowIndex &&
                        colIndex >= hoveredCell.col &&
                        colIndex < hoveredCell.col + draggedRoomWidth;

                      if (!room) {
                        return (
                          <td
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={`border border-border h-10 sm:h-14 transition-colors ${isHoveredEmpty ? 'bg-primary/30 ring-inset ring-2 ring-primary relative z-10' : 'bg-background/50'}`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              const targetStartCol = colIndex - dragOffset;
                              if (hoveredCell?.row !== rowIndex || hoveredCell?.col !== targetStartCol) {
                                setHoveredCell({ row: rowIndex, col: targetStartCol });
                              }
                            }}
                            onDragLeave={() => setHoveredCell(null)}
                            onDrop={(e) => handleDrop(e, rowIndex, colIndex - dragOffset)}
                          />
                        );
                      }

                      const width = getRoomWidth(room.type, room.mergeLevel);
                      const isLocked = room.type === 'FakeWasteland' || room.type === 'Entrance';

                      // Check if this occupied cell structurally overlaps with the intended placement area
                      const isHoveredOccupied = hoveredCell?.row === rowIndex &&
                        Math.max(colIndex, hoveredCell.col) < Math.min(colIndex + width, hoveredCell.col + draggedRoomWidth);

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
                          className={`border border-border p-1 md:p-1.5 transition-all overflow-hidden relative group 
                                                    ${isLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:ring-inset hover:ring-2 hover:ring-red-500/50'} 
                                                    ${isMagicMode ? 'bg-background/80 p-0' : `${getRoomColor(room)} h-10 sm:h-14`}
                                                    ${isHoveredOccupied ? 'brightness-125 z-10 shadow-xl ring-inset ring-2 ring-primary/50' : ''}
                                                `}
                          style={{
                            backgroundImage: fullImageUrl ? `url("${fullImageUrl}")` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }}
                          title={isLocked ? "Cannot be moved" : "Drag to move or Click to remove"}
                          onClick={() => handleRoomClick(room)}
                          draggable={!isLocked}
                          onDragStart={(e) => {
                            if (isLocked) { e.preventDefault(); return; }
                            handleDragStart(e, 'placed-room', undefined, room);
                            e.dataTransfer.setData('originCoord', `${room.row}-${room.col}`);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const hoverX = e.clientX - rect.left;
                            const cellWidth = rect.width / width;
                            const subCol = Math.max(0, Math.min(Math.floor(hoverX / cellWidth), width - 1));
                            const exactHoveredCol = colIndex + subCol;

                            const targetStartCol = exactHoveredCol - dragOffset;

                            if (hoveredCell?.row !== rowIndex || hoveredCell?.col !== targetStartCol) {
                              setHoveredCell({ row: rowIndex, col: targetStartCol });
                            }
                          }}
                          onDragLeave={() => setHoveredCell(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const dropX = e.clientX - rect.left;
                            const cellWidth = rect.width / width;
                            const subCol = Math.max(0, Math.min(Math.floor(dropX / cellWidth), width - 1));
                            const exactDropCol = colIndex + subCol;

                            handleDrop(e, rowIndex, exactDropCol - dragOffset);
                          }}
                        >
                          <div className="flex flex-col h-full w-full justify-start relative z-10"
                            style={{ aspectRatio: isMagicMode ? aspectRatio : undefined, minHeight: isMagicMode ? 'unset' : undefined }}
                          >
                            <div className={`p-1 flex flex-col justify-between items-start transition-all h-full ${isMagicMode ? 'bg-black/60 opacity-0 hover:opacity-100' : ''}`}>
                              <div className="text-[9px] md:text-[10px] font-bold text-white leading-tight truncate w-full">
                                {getRoomName(room.type)}
                              </div>
                              {room.type === 'Elevator' && !isLocked && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 backdrop-blur-sm z-20">
                                  <X className="w-6 h-6 text-white" />
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
          </div>
        </div>
      </div>

      {/* Sidebar Area (25%) */}
      <div className="w-1/4 h-full bg-card/40 flex flex-col items-center p-4 overflow-y-auto">
        <h3 className="font-display text-lg pip-text-glow mb-4 uppercase text-center w-full pb-2 border-b border-border/50">Unplaced Rooms</h3>

        <div className="w-full mb-6 p-4 border-2 border-dashed border-primary/50 bg-primary/10 rounded-lg flex items-center justify-start gap-4">
          {(() => {
              const roomInfo = roomsData.rooms.find(r => r.type === 'Elevator') as any;
              const imageUrl = roomInfo?.images?.["1"]?.["1"];
              const baseUrl = import.meta.env.BASE_URL || '/';
              const fullImageUrl = imageUrl ? (baseUrl + imageUrl).replace(/\/+/g, '/') : undefined;
              
              return (
                  <div
                    className={`shrink-0 w-8 sm:w-12 border border-border overflow-hidden relative cursor-grab shadow-md transition-all outline outline-2 outline-offset-2 outline-primary/30 hover:outline-primary active:cursor-grabbing hover:-translate-y-0.5
                       ${isMagicMode ? 'bg-background/80 p-0' : `${getRoomColor({ class: 'Utility' } as Room)} h-10 sm:h-14`}
                    `}
                    style={{
                        backgroundImage: isMagicMode && fullImageUrl ? `url("${fullImageUrl}")` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'new-elevator')}
                    title="Drag new elevator to Vault grid"
                  >
                      <div className="flex flex-col h-full w-full justify-start relative z-10"
                           style={{ aspectRatio: isMagicMode ? '1/2' : undefined, minHeight: isMagicMode ? 'unset' : undefined }}
                      >
                          <div className={`p-1 flex flex-col justify-between items-start transition-all h-full ${isMagicMode ? 'bg-black/60 opacity-0 hover:opacity-100' : ''}`}>
                              <div className="text-[9px] md:text-[10px] font-bold text-white leading-tight truncate w-full">
                                  Elevator
                              </div>
                          </div>
                      </div>
                  </div>
              );
          })()}
          
          <div className="flex flex-col flex-1 pl-2 border-l border-primary/30">
            <span className="text-sm font-bold text-primary flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> Add Elevator
            </span>
            <span className="text-xs text-muted-foreground font-medium">Free • Size 1</span>
          </div>
        </div>

        {unplacedRooms.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center flex flex-col items-center gap-2 mt-10">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <p>All required rooms are placed.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {unplacedRooms.map((room, index) => {
              const roomInfo = roomsData.rooms.find(r => r.type === room.type) as any;
              const imagesForLevel = roomInfo?.images?.[(room.level || 1).toString()];
              const imageUrl = isMagicMode && (imagesForLevel?.[(room.mergeLevel || 1).toString()] || imagesForLevel?.["1"]);
              const baseUrl = import.meta.env.BASE_URL || '/';
              const fullImageUrl = imageUrl ? (baseUrl + imageUrl).replace(/\/+/g, '/') : undefined;

              const widthClass = room.mergeLevel >= 3 ? 'w-full' : room.mergeLevel === 2 ? 'w-2/3' : 'w-1/3';

              return (
                <div
                  key={`${room.type}-${index}`}
                  className={`${widthClass} relative rounded flex items-center p-2 cursor-grab shadow-md border ${getRoomColor(room)} hover:brightness-110 active:cursor-grabbing hover:-translate-y-0.5 transition-all`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'unplaced-room', index, room)}
                  onClick={() => handleUnplacedRoomClick(index, room)}
                  title="Click to autoplace or Drag to Vault grid"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-xs text-white font-bold truncate drop-shadow-md">
                      {getRoomName(room.type)}
                    </div>
                    <div className="text-[10px] text-white/80 font-medium">Lv {room.level || 1} • Size {room.mergeLevel}</div>
                  </div>
                  {fullImageUrl && isMagicMode && (
                    <div className="w-12 h-10 shrink-0 bg-black/40 rounded flex items-center justify-center overflow-hidden">
                      <img src={fullImageUrl} className="max-w-full max-h-full object-contain" alt="" draggable={false} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
