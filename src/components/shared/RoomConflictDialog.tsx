import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import roomsData from '@/data/rooms.json';
import { DwellerCard } from './DwellerCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, LogOut } from 'lucide-react';

interface RoomConflictDialogProps {
  open: boolean;
  onClose: () => void;
  dwellerId: number;
  targetRoomIndex: number;
  dwellers: any[];
  rooms: any[];
  onResolve: (kickedDwellerId: number, isSwap: boolean) => void;
}

export function RoomConflictDialog({
  open,
  onClose,
  dwellerId,
  targetRoomIndex,
  dwellers,
  rooms,
  onResolve,
}: RoomConflictDialogProps) {
  const room = rooms[targetRoomIndex] || null;
  const dweller = dwellers.find(d => d.serializeId === dwellerId) || null;

  if (!room || !dweller) {
    return null;
  }

  const roomNameMap = new Map(roomsData.rooms.map(r => [r.type, r.name]));
  const roomName = roomNameMap.get(room.type) || room.type;

  // Dwellers already in the room
  const occupants = (room.dwellers || []).map((id: number) =>
    dwellers.find(d => d.serializeId === id)
  ).filter(Boolean);

  const roomDataDef: any = roomsData.rooms.find(r => r.type === room.type);
  const roomSpecialChar = roomDataDef?.special || '';

  const getStatTotal = (d: any) => {
    if (!d?.stats?.stats) return 0;
    let total = 0;
    for (let i = 1; i <= 7; i++) {
      total += d.stats.stats[i]?.value || 0;
    }
    return total;
  };

  const getSpecStat = (d: any, letter: string) => {
    if (!d?.stats?.stats) return 0;
    const idx = ['S', 'P', 'E', 'C', 'I', 'A', 'L'].indexOf(letter);
    if (idx === -1) return 0;
    return d.stats.stats[idx + 1]?.value || 0;
  };

  const incomingValue = roomSpecialChar ? getSpecStat(dweller, roomSpecialChar) : getStatTotal(dweller);

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-4 shrink-0 border-b border-border/40">
          <DialogTitle className="font-display text-xl text-red-400 pip-text-glow tracking-widest flex items-center justify-between">
            <span>ROOM FULL CONFLICT</span>
            <span className="text-sm font-semibold text-center leading-tight text-primary pip-text-glow font-sans tracking-normal">
              Target: {roomName}
            </span>
          </DialogTitle>
          <DialogDescription className="mt-2 text-base text-foreground">
            <strong>{dweller.name} {dweller.lastName}</strong> wants to enter <strong>{roomName}</strong>, but it is currently full.
            Select an occupant below to make room.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 gap-4">
            {occupants.map((occupant: any) => {
              const occupantValue = roomSpecialChar ? getSpecStat(occupant, roomSpecialChar) : getStatTotal(occupant);
              const diff = incomingValue - occupantValue;
              const sign = diff > 0 ? '+' : '';
              const textColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-muted-foreground';

              return (
                <DwellerCard
                  key={occupant.serializeId}
                  dweller={occupant}
                  roomName={roomName} // purely cosmetic
                  action={
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 px-1.5 text-xs flex items-center justify-center gap-1 hover:bg-orange-500/20 hover:text-orange-500 hover:border-orange-500/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(occupant.serializeId, false);
                          }}
                          title="Kick completely out of this room (Coffee Break)"
                        >
                          <LogOut className="w-3 h-3" /> Evict
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 h-7 px-1.5 text-xs flex items-center justify-center gap-1 border border-primary hover:bg-background hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolve(occupant.serializeId, true);
                          }}
                          title="Swap places with the incoming dweller"
                        >
                          <RefreshCw className="w-3 h-3" /> Swap
                        </Button>
                      </div>
                      <div className={`text-[11px] font-display text-center bg-background/50 rounded py-0.5 ${textColor}`} title="Efficiency difference (Incoming - Occupant)">
                        EFFICIENCY: {roomSpecialChar || 'Σ'} {sign}{diff}
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
