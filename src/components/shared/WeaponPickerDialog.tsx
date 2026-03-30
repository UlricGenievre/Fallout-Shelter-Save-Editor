import { useState, useMemo } from 'react';
import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getItem, getItemLabel, getItemType } from '@/lib/gameData';
import { Search, ChevronDown, ChevronRight, X } from 'lucide-react';

interface WeaponPickerDialogProps {
  open: boolean;
  onClose: () => void;
  dweller: any;
  allDwellers: any[];
  inventory: any[];
  dwellerRooms?: Map<number, { name: string; special: string }>;
  onEquip: (newWeaponId: string, sourceDwellerId?: number) => void;
}

const RARITY_COLORS: Record<string, string> = {
  Legendary: 'text-yellow-400',
  Rare: 'text-blue-400',
  Common: 'text-green-400',
};

const SPECIAL_LETTERS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];

export function WeaponPickerDialog({
  open,
  onClose,
  dweller,
  allDwellers,
  inventory,
  dwellerRooms,
  onEquip,
}: WeaponPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [expandedDwellerId, setExpandedDwellerId] = useState<number | null>(null);

  const currentWeaponId = dweller?.equipedWeapon?.id || '';
  const currentWeaponItem = getItem(currentWeaponId);

  // --- Inventory weapon counts (weapons only) ---
  const inventoryWeaponCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of inventory) {
      const id = typeof item === 'string' ? item : item?.id;
      if (!id) continue;
      if (getItemType(id) !== 'weapon') continue;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }, [inventory]);

  // --- Other dwellers who have a weapon ---
  const otherDwellerWeapons = useMemo(() => {
    return allDwellers
      .filter(d => d.serializeId !== dweller?.serializeId && d.equipedWeapon?.id)
      .map(d => ({ owner: d, weaponId: d.equipedWeapon.id as string }));
  }, [allDwellers, dweller]);

  const q = search.toLowerCase().trim();

  const filteredInventory = useMemo(() => {
    return Array.from(inventoryWeaponCounts.entries())
      .filter(([id]) => !q || getItemLabel(id).toLowerCase().includes(q))
      .sort((a, b) => {
        const parse = (id: string) => {
          const item = getItem(id);
          return parseFloat(item?.avgDamage?.toString() || item?.damage?.toString() || '0') || 0;
        };
        return parse(b[0]) - parse(a[0]); // Strongest first
      });
  }, [inventoryWeaponCounts, q]);

  const filteredDwellerWeapons = useMemo(() => {
    return otherDwellerWeapons.filter(
      ({ weaponId }) => !q || getItemLabel(weaponId).toLowerCase().includes(q),
    );
  }, [otherDwellerWeapons, q]);

  const handleEquip = (weaponId: string, sourceDwellerId?: number) => {
    onEquip(weaponId, sourceDwellerId);
    onClose();
  };

  const formatDamage = (id: string) => {
    const item = getItem(id);
    if (!item) return '';
    return item.avgDamage ? `${item.avgDamage} (${item.damage})` : item.damage || '';
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col gap-3">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-display tracking-wider pip-text-glow">CHANGE WEAPON</DialogTitle>
        </DialogHeader>

        {/* Current dweller context — always visible */}
        <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">
                {dweller?.name} {dweller?.lastName}
              </p>
              <p className="text-xs text-muted-foreground font-display">
                Level {dweller?.experience?.currentLevel || 1} · HP{' '}
                {Math.round(dweller?.health?.maxHealth || 0)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-primary">
                {getItemLabel(currentWeaponId) || 'None'}
              </p>
              {currentWeaponItem?.damage && (
                <p className="text-xs text-muted-foreground font-display">
                  {currentWeaponItem.avgDamage} ({currentWeaponItem.damage})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search weapons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-muted/20 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 font-display placeholder:text-muted-foreground/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable weapon list */}
        <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 pr-1 min-h-0">

          {/* Unequip / None */}
          {!q && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/40 bg-card/20 mb-1">
              <div>
                <p className="text-sm font-display text-muted-foreground">NO WEAPON</p>
                {currentWeaponId && (
                  <p className="text-xs text-muted-foreground/90">
                    → {getItemLabel(currentWeaponId)} will be returned to inventory
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={!currentWeaponId}
                onClick={() => handleEquip('')}
              >
                Unequip
              </Button>
            </div>
          )}

          {/* In inventory */}
          {filteredInventory.length > 0 && (
            <>
              <SectionHeader label={`In Inventory (${filteredInventory.length})`} />
              {filteredInventory.map(([id, count]) => (
                <WeaponRow
                  key={id}
                  weaponId={id}
                  item={getItem(id)}
                  isCurrent={id === currentWeaponId}
                  damage={formatDamage(id)}
                  badge={
                    <span className="text-xs font-display text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                      ×{count} in stock
                    </span>
                  }
                  onEquip={() => handleEquip(id)}
                />
              ))}
            </>
          )}

          {/* Equipped by other dwellers */}
          {filteredDwellerWeapons.length > 0 && (
            <>
              <SectionHeader
                label={`Equipped by another dweller (${filteredDwellerWeapons.length})`}
              />
              {filteredDwellerWeapons.map(({ owner, weaponId }) => {
                const isExpanded = expandedDwellerId === owner.serializeId;
                const ownerStats = owner.stats?.stats || [];
                const item = getItem(weaponId);
                const isCurrent = weaponId === currentWeaponId;
                const label = getItemLabel(weaponId);
                const rarity = item?.rarity;
                const damage = formatDamage(weaponId);
                return (
                  <div
                    key={`${owner.serializeId}-${weaponId}`}
                    className="border border-border/40 rounded-lg"
                  >
                    {/* Weapon row — inlined to avoid height-collapse with overflow-hidden */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-t-lg transition-colors hover:bg-primary/5 ${isCurrent ? 'bg-primary/5' : 'bg-card/20'} ${!isExpanded ? 'rounded-b-lg' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">{label}</p>
                          {item?.category && (
                            <span className="text-[10px] font-display uppercase shrink-0 border border-primary/20 px-1 rounded">
                              {item.category}
                            </span>
                          )}
                          {rarity && (
                            <span className={`text-[10px] font-display uppercase shrink-0 ${RARITY_COLORS[rarity] ?? 'text-muted-foreground'}`}>
                              {rarity}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-display text-primary/60 uppercase shrink-0">Equipped</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          {damage && (
                            <span className="text-xs text-primary font-display shrink-0">{damage}</span>
                          )}
                          <button
                            className="flex items-center gap-1 text-xs font-display text-amber-400/80 hover:text-amber-400 transition-colors"
                            onClick={() => setExpandedDwellerId(isExpanded ? null : owner.serializeId)}
                          >
                            {isExpanded
                              ? <ChevronDown className="w-3 h-3 shrink-0" />
                              : <ChevronRight className="w-3 h-3 shrink-0" />}
                            {owner.name} {owner.lastName} · Lvl {owner.experience?.currentLevel || 1}
                          </button>
                        </div>
                      </div>
                      <Button
                        variant={isCurrent ? 'secondary' : 'outline'}
                        size="sm"
                        className="h-7 text-xs shrink-0"
                        disabled={isCurrent}
                        onClick={() => handleEquip(weaponId, owner.serializeId)}
                      >
                        {isCurrent ? 'Current' : 'Equip'}
                      </Button>
                    </div>

                    {/* Expandable dweller info */}
                    {isExpanded && (
                      <div className="px-4 py-2.5 bg-amber-400/5 border-t border-border/30 rounded-b-lg flex items-center gap-6 flex-wrap">
                        <span className="text-xs text-muted-foreground font-display">
                          HP {Math.round(owner.health?.maxHealth || 0)}
                        </span>
                        <div className="grid grid-cols-7 gap-2">
                          {SPECIAL_LETTERS.map((letter, idx) => {
                            const val = ownerStats[idx + 1]?.value || 0;
                            return (
                              <div key={letter} className="flex flex-col items-center">
                                <span className="text-[9px] font-display text-muted-foreground">{letter}</span>
                                <span className="text-xs font-bold text-primary">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                        {(() => {
                          const roomInfo = dwellerRooms?.get(owner.serializeId);
                          return (
                            <div className="ml-auto text-xs font-display text-right">
                              <span className="text-primary pip-text-glow font-semibold">
                                {roomInfo?.name || 'Wandering'}
                              </span>
                              {roomInfo?.special && (
                                <p className="text-muted-foreground/90">{roomInfo.special}</p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Empty states */}
          {filteredInventory.length === 0 && filteredDwellerWeapons.length === 0 && q && (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm font-display">
              No weapons found for "{search}"
            </div>
          )}
          {filteredInventory.length === 0 && filteredDwellerWeapons.length === 0 && !q && (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm font-display">
              No weapons available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components ---

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[12px] font-display uppercase tracking-widest text-yellow-100 pt-1 px-1">
      {label}
    </p>
  );
}

interface WeaponRowProps {
  weaponId: string;
  item: ReturnType<typeof getItem>;
  isCurrent: boolean;
  damage: string;
  badge: ReactNode;
  rounded?: boolean;
  onEquip: () => void;
}

function WeaponRow({
  weaponId,
  item,
  isCurrent,
  damage,
  badge,
  rounded = true,
  onEquip,
}: WeaponRowProps) {
  const label = getItemLabel(weaponId);
  const rarity = item?.rarity;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 bg-card/20 hover:bg-primary/5 transition-colors ${rounded ? 'rounded-lg' : ''} ${isCurrent ? 'bg-primary/5' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold truncate">{label}</p>
          {item?.category && (
            <span className="text-[10px] font-display uppercase shrink-0 border border-primary/20 px-1 rounded">
              {item.category}
            </span>
          )}
          {rarity && (
            <span
              className={`text-[10px] font-display uppercase shrink-0 ${RARITY_COLORS[rarity] ?? 'text-muted-foreground'}`}
            >
              {rarity}
            </span>
          )}
          {isCurrent && (
            <span className="text-[10px] font-display text-primary/60 uppercase shrink-0">
              Equipped
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {damage && (
            <span className="text-xs text-primary font-display shrink-0">{damage}</span>
          )}
          {badge}
        </div>
      </div>
      <Button
        variant={isCurrent ? 'secondary' : 'outline'}
        size="sm"
        className="h-7 text-xs shrink-0"
        disabled={isCurrent}
        onClick={onEquip}
      >
        {isCurrent ? 'Current' : 'Equip'}
      </Button>
    </div>
  );
}
