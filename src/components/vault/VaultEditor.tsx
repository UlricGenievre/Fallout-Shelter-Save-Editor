import { Box, Home, LayoutGrid, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { RoomViewer } from './RoomViewer';
import { VaultDwellers } from './VaultDwellers';
import { VaultInventory } from './VaultInventory';

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

    const previousWeaponId: string = target.equipedWeapon?.id || '';

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
      // Return previous weapon to inventory
      if (previousWeaponId) {
        items.push(previousWeaponId);
      }
    }

    if (!target.equipedWeapon) target.equipedWeapon = {};
    target.equipedWeapon.id = newWeaponId;

    setData(newData);
  };

  const rooms = data?.vault?.rooms || [];
  const dwellers = data?.dwellers?.dwellers || [];
  const inventory = data?.vault?.inventory?.items || [];

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
          <RoomViewer rooms={rooms} dwellers={dwellers} />
        )}
        {activeTab === 'dwellers' && (
        <VaultDwellers
            dwellers={dwellers}
            rooms={rooms}
            inventory={inventory}
            onEquipWeapon={handleEquipWeapon}
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
          />
        )}
      </div>
    </div>
  );
}
