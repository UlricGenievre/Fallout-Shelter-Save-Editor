import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import roomsData from '@/data/rooms.json';
import { ArrowUpDown, ArrowUp, ArrowDown, Users, CopyPlus } from 'lucide-react';

interface RoomPickerDialogProps {
  open: boolean;
  onClose: () => void;
  dwellerId: number;
  dwellers: any[];
  rooms: any[]; // The raw rooms array from save
  onSelectRoom: (roomIndex: number | null) => void;
}

type SortField = 'name' | 'capacity' | 'special';
type SortDirection = 'asc' | 'desc';

export function RoomPickerDialog({
  open,
  onClose,
  dwellerId,
  dwellers,
  rooms,
  onSelectRoom,
}: RoomPickerDialogProps) {
  // Find dweller best special for default filtering
  const defaultFilter = useMemo(() => {
    const dweller = dwellers.find(d => d.serializeId === dwellerId);
    let bestStat = 'S';
    let maxVal = -1;
    if (dweller?.stats?.stats) {
      const specials = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];
      for (let i = 1; i <= 7; i++) {
        const val = dweller.stats.stats[i]?.value || 0;
        if (val > maxVal) {
          maxVal = val;
          bestStat = specials[i - 1];
        }
      }
    }
    return bestStat;
  }, [dwellerId, dwellers]);

  const [filterSpecial, setFilterSpecial] = useState<string>(defaultFilter);
  const [filterTraining, setFilterTraining] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ field: 'name', direction: 'asc' });

  const getRoomCapacity = (room: any) => {
    if (room.type === 'Entrance') return 2;
    if (room.type === 'FakeWasteland') return 999;
    return (room.mergeLevel || 1) * 2;
  };

  const roomNameMap = new Map(roomsData.rooms.map(r => [r.type, r.name]));
  const roomSpecialMap = new Map(roomsData.rooms.map(r => [r.type, (r as any).special || '']));
  const roomCategoryMap = new Map(roomsData.rooms.map(r => [r.type, (r as any).category || '']));

  const getRoomName = (type: string): string => {
    return roomNameMap.get(type) || type;
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const dweller = dwellers.find(d => d.serializeId === dwellerId);

  // We filter out FakeWasteland and map with index
  const availableRooms = useMemo(() => {
    let mapped = rooms
      .map((r, idx) => ({ ...r, originalIndex: idx }))
      .filter(r => r.type !== 'FakeWasteland' && r.type !== 'Elevator' && r.type !== 'Overseer');

    // Show only Training rooms if active, otherwise hide all Training rooms
    if (filterTraining) {
      mapped = mapped.filter(r => roomCategoryMap.get(r.type) === 'Training');
    } else {
      mapped = mapped.filter(r => roomCategoryMap.get(r.type) !== 'Training');
    }

    // Filter by SPECIAL if active
    if (filterSpecial) {
      mapped = mapped.filter(r => (roomSpecialMap.get(r.type) || '') === filterSpecial);
    }

    // Sort
    mapped.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case 'name':
          comparison = getRoomName(a.type).localeCompare(getRoomName(b.type));
          break;
        case 'capacity':
          const aFill = (a.dwellers?.length || 0) / getRoomCapacity(a);
          const bFill = (b.dwellers?.length || 0) / getRoomCapacity(b);
          comparison = aFill - bFill;
          break;
        case 'special':
          // Sort by whether the room special matches the dweller's strongest stat, etc
          // Or just sort by the room's special letter to group them
          const aSpec = roomSpecialMap.get(a.type) || '';
          const bSpec = roomSpecialMap.get(b.type) || '';
          comparison = aSpec.localeCompare(bSpec);
          break;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return mapped;
  }, [rooms, sortConfig, filterSpecial, filterTraining]);

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

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="font-display text-xl pip-text-glow tracking-widest text-primary flex items-center justify-between">
            <span>SELECT DESTINATION</span>
            {dweller && (
              <div className="flex flex-col items-end gap-1 mt-1 sm:mt-0">
                <span className="text-sm text-muted-foreground opacity-80 font-sans tracking-normal">
                  Moving: <strong className="text-foreground">{dweller.name} {dweller.lastName}</strong>
                </span>
                <div className="flex gap-2 text-xs font-display tracking-widest text-primary/70">
                  {['S', 'P', 'E', 'C', 'I', 'A', 'L'].map((char, index) => (
                    <span key={char} className="flex gap-0.5">
                      <span className="opacity-70">{char}</span>
                      <span>{dweller.stats?.stats?.[index + 1]?.value || 0}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-2">
          {/* Coffee Break Option */}
          <div
            onClick={() => {
              onSelectRoom(null);
            }}
            className="mb-4 border border-border/60 rounded-lg p-3 bg-secondary/20 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:shadow-md cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <CopyPlus className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-display font-medium text-foreground tracking-wide text-sm">
                  Coffee Break
                </p>
                <p className="text-xs text-muted-foreground">Unassign from any room (Wandering)</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Unlimited Capacity</div>
          </div>

          <div className="flex flex-col">
            <div className="hidden sm:grid grid-cols-[3fr_2fr_1fr] gap-4 px-4 py-3 -mt-3 mb-3 border-b border-border/40 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex justify-start border-x border-transparent gap-[1px]">
                <div className="flex gap-6">
                  <SortButton field="name" label="Room" />
                </div>
                <div
                  onClick={() => setFilterTraining(!filterTraining)}
                  className="flex flex-col items-center justify-center select-none group px-1 sm:px-2 py-0.5 rounded cursor-pointer hover:bg-muted/30"
                  title="Filter Training rooms only"
                >
                  <span
                    className={`flex justify-center items-center font-display text-[11px] sm:text-xs h-4 sm:h-5 px-1.5 sm:px-2 rounded transition-all duration-200 ${filterTraining
                      ? 'text-primary bg-primary/10 border border-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.3)]'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    TRAINING
                  </span>
                </div>
              </div>
              <div className="flex justify-center border-x border-transparent gap-[1px]">
                {['S', 'P', 'E', 'C', 'I', 'A', 'L'].map((letter) => {
                  const isActive = filterSpecial === letter;
                  return (
                    <div
                      key={letter}
                      onClick={() => setFilterSpecial(isActive ? '' : letter)}
                      className="flex flex-col items-center justify-center select-none group px-0.5 sm:px-1 py-0.5 rounded cursor-pointer hover:bg-muted/30"
                      title={`Filter by ${letter}`}
                    >
                      <span
                        className={`flex justify-center items-center font-display text-[11px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded transition-all duration-200 ${isActive
                          ? 'text-primary bg-primary/10 border border-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.3)]'
                          : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {letter}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end border-r border-transparent pr-4">
                <SortButton field="capacity" label="Capacity" align="right" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableRooms.map((room) => {
                const capacity = getRoomCapacity(room);
                const assigned = room.dwellers?.length || 0;
                const isFull = assigned >= capacity;
                const special = roomSpecialMap.get(room.type);
                const category = roomCategoryMap.get(room.type);
                const roomName = getRoomName(room.type);
                // The dweller might already be in this room?
                const isCurrentRoom = room.dwellers?.includes(dwellerId);

                return (
                  <div
                    key={room.originalIndex}
                    onClick={() => {
                      if (!isCurrentRoom) {
                        onSelectRoom(room.originalIndex);
                      }
                    }}
                    className={`border border-border/60 rounded-lg p-3 bg-card/40 transition-all duration-300 relative overflow-hidden ${isCurrentRoom
                      ? 'opacity-50 cursor-not-allowed grayscale'
                      : 'hover:bg-primary/5 hover:border-primary/50 hover:shadow-md cursor-pointer'
                      }`}
                  >
                    <div className="grid grid-cols-[3fr_2fr_1fr] gap-4 items-center">
                      <div className="flex flex-col min-w-0">
                        <p className="text-[14px] font-bold truncate text-foreground flex items-center gap-2">
                          {roomName}
                          {category && (
                            <span className="text-[10px] bg-background border border-border/50 px-1.5 py-0.5 rounded text-white/60 tracking-wider font-display uppercase whitespace-nowrap hidden sm:inline-block">
                              {category}
                            </span>
                          )}
                          {isCurrentRoom && (
                            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase whitespace-nowrap">Current</span>
                          )}
                        </p>
                        <span className="text-xs text-white/50 truncate">
                          Level {room.level || 1} • Col {room.col} Row {room.row}
                          {category && <span className="sm:hidden"> • {category}</span>}
                        </span>
                      </div>

                      <div className="flex justify-center">
                        {special && (
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-display font-bold text-xs bg-primary/20 text-primary border border-primary/30`}>
                            {special}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end items-center pr-2">
                        <div className={`flex items-center gap-1.5 text-sm font-display font-medium ${isFull ? 'text-red-400' : 'text-green-400'}`}>
                          <Users className="w-4 h-4 opacity-70" />
                          {assigned} / {capacity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
