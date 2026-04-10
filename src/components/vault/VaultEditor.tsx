import { Box, Home, LayoutGrid, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { RoomViewer } from './RoomViewer';
import { VaultDwellers } from './VaultDwellers';
import { VaultInventory } from './VaultInventory';
import roomsData from '@/data/rooms.json';

type Tab = 'layout' | 'dwellers' | 'inventory';

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'layout', label: 'LAYOUT', icon: LayoutGrid },
  { id: 'dwellers', label: 'DWELLERS', icon: Users },
  { id: 'inventory', label: 'INVENTORY', icon: Box as any },
];

interface VaultEditorProps {
  data?: any;
  setData?: (data: any) => void;
}

export function VaultEditor({ data, setData }: VaultEditorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  const activeTab = TABS.some(t => t.id === tabParam) ? tabParam : 'layout';

  const setActiveTab = (id: Tab) => {
    setSearchParams(prev => {
      prev.set('tab', id);
      return prev;
    });
  };

  const handleSellItem = (itemId: string, amount: number, resellValue: number) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    
    // Add caps
    const capsGain = amount * resellValue;
    if (newData.vault?.storage?.resources) {
      if (typeof newData.vault.storage.resources.Nuka !== 'number') {
        newData.vault.storage.resources.Nuka = 0;
      }
      newData.vault.storage.resources.Nuka += capsGain;
    }
    
    // Remove items
    if (newData.vault?.inventory?.items) {
      const items = newData.vault.inventory.items;
      let removed = 0;
      for (let i = items.length - 1; i >= 0 && removed < amount; i--) {
        const id = typeof items[i] === 'string' ? items[i] : items[i].id;
        if (id === itemId) {
          items.splice(i, 1);
          removed++;
        }
      }
    }
    setData(newData);
  };

  const handleEquipWeapon = (
    targetDwellerId: number,
    newWeaponId: string,
    sourceDwellerId?: number,
  ) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    const allDwellers: any[] = newData.dwellers?.dwellers || [];

    const target = allDwellers.find((d: any) => d.serializeId === targetDwellerId);
    if (!target) return;

    const previousWeaponId: string = target.equipedWeapon?.id || 'Fist';

    if (sourceDwellerId !== undefined) {
      // --- SWAP: weapon comes from another dweller ---
      const source = allDwellers.find((d: any) => d.serializeId === sourceDwellerId);
      if (source) {
        if (!source.equipedWeapon) source.equipedWeapon = {};
        source.equipedWeapon.id = previousWeaponId; // source gets target's old weapon
      }
    } else {
      // --- FROM INVENTORY OR UNEQUIP ---
      const items: any[] = newData.vault?.inventory?.items || [];
      if (newWeaponId) {
        // Remove one occurrence of the chosen weapon from inventory
        const idx = items.findIndex(
          (item: any) => (typeof item === 'string' ? item : item?.id) === newWeaponId,
        );
        if (idx !== -1) items.splice(idx, 1);
      }
      // Return previous weapon to inventory (except if it was "Fist")
      if (previousWeaponId && previousWeaponId !== 'Fist') {
        items.push(previousWeaponId);
      }
    }

    if (!target.equipedWeapon) target.equipedWeapon = {};
    target.equipedWeapon.id = newWeaponId || 'Fist';

    setData(newData);
  };

  const handleEquipOutfit = (
    targetDwellerId: number,
    newOutfitId: string,
    sourceDwellerId?: number,
  ) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    const allDwellers: any[] = newData.dwellers?.dwellers || [];

    const target = allDwellers.find((d: any) => d.serializeId === targetDwellerId);
    if (!target) return;

    const previousOutfitId: string = target.equipedOutfit?.id || 'jumpsuit';

    if (sourceDwellerId !== undefined) {
      // --- SWAP: outfit comes from another dweller ---
      const source = allDwellers.find((d: any) => d.serializeId === sourceDwellerId);
      if (source) {
        if (!source.equipedOutfit) source.equipedOutfit = {};
        source.equipedOutfit.id = previousOutfitId; // source gets target's old outfit
      }
    } else {
      // --- FROM INVENTORY OR UNEQUIP ---
      const items: any[] = newData.vault?.inventory?.items || [];
      if (newOutfitId) {
        // Remove one occurrence of the chosen outfit from inventory
        const idx = items.findIndex(
          (item: any) => (typeof item === 'string' ? item : item?.id) === newOutfitId,
        );
        if (idx !== -1) items.splice(idx, 1);
      }
      // Return previous outfit to inventory (except if it was "jumpsuit")
      if (previousOutfitId && previousOutfitId !== 'jumpsuit') {
        items.push(previousOutfitId);
      }
    }

    if (!target.equipedOutfit) target.equipedOutfit = {};
    target.equipedOutfit.id = newOutfitId || 'jumpsuit';

    setData(newData);
  };

  const handleMoveDweller = (
    dwellerId: number,
    sourceRoomIndex: number | null,
    targetRoomIndex: number | null,
    bumpedDwellerId?: number,
    isSwap?: boolean
  ) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    const allRooms = newData.vault?.rooms || [];
    const allDwellers = newData.dwellers?.dwellers || [];

    const isTrainingRoom = (room: any) => {
      if (!room) return false;
      return roomsData.rooms.find(r => r.type === room.type)?.category === 'Training';
    };

    const updateDwellerSavedState = (dId: number, rIdx: number | null, srcRIdx: number | null) => {
      const dweller = allDwellers.find((d: any) => d.serializeId === dId);
      if (dweller) {
        // 1. Update savedRoom index
        const targetRoom = rIdx !== null ? allRooms[rIdx] : null;
        dweller.savedRoom = targetRoom ? (targetRoom.deserializeID ?? -1) : -1;

        // 2. Training Rooms Slots Management
        const sourceRoom = srcRIdx !== null ? allRooms[srcRIdx] : null;

        const wasTraining = isTrainingRoom(sourceRoom);
        const isTraining = isTrainingRoom(targetRoom);

        let movedSlot: any = null;

        // --- Remove from source if was Training ---
        if (wasTraining && sourceRoom.slots) {
          const slotIdx = sourceRoom.slots.findIndex((s: any) => s.dwellerId === dId);
          if (slotIdx !== -1) {
            movedSlot = sourceRoom.slots[slotIdx];
            sourceRoom.slots.splice(slotIdx, 1);
          }
        }

        // --- Add to target if is Training ---
        if (isTraining) {
          if (!targetRoom.slots) targetRoom.slots = [];

          if (movedSlot) {
            // Transfer existing slot
            targetRoom.slots.push(movedSlot);
          } else {
            // Create new slot and increment global taskID
            if (!newData.vault.taskMgr) newData.vault.taskMgr = { id: 0, time: 0, tasks: [] };
            const newTaskId = (newData.vault.taskMgr.id || 0) + 1;
            newData.vault.taskMgr.id = newTaskId;

            targetRoom.slots.push({
              dwellerId: dId,
              needLvUp: false,
              taskID: newTaskId
            });
          }
        }

        // 3. HappinessManager synchronization
        if (!newData.happinessManager) newData.happinessManager = {};
        let happinessEntry: any = null;

        // --- Remove from source ---
        if (sourceRoom) {
          const srcKey = `room${sourceRoom.deserializeID}`;
          const roomEntries = newData.happinessManager[srcKey];
          if (roomEntries) {
            const hIdx = roomEntries.findIndex((e: any) => e.dc === dId);
            if (hIdx !== -1) {
              happinessEntry = roomEntries[hIdx];
              roomEntries.splice(hIdx, 1);
            }
          }
        }

        // --- Add to target ---
        if (targetRoom) {
          const targetKey = `room${targetRoom.deserializeID}`;
          if (!newData.happinessManager[targetKey]) newData.happinessManager[targetKey] = [];

          if (!happinessEntry) {
            happinessEntry = { type: 3, rh: 0, in: true, dc: dId };
          }

          if (!newData.happinessManager[targetKey].some((e: any) => e.dc === dId)) {
            newData.happinessManager[targetKey].push(happinessEntry);
          }
        }
      }
    };

    // 1. Remove from source
    if (sourceRoomIndex !== null && allRooms[sourceRoomIndex]) {
      allRooms[sourceRoomIndex].dwellers = (allRooms[sourceRoomIndex].dwellers || []).filter(
        (id: number) => id !== dwellerId
      );
    }

    // 2. Handle bumped dweller
    if (bumpedDwellerId !== undefined && targetRoomIndex !== null && allRooms[targetRoomIndex]) {
      allRooms[targetRoomIndex].dwellers = (allRooms[targetRoomIndex].dwellers || []).filter(
        (id: number) => id !== bumpedDwellerId
      );

      if (isSwap && sourceRoomIndex !== null && allRooms[sourceRoomIndex]) {
        if (!allRooms[sourceRoomIndex].dwellers) allRooms[sourceRoomIndex].dwellers = [];
        allRooms[sourceRoomIndex].dwellers.push(bumpedDwellerId);
        
        // Update bumped dweller state (moving to source)
        updateDwellerSavedState(bumpedDwellerId, sourceRoomIndex, targetRoomIndex);
      } else {
        // Bumped to "Coffee Break"
        updateDwellerSavedState(bumpedDwellerId, null, targetRoomIndex);
      }
    }

    // 3. Add to target
    if (targetRoomIndex !== null && allRooms[targetRoomIndex]) {
      if (!allRooms[targetRoomIndex].dwellers) allRooms[targetRoomIndex].dwellers = [];
      if (!allRooms[targetRoomIndex].dwellers.includes(dwellerId)) {
        allRooms[targetRoomIndex].dwellers.push(dwellerId);
      }
    }

    // 4. Update primary dweller state
    updateDwellerSavedState(dwellerId, targetRoomIndex, sourceRoomIndex);

    setData(newData);
  };

  const handleUpdateDweller = (dwellerId: number, updatedDweller: any) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    const allDwellers: any[] = newData.dwellers?.dwellers || [];
    
    const idx = allDwellers.findIndex((d: any) => d.serializeId === dwellerId);
    if (idx !== -1) {
      allDwellers[idx] = updatedDweller;
      setData(newData);
    }
  };

  const handleUpdateVaultName = (newName: string) => {
    if (!setData || !data) return;
    const newData = JSON.parse(JSON.stringify(data));
    if (newData.vault) {
      newData.vault.VaultName = newName;
      setData(newData);
    }
  };

  const rooms = data?.vault?.rooms || [];
  const dwellers = data?.dwellers?.dwellers || [];
  const inventory = data?.vault?.inventory?.items || [];
  const vaultName = data?.vault?.VaultName || '000';

  if (!data || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <Home className="w-16 h-16 text-primary/20 mb-4" />
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">VAULT MODE</h2>
        <p className="text-muted-foreground max-w-md">
          No vault data available. Please load a save file first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <nav className="flex justify-center border-b border-border bg-card/30 shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-display transition-colors border-b-2 ${
              activeTab === id
                ? 'border-primary text-primary pip-text-glow'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'layout' && (
          <RoomViewer 
            rooms={rooms} 
            dwellers={dwellers} 
            inventory={inventory}
            vaultName={vaultName}
            onUpdateVaultName={handleUpdateVaultName}
            onEquipWeapon={handleEquipWeapon}
            onEquipOutfit={handleEquipOutfit}
            onMoveDweller={handleMoveDweller}
            onUpdateDweller={handleUpdateDweller}
          />
        )}
        {activeTab === 'dwellers' && (
          <VaultDwellers
            dwellers={dwellers}
            rooms={rooms}
            inventory={inventory}
            onEquipWeapon={handleEquipWeapon}
            onEquipOutfit={handleEquipOutfit}
            onMoveDweller={handleMoveDweller}
            onUpdateDweller={handleUpdateDweller}
          />
        )}
        {activeTab === 'inventory' && (
          <VaultInventory
            items={inventory}
            onSellItem={handleSellItem}
            dwellers={dwellers}
            rooms={rooms}
            onEquipWeapon={(targetDwellerId, weaponId) =>
              handleEquipWeapon(targetDwellerId, weaponId)
            }
            onEquipOutfit={(targetDwellerId, outfitId) =>
              handleEquipOutfit(targetDwellerId, outfitId)
            }
          />
        )}
      </div>
    </div>
  );
}
