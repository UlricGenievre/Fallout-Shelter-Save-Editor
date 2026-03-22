import { DwellerCard } from '../shared/DwellerCard';

interface VaultDwellersProps {
  dwellers: any[];
}

export function VaultDwellers({ dwellers }: VaultDwellersProps) {
  if (!dwellers || dwellers.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No dwellers found.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl pip-text-glow tracking-widest mb-2">VAULT DWELLERS ({dwellers.length})</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto pb-10">
        {dwellers.map((dweller) => (
          <DwellerCard key={dweller.serializeId} dweller={dweller} />
        ))}
      </div>
    </div>
  );
}
