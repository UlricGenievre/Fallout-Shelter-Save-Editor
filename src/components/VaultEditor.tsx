import { Home } from 'lucide-react';
import { RoomViewer } from './RoomViewer';

interface VaultEditorProps {
  data?: any;
}

export function VaultEditor({ data }: VaultEditorProps) {
  const rooms = data?.vault?.rooms || [];
  const dwellers = data?.dwellers?.dwellers || [];

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

  return <RoomViewer rooms={rooms} dwellers={dwellers} />;
}
