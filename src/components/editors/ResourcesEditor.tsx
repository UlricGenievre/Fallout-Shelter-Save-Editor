import { Package, Droplets, Zap, UtensilsCrossed, Pill, Radiation, FlaskConical } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ResourcesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

const RESOURCE_CONFIG = [
  { key: 'Nuka', label: 'Caps', icon: Package },
  { key: 'Food', label: 'Food', icon: UtensilsCrossed },
  { key: 'Water', label: 'Water', icon: Droplets },
  { key: 'Energy', label: 'Energy', icon: Zap },
  { key: 'StimPack', label: 'Stimpaks', icon: Pill },
  { key: 'RadAway', label: 'RadAway', icon: Radiation },
  { key: 'NukaColaQuantum', label: 'Nuka Quantum', icon: FlaskConical },
  { key: 'Lunchbox', label: 'Lunchbox', icon: Package },
  { key: 'MrHandy', label: 'Mr. Handy', icon: Package },
  { key: 'PetCarrier', label: 'Pet Carrier', icon: Package },
];

export function ResourcesEditor({ data, onChange }: ResourcesEditorProps) {
  const storage = data?.vault?.storage;
  if (!storage?.resources) {
    return (
      <div className="text-muted-foreground text-sm font-display">
        No resources found in the save file.
      </div>
    );
  }

  const resources = storage.resources;

  const updateResource = (key: string, value: number) => {
    const updated = { ...data };
    updated.vault.storage.resources[key] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">RESOURCES</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RESOURCE_CONFIG.map(({ key, label, icon: Icon }) => {
          if (resources[key] === undefined) return null;
          return (
            <div key={key} className="flex items-center gap-2 border border-border rounded-sm p-2 bg-card/50">
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <label className="text-xs font-display text-muted-foreground flex-1">{label}</label>
              <Input
                type="number"
                min={0}
                value={resources[key]}
                onChange={(e) => updateResource(key, parseInt(e.target.value) || 0)}
                className="w-24 h-7 text-xs text-right"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
