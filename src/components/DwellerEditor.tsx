import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Heart, Shield, Zap, Brain, Dumbbell, Footprints, Clover, Search, RotateCcw, HeartPulse, ArrowUp, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ALL_WEAPONS, ALL_OUTFITS, getItemLabel, getItem, formatSpecial } from '@/lib/gameData';
import { toast } from 'sonner';
// Stats array in save: index 0 is unused, real SPECIAL starts at index 1
const STAT_OFFSET = 1;
const STAT_NAMES = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];
const STAT_ICONS = [Dumbbell, Search, Shield, Heart, Brain, Footprints, Clover];

interface DwellerEditorProps {
  dwellers: any[];
  onChange: (dwellers: any[]) => void;
}

type SortOption = 'name' | 'level' | 'S' | 'P' | 'E' | 'C' | 'I' | 'A' | 'L';

export function DwellerEditor({ dwellers, onChange }: DwellerEditorProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDesc, setSortDesc] = useState(false);

  const updateDweller = (index: number, path: string, value: any) => {
    const updated = [...dwellers];
    const keys = path.split('.');
    let obj = updated[index];
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(updated);
  };

  const resetToLevel1 = (index: number) => {
    const updated = [...dwellers];
    const d = updated[index];
    if (d.experience) {
      d.experience.currentLevel = 1;
      d.experience.lastLevelUpdated = 1;
      d.experience.experienceValue = 0;
    }
    if (d.health) {
      d.health.healthValue = 105;
      d.health.maxHealth = 105;
    }
    onChange(updated);
    toast.success('Dweller reset to level 1');
  };

  const optimizeHealth = (index: number) => {
    const updated = [...dwellers];
    const d = updated[index];
    const endurance = d.stats?.stats?.[STAT_OFFSET + 2]?.value ?? 1; // E is 3rd SPECIAL (index 2 + offset)
    const level = d.experience?.currentLevel ?? 1;
    const optimal = 105 + (2.5 + 0.5 * (endurance + 7)) * (level - 1);
    if (d.health) {
      d.health.healthValue = optimal;
      d.health.maxHealth = optimal;
    }
    onChange(updated);
    toast.success(`Health optimized: ${Math.round(optimal)} (E=${endurance}, Lv.${level})`);
  };

  const setLevel50 = (index: number) => {
    const updated = [...dwellers];
    const d = updated[index];
    if (d.experience) {
      d.experience.currentLevel = 50;
      d.experience.lastLevelUpdated = 50;
      d.experience.experienceValue = 2916000;
    }
    const endurance = d.stats?.stats?.[STAT_OFFSET + 2]?.value ?? 1;
    const optimal = 105 + (2.5 + 0.5 * (endurance + 7)) * 49;
    if (d.health) {
      d.health.healthValue = optimal;
      d.health.maxHealth = optimal;
    }
    onChange(updated);
    toast.success(`Dweller set to Lv.50 — HP: ${Math.round(optimal)} (E=${endurance})`);
  };

  const maxAllSpecial = (index: number) => {
    const updated = [...dwellers];
    const d = updated[index];
    if (d.stats?.stats) {
      for (let i = 0; i < 7; i++) {
        if (d.stats.stats[STAT_OFFSET + i]) {
          d.stats.stats[STAT_OFFSET + i].value = 10;
        }
      }
    }
    onChange(updated);
    toast.success('All S.P.E.C.I.A.L. set to 10');
  };

  const getStatValue = (d: any, stat: string): number => {
    const statIndex = STAT_NAMES.indexOf(stat);
    if (statIndex === -1) return 0;
    return d.stats?.stats?.[STAT_OFFSET + statIndex]?.value ?? 0;
  };

  const filtered = dwellers
    .map((d, i) => ({ ...d, _idx: i }))
    .filter(d => {
      const name = `${d.name} ${d.lastName}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        const nameA = `${a.name} ${a.lastName}`.toLowerCase();
        const nameB = `${b.name} ${b.lastName}`.toLowerCase();
        cmp = nameA.localeCompare(nameB);
      } else if (sortBy === 'level') {
        cmp = (a.experience?.currentLevel ?? 0) - (b.experience?.currentLevel ?? 0);
      } else {
        cmp = getStatValue(a, sortBy) - getStatValue(b, sortBy);
      }
      return sortDesc ? -cmp : cmp;
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">DWELLERS ({dwellers.length})</h2>
      </div>

      <Input
        placeholder="Search dwellers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
        {filtered.map((dweller) => {
          const isExpanded = expandedId === dweller._idx;
          const fullName = `${dweller.name} ${dweller.lastName}`.trim();
          const level = dweller.experience?.currentLevel || 0;
          const hp = dweller.health?.healthValue || 0;
          const maxHp = dweller.health?.maxHealth || 0;
          const rarity = dweller.rarity || 'Common';

          return (
            <div key={dweller._idx} className="border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : dweller._idx)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors text-left"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-primary shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                <span className="font-display text-sm flex-1 truncate">{fullName}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-display ${
                  rarity === 'Legendary' ? 'bg-primary/20 text-primary' :
                  rarity === 'Rare' ? 'bg-secondary text-secondary-foreground' :
                  'text-muted-foreground'
                }`}>
                  {rarity === 'Legendary' ? '★' : rarity === 'Rare' ? '◆' : '●'} Lv.{level}
                </span>
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {Math.round(hp)}/{Math.round(maxHp)}
                </span>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-4 border-t border-border bg-card/50">
                  <div className="flex items-center gap-2 pt-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => resetToLevel1(dweller._idx)}>
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Reset Lv.1
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reset to level 1, 105 HP, 0 XP</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => optimizeHealth(dweller._idx)}>
                            <HeartPulse className="w-3.5 h-3.5 mr-1.5" />
                            Optimize HP
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set HP based on E stat: 105 + (2.5 + 0.5×(E+7)) × (LVL-1)</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setLevel50(dweller._idx)}>
                            <ArrowUp className="w-3.5 h-3.5 mr-1.5" />
                            Lv.50
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set dweller to level 50</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => maxAllSpecial(dweller._idx)}>
                            <Star className="w-3.5 h-3.5 mr-1.5" />
                            Max SPECIAL
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set all S.P.E.C.I.A.L. stats to 10</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-display">FIRST NAME</label>
                      <Input value={dweller.name} onChange={(e) => updateDweller(dweller._idx, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">LAST NAME</label>
                      <Input value={dweller.lastName} onChange={(e) => updateDweller(dweller._idx, 'lastName', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-display">HEALTH</label>
                      <Input type="number" value={dweller.health?.healthValue ?? 0}
                        onChange={(e) => updateDweller(dweller._idx, 'health.healthValue', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">MAX HEALTH</label>
                      <Input type="number" value={dweller.health?.maxHealth ?? 0}
                        onChange={(e) => updateDweller(dweller._idx, 'health.maxHealth', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">RADIATION</label>
                      <Input type="number" value={dweller.health?.radiationValue ?? 0}
                        onChange={(e) => updateDweller(dweller._idx, 'health.radiationValue', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-display">HAPPINESS</label>
                      <Input type="number" min={0} max={100} value={dweller.happiness?.happinessValue ?? 0}
                        onChange={(e) => updateDweller(dweller._idx, 'happiness.happinessValue', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">LEVEL</label>
                      <Input type="number" min={1} max={50} value={dweller.experience?.currentLevel ?? 1}
                        onChange={(e) => updateDweller(dweller._idx, 'experience.currentLevel', parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">XP</label>
                      <Input type="number" value={dweller.experience?.experienceValue ?? 0}
                        onChange={(e) => updateDweller(dweller._idx, 'experience.experienceValue', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-display block mb-2">S.P.E.C.I.A.L.</label>
                    <div className="grid grid-cols-4 gap-2">
                      {STAT_NAMES.map((name, si) => {
                        const realIndex = STAT_OFFSET + si;
                        const stat = dweller.stats?.stats?.[realIndex];
                        if (!stat) return null;
                        const Icon = STAT_ICONS[si];
                        return (
                          <div key={si} className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs font-display w-3">{name}</span>
                            <Input type="number" min={1} max={10} value={stat.value}
                              onChange={(e) => {
                                const updated = [...dwellers];
                                updated[dweller._idx].stats.stats[realIndex].value = parseInt(e.target.value) || 1;
                                onChange(updated);
                              }}
                              className="h-7 text-xs" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground font-display">WEAPON</label>
                      <Select
                        value={dweller.equipedWeapon?.id ?? ''}
                        onValueChange={(val) => updateDweller(dweller._idx, 'equipedWeapon.id', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="No weapon">
                            {dweller.equipedWeapon?.id ? getItemLabel(dweller.equipedWeapon.id) : 'No weapon'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {ALL_WEAPONS.map((w) => (
                            <SelectItem key={w.id} value={w.id} className="text-xs">
                              <span className="flex items-center justify-between gap-2 w-full">
                                <span className="truncate">{w.label}</span>
                                {w.damage && <span className="text-muted-foreground shrink-0 ml-1">⚔ {w.damage}</span>}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {dweller.equipedWeapon?.id && getItem(dweller.equipedWeapon.id)?.damage && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">⚔ {getItem(dweller.equipedWeapon.id)!.damage} dmg</p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-display">OUTFIT</label>
                      <Select
                        value={dweller.equipedOutfit?.id ?? ''}
                        onValueChange={(val) => updateDweller(dweller._idx, 'equipedOutfit.id', val)}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="No outfit">
                            {dweller.equipedOutfit?.id ? getItemLabel(dweller.equipedOutfit.id) : 'No outfit'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {ALL_OUTFITS.map((o) => {
                            const sp = formatSpecial(o.special);
                            return (
                              <SelectItem key={o.id} value={o.id} className="text-xs">
                                <span className="flex items-center justify-between gap-2 w-full">
                                  <span className="truncate">{o.label}</span>
                                  {sp && <span className="text-muted-foreground shrink-0 ml-1">{sp}</span>}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {dweller.equipedOutfit?.id && formatSpecial(getItem(dweller.equipedOutfit.id)?.special) && (
                        <p className="text-[10px] text-primary mt-0.5">{formatSpecial(getItem(dweller.equipedOutfit.id)!.special)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
