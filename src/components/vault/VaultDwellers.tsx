import { useMemo } from 'react';
import { DwellerCard } from '../shared/DwellerCard';
import roomsData from '@/data/rooms.json';

interface VaultDwellersProps {
  dwellers: any[];
  rooms: any[];
}

export function VaultDwellers({ dwellers, rooms }: VaultDwellersProps) {
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
  if (!dwellers || dwellers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No dwellers found.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">VAULT DWELLERS ({dwellers.length})</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto pb-10">
        {dwellers.map((dweller) => {
          const rInfo = dwellerRooms.get(dweller.serializeId);
          return (
            <DwellerCard 
              key={dweller.serializeId} 
              dweller={dweller} 
              roomName={rInfo?.name} 
              roomSpecial={rInfo?.special} 
            />
          );
        })}
      </div>
    </div>
  );
}
