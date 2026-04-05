import { useState, useMemo, ReactNode, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getItem, getItemLabel, getItemType } from '@/lib/gameData';
import { Search, ChevronDown, ChevronRight, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface OutfitPickerDialogProps {
  open: boolean;
  onClose: () => void;
  dweller: any;
  allDwellers: any[];
  inventory: any[];
  dwellerRooms?: Map<number, { name: string; special: string; category: string }>;
  onEquip: (newOutfitId: string, sourceDwellerId?: number) => void;
}

const RARITY_COLORS: Record<string, string> = {
  Legendary: 'text-yellow-400',
  Rare: 'text-blue-400',
  Common: 'text-green-400',
};

const SPECIAL_LETTERS = ['S', 'P', 'E', 'C', 'I', 'A', 'L'] as const;

type SortField = 'name' | 'quantity' | 'rarity' | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L' | 'totalStats';
type SortDirection = 'asc' | 'desc';

export function OutfitPickerDialog({
  open,
  onClose,
  dweller,
  allDwellers,
  inventory,
  dwellerRooms,
  onEquip,
}: OutfitPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [expandedDwellerId, setExpandedDwellerId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ field: 'name', direction: 'asc' });
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    if (open) {
      setSearch('');
      setExpandedDwellerId(null);
      setActiveTab('inventory');
      const roomInfo = dwellerRooms?.get(dweller?.serializeId);
      if (roomInfo?.special && SPECIAL_LETTERS.includes(roomInfo.special as any)) {
        setSortConfig({ field: roomInfo.special as SortField, direction: 'desc' });
      } else {
        setSortConfig({ field: 'name', direction: 'asc' });
      }
    }
  }, [open, dweller?.serializeId, dwellerRooms]);

  const currentOutfitId = dweller?.equipedOutfit?.id || '';
  const currentOutfitItem = getItem(currentOutfitId);

  const inventoryOutfitCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of inventory) {
      const id = typeof item === 'string' ? item : item?.id;
      if (!id) continue;
      if (getItemType(id) !== 'outfit') continue;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }, [inventory]);

  const otherDwellerOutfits = useMemo(() => {
    return allDwellers
      .filter(d => d.serializeId !== dweller?.serializeId && d.equipedOutfit?.id)
      .map(d => ({ owner: d, outfitId: d.equipedOutfit.id as string }));
  }, [allDwellers, dweller]);

  const q = search.toLowerCase().trim();

  const sortItems = (aId: string, bId: string, countA: number, countB: number) => {
    const itemA = getItem(aId);
    const itemB = getItem(bId);

    let comparison = 0;
    switch (sortConfig.field) {
      case 'name':
        comparison = getItemLabel(aId).localeCompare(getItemLabel(bId));
        break;
      case 'quantity':
        comparison = countA - countB;
        break;
      case 'rarity': {
        const rarityRank = { 'Legendary': 3, 'Rare': 2, 'Common': 1 };
        const rankA = rarityRank[itemA?.rarity as keyof typeof rarityRank] || 0;
        const rankB = rarityRank[itemB?.rarity as keyof typeof rarityRank] || 0;
        comparison = rankA - rankB;
        break;
      }
      case 'totalStats':
        comparison = (itemA?.totalStats || 0) - (itemB?.totalStats || 0);
        break;
      case 'S': case 'P': case 'E': case 'C': case 'I': case 'A': case 'L': {
        const statA = itemA?.special?.[sortConfig.field] || 0;
        const statB = itemB?.special?.[sortConfig.field] || 0;
        comparison = statA - statB;
        break;
      }
    }

    if (comparison === 0 && sortConfig.field !== 'name') {
      return getItemLabel(aId).localeCompare(getItemLabel(bId));
    }
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  };

  const filteredInventory = useMemo(() => {
    return Array.from(inventoryOutfitCounts.entries())
      .filter(([id]) => !q || getItemLabel(id).toLowerCase().includes(q))
      .sort((a, b) => sortItems(a[0], b[0], a[1], b[1]));
  }, [inventoryOutfitCounts, q, sortConfig]);

  const filteredDwellerOutfits = useMemo(() => {
    return otherDwellerOutfits
      .filter(({ outfitId }) => !q || getItemLabel(outfitId).toLowerCase().includes(q))
      .sort((a, b) => sortItems(a.outfitId, b.outfitId, 0, 0));
  }, [otherDwellerOutfits, q, sortConfig]);

  const handleEquip = (outfitId: string, sourceDwellerId?: number) => {
    onEquip(outfitId, sourceDwellerId);
    onClose();
  };

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortButton = ({ field, label, align = 'left' }: { field: SortField, label: string, align?: 'left' | 'center' | 'right' }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-[10px] md:text-[11px] font-display uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === 'center' ? 'justify-center w-full' : align === 'right' ? 'justify-end w-full' : 'justify-start'}`}
      >
        <span className="flex items-center gap-0.5 cursor-pointer">
          {label}
          {isActive ? (
            sortConfig.direction === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-primary" /> : <ArrowDown className="w-2.5 h-2.5 text-primary" />
          ) : (
            <ArrowUpDown className="w-2.5 h-2.5 opacity-40 hover:opacity-100 transition-opacity" />
          )}
        </span>
      </button>
    );
  };

  const SpecialSortButton = ({ field }: { field: typeof SPECIAL_LETTERS[number] }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center justify-center w-full text-xs font-display font-medium text-muted-foreground hover:text-foreground transition-colors"
        title={`Sort by ${field}`}
      >
        <span className={`flex justify-center items-center w-5 h-5 rounded cursor-pointer ${isActive ? 'text-primary bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'}`}>
          {field}
          {isActive && (
            sortConfig.direction === 'asc' ? <ArrowUp className="w-2 h-2 ml-[1px]" /> : <ArrowDown className="w-2 h-2 ml-[1px]" />
          )}
        </span>
      </button>
    );
  };

  const dwellerRoomInfo = dwellerRooms?.get(dweller?.serializeId);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col gap-3">
        <DialogHeader className="shrink-0 flex justify-between items-center pr-8">
          <DialogTitle className="font-display tracking-wider pip-text-glow">CHANGE OUTFIT</DialogTitle>
        </DialogHeader>

        {/* Current dweller context */}
        <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 shrink-0 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm">
              {dweller?.name} {dweller?.lastName}
            </p>
            <div className="text-xs text-muted-foreground font-display flex flex-wrap gap-2">
              <span>Level {dweller?.experience?.currentLevel || 1}</span>
              <span>·</span>
              <span>HP {Math.round(dweller?.health?.maxHealth || 0)}</span>
              <span>·</span>
              <span className="text-primary pip-text-glow drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]">
                {dwellerRoomInfo?.name || 'Wandering'}
                {dwellerRoomInfo?.special ? ` (${dwellerRoomInfo.special})` : ''}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-primary">
              {getItemLabel(currentOutfitId) || 'None'}
            </p>
            {currentOutfitItem?.special && (
              <div className="flex gap-1 justify-end font-display text-xs mt-0.5">
                {SPECIAL_LETTERS.map(letter => {
                  const val = currentOutfitItem.special?.[letter];
                  return val ? (
                    <span key={letter} className="text-primary bg-primary/10 px-1 rounded">
                      {letter}+{val}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search outfits..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-muted/20 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 font-display placeholder:text-muted-foreground/50 h-10"
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

        {/* Tabs for outfits */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 gap-3">
          <TabsList className="w-full grid grid-cols-2 bg-muted/20 border border-border/50">
            <TabsTrigger value="inventory" className="font-display tracking-widest text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Inventory ({filteredInventory.length})
            </TabsTrigger>
            <TabsTrigger value="equipped" className="font-display tracking-widest text-xs uppercase data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Equipped ({filteredDwellerOutfits.length})
            </TabsTrigger>
          </TabsList>

          {/* List Header (matches InventoryOutfits grid) */}
          <div className="hidden sm:grid grid-cols-[60px_minmax(100px,2fr)_repeat(7,20px)_40px_85px] gap-2 md:gap-3 px-2 md:px-4 py-2 border-b border-border/40 shrink-0 bg-background/95 sticky top-0 z-10">
            <div className="flex justify-center border-r border-transparent pr-2 md:pr-4">
              {activeTab === 'inventory' ? <SortButton field="quantity" label="Qty" align="center" /> : <div />}
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4 shrink-0 overflow-hidden">
              <SortButton field="name" label="Name" />
              <SortButton field="rarity" label="Rarity" />
            </div>
            {SPECIAL_LETTERS.map(key => (
              <SpecialSortButton key={key} field={key} />
            ))}
            <div className="flex justify-center items-center px-1">
              <SortButton field="totalStats" label="Σ" align="center" />
            </div>
            <div className="flex justify-end items-center text-[10px] md:text-[11px] font-display uppercase tracking-wider text-muted-foreground/70 mr-2">
              Actions
            </div>
          </div>

          <div className="overflow-y-auto flex-1 flex flex-col gap-2 pr-1 min-h-0 pb-4">
            {/* Unequip / None */}
            {!q && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/40 bg-card/20 shrink-0">
                <div>
                  <p className="text-sm font-display text-muted-foreground">NO OUTFIT</p>
                  {currentOutfitId && (
                    <p className="text-xs text-muted-foreground/90">
                      → {getItemLabel(currentOutfitId)} will be returned to inventory
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={!currentOutfitId}
                  onClick={() => handleEquip('')}
                >
                  Unequip
                </Button>
              </div>
            )}

            <TabsContent value="inventory" className="m-0 flex flex-col gap-2">
              {filteredInventory.length > 0 ? (
                filteredInventory.map(([id, count]) => (
                  <OutfitRow
                    key={id}
                    outfitId={id}
                    item={getItem(id)}
                    isCurrent={id === currentOutfitId}
                    sortField={sortConfig.field}
                    badge={
                      <div className="bg-primary/20 text-primary font-display font-bold px-2 md:px-3 py-1 rounded text-sm min-w-[30px] md:min-w-[40px] text-center border border-primary/30">
                        x{count || 0}
                      </div>
                    }
                    onEquip={() => handleEquip(id)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm font-display">
                  {q ? "No outfits found matching criteria" : "No outfits available in inventory"}
                </div>
              )}
            </TabsContent>

            <TabsContent value="equipped" className="m-0 flex flex-col gap-2">
              {filteredDwellerOutfits.length > 0 ? (
                filteredDwellerOutfits.map(({ owner, outfitId }) => {
                  const isExpanded = expandedDwellerId === owner.serializeId;
                  const ownerStats = owner.stats?.stats || [];
                  const item = getItem(outfitId);
                  const isCurrent = outfitId === currentOutfitId;

                  const ownerButton = (
                    <button
                      className="flex items-center gap-1 text-xs font-display text-amber-400/80 hover:text-amber-400 transition-colors"
                      onClick={() => setExpandedDwellerId(isExpanded ? null : owner.serializeId)}
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                      {owner.name} {owner.lastName} · Lvl {owner.experience?.currentLevel || 1} ·
                      {(() => {
                        const roomInfo = dwellerRooms?.get(owner.serializeId);
                        return (
                          <div className="ml-auto text-xs font-display text-right">
                            <span className="text-primary pip-text-glow font-semibold">
                              {roomInfo?.name || 'Wandering'}
                            </span>
                            {roomInfo?.special && roomInfo?.category !== 'Training' && (
                              <span className="text-primary pip-text-glow"> · {roomInfo.special}</span>
                            )}
                          </div>
                        );
                      })()}
                    </button>
                  );

                  return (
                    <div
                      key={`${owner.serializeId}-${outfitId}`}
                      className="border border-border/40 rounded-lg flex flex-col bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 shadow-sm"
                    >
                      <OutfitRow
                        outfitId={outfitId}
                        item={item}
                        isCurrent={isCurrent}
                        sortField={sortConfig.field}
                        badge={<div className="w-[30px] md:w-[40px] flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary/50" title="Equipped" /></div>}
                        ownerInfo={ownerButton}
                        rounded={false}
                        hideBorder={true}
                        onEquip={() => handleEquip(outfitId, owner.serializeId)}
                      />

                      {/* Expandable dweller info below the row inside the card */}
                      {isExpanded && (
                        <div className="px-4 py-2.5 bg-amber-400/5 border-t border-border/30 rounded-b-lg flex items-center gap-4 sm:gap-6 flex-wrap">
                          <span className="text-xs text-muted-foreground font-display shrink-0">
                            Lvl {owner.experience?.currentLevel || 1}
                          </span>
                          <div className="grid grid-cols-7 gap-1 sm:gap-2">
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
                              <div className="ml-auto text-xs font-display text-right mt-2 sm:mt-0">
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
                })
              ) : (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm font-display">
                  {q ? "No outfits found matching criteria" : "No outfits equipped by other dwellers"}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components ---

interface OutfitRowProps {
  outfitId: string;
  item: ReturnType<typeof getItem>;
  isCurrent: boolean;
  sortField?: string | null;
  badge: ReactNode;
  ownerInfo?: ReactNode;
  rounded?: boolean;
  hideBorder?: boolean;
  onEquip: () => void;
}

function OutfitRow({
  outfitId,
  item,
  isCurrent,
  sortField,
  badge,
  ownerInfo,
  rounded = true,
  hideBorder = false,
  onEquip,
}: OutfitRowProps) {
  const label = getItemLabel(outfitId);
  const rarity = item?.rarity;

  return (
    <div
      className={`px-3 sm:px-2 md:px-3 py-2 sm:py-1 md:py-2 transition-all duration-300 flex flex-col sm:grid grid-cols-1 sm:grid-cols-[60px_minmax(100px,2fr)_repeat(7,20px)_40px_80px] gap-2 md:gap-3 items-center ${hideBorder ? '' : 'border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/50 shadow-sm'} ${rounded ? 'rounded-lg' : ''} ${isCurrent ? 'bg-primary/10' : ''}`}
    >
      <div className="flex-shrink-0 flex w-full sm:w-auto items-center justify-start sm:justify-center sm:border-r border-border/30 pb-2 sm:pb-0 pr-2 md:pr-4">
        {badge}
      </div>

      <div className="flex flex-col min-w-0 pr-2 w-full sm:w-auto self-start sm:self-center">
        <p className="text-[14px] md:text-[15px] font-bold truncate text-foreground leading-tight" title={label}>{label}</p>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {rarity && (
            <span className={`text-[10px] md:text-xs font-display uppercase tracking-wider ${rarity === 'Legendary' ? 'text-yellow-400' :
              rarity === 'Rare' ? 'text-blue-400' : 'text-green-400'
              }`}>
              {rarity}
            </span>
          )}
          {ownerInfo}
          {isCurrent && !ownerInfo && (
            <span className="text-[10px] font-display text-primary/60 uppercase shrink-0">
              Equipped
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:contents">
        {SPECIAL_LETTERS.map(key => {
          const val = item?.special?.[key];
          return (
            <div key={key} className="flex justify-center items-center text-sm font-display font-semibold">
              {val ? (
                <span className={`text-sm ${sortField === key ? 'text-amber-400' : 'text-primary'}`}>+{val}</span>
              ) : (
                <span className="text-muted-foreground/20">-</span>
              )}
            </div>
          );
        })}
        <div className="flex justify-center items-center text-sm font-display font-semibold">
          {item?.totalStats ? (
            <span className={`text-sm ${sortField === 'totalStats' ? 'text-amber-400' : 'text-primary'}`}>+{item.totalStats}</span>
          ) : (
            <span className="text-muted-foreground/20">-</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-1 md:gap-2 w-full sm:w-auto">
        <Button
          variant={isCurrent ? 'secondary' : 'default'}
          size="sm"
          className={`h-7 md:h-8 px-2 text-xs w-full sm:w-auto ${!isCurrent ? 'border border-primary hover:bg-background hover:text-primary transition-colors' : ''}`}
          disabled={isCurrent}
          onClick={onEquip}
        >
          {isCurrent ? 'Current' : 'Equip'}
        </Button>
      </div>
    </div>
  );
}
