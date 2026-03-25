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
}

export function VaultEditor({ data }: VaultEditorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  const activeTab = TABS.some(t => t.id === tabParam) ? tabParam : 'layout';

  const setActiveTab = (id: Tab) => {
    setSearchParams(prev => {
      prev.set('tab', id);
      return prev;
    });
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
      <nav className="flex border-b border-border bg-card/30 shrink-0">
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
          <VaultDwellers dwellers={dwellers} rooms={rooms} />
        )}
        {activeTab === 'inventory' && (
          <VaultInventory items={inventory} />
        )}
      </div>
    </div>
  );
}
