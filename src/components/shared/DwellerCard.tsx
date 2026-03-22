import { getItemLabel } from '@/lib/gameData';

interface DwellerCardProps {
  dweller: any;
}

export function DwellerCard({ dweller }: DwellerCardProps) {
  const level = dweller.experience?.currentLevel || 1;
  const maxHp = dweller.health?.maxHealth || 0;
  const outfit = dweller.equipedOutfit?.id || '';
  const weapon = dweller.equipedWeapon?.id || '';
  const specialStats = dweller.stats?.stats || [];

  return (
    <div className="border border-border rounded-lg p-4 bg-card/50">
      <div className="grid grid-cols-[1fr_1fr_2fr] gap-4 items-center">
        <div className="flex-shrink-0">
          <h4 className="font-semibold text-sm">{dweller.name} {dweller.lastName}</h4>
          <p className="text-xs font-display">Level {level}</p>
          <p className="text-xs font-display">HP MAX : {Math.round(maxHp)}</p>
        </div>

        <div className="flex-shrink-0">
          <div className="grid grid-cols-7 gap-0 min-w-[120px]">
            {['S', 'P', 'E', 'C', 'I', 'A', 'L'].map((statName, index) => {
              const statValue = specialStats[index + 1]?.value || 0;
              return (
                <div key={statName} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-display">{statName}</span>
                  <div className="w-4 h-8 bg-muted rounded-sm overflow-hidden flex flex-col-reverse">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`flex-1 w-full ${i < statValue ? 'bg-primary' : 'bg-muted-foreground/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold">{statValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-shrink-0 space-y-1">
          <div>
            <p className="text-xs font-semibold truncate" title={getItemLabel(outfit)}>
              <span className="text-xs text-muted-foreground font-display">OUTFIT : </span>
              {getItemLabel(outfit) || 'None'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold truncate" title={getItemLabel(weapon)}>
              <span className="text-xs text-muted-foreground font-display">WEAPON : </span>
              {getItemLabel(weapon) || 'None'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
