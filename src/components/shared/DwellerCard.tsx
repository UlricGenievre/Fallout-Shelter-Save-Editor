import { getItemLabel, getItem, formatSpecial } from '@/lib/gameData';
import { Pencil } from 'lucide-react';
import { type ReactNode } from 'react';

interface DwellerCardProps {
  dweller: any;
  roomName?: string;
  roomSpecial?: string;
  onEditWeapon?: () => void;
  /** Slot optionnel rendu en bas de la colonne Room. */
  action?: ReactNode;
  /** Rend toute la carte cliquable (ex: sélection d'un dweller). */
  onClick?: () => void;
}

export function DwellerCard({ dweller, roomName, roomSpecial, onEditWeapon, action, onClick }: DwellerCardProps) {
  const level = dweller.experience?.currentLevel || 1;
  const maxHp = dweller.health?.maxHealth || 0;
  const outfit = dweller.equipedOutfit?.id || '';
  const weapon = dweller.equipedWeapon?.id || '';
  const specialStats = dweller.stats?.stats || [];

  const outfitItem = getItem(outfit);
  const weaponItem = getItem(weapon);
  const outfitBonus = outfitItem ? formatSpecial(outfitItem.special) : '';
  const weaponDamage = weaponItem?.damage || '';
  const avgDamage = weaponItem?.avgDamage || '';

  const specialLetters = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];
  const statIndex = roomSpecial ? specialLetters.indexOf(roomSpecial) + 1 : -1;
  const baseStat = statIndex > 0 ? (specialStats[statIndex]?.value || 0) : 0;
  const bonusStat = (roomSpecial && outfitItem?.special)
    ? (outfitItem.special[roomSpecial as keyof typeof outfitItem.special] || 0)
    : 0;

  return (
    <div
      className={`border border-border/60 rounded-lg p-4 bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 ${onClick ? 'cursor-pointer select-none active:scale-[0.995]' : ''}`}
      onClick={onClick}
    >
      <div className="grid grid-cols-[1.5fr_1.5fr_2.2fr_1fr] gap-4 items-center">
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

        <div className="flex-shrink-0 grid grid-cols-[2fr_1fr] gap-x-2 gap-y-2 items-center">
          <p className="text-xs font-semibold truncate text-left" title={getItemLabel(outfit)}>
            <span className="text-xs text-muted-foreground font-display">OUTFIT : </span>
            {getItemLabel(outfit) || 'None'}
          </p>
          <div className="text-left">
            {outfitBonus && <p className="text-xs text-primary font-display">{outfitBonus}</p>}
          </div>

          <div className="flex items-center gap-1 min-w-0">
            <p className="text-xs font-semibold truncate text-left" title={getItemLabel(weapon)}>
              <span className="text-xs text-muted-foreground font-display">WEAPON : </span>
              {getItemLabel(weapon) || 'None'}
            </p>
            {onEditWeapon && (
              <button
                onClick={e => { e.stopPropagation(); onEditWeapon(); }}
                className="shrink-0 text-yellow-100 hover:text-amber-400 transition-colors"
                title="Change weapon"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="text-left">
            {weaponDamage && <p className="text-xs text-primary font-display">{avgDamage} ({weaponDamage})</p>}
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col justify-center items-center h-full border-l border-border/30 pl-4 w-[140px] gap-1">
          <p className="text-xs font-semibold text-center leading-tight text-primary pip-text-glow">
            {roomName || 'Wandering'}
          </p>
          <p className="text-xs font-semibold text-center leading-tight text-primary pip-text-glow">
            {roomSpecial ? `${roomSpecial} (${baseStat}+${bonusStat})` : ''}
          </p>
          {action && <div className="w-full mt-0.5">{action}</div>}
        </div>
      </div>
    </div>
  );
}
