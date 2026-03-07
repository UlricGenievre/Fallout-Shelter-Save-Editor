import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Heart, Shield, Zap, Brain, Dumbbell, Footprints, Clover, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ALL_WEAPONS, ALL_OUTFITS, getItemLabel } from '@/lib/gameData';

const STAT_NAMES = ['S', 'P', 'E', 'C', 'I', 'A', 'L', '?'];
const STAT_ICONS = [Dumbbell, Search, Shield, Heart, Brain, Footprints, Clover, Zap];

interface DwellerEditorProps {
  dwellers: any[];
  onChange: (dwellers: any[]) => void;
}

export function DwellerEditor({ dwellers, onChange }: DwellerEditorProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filtered = dwellers
    .map((d, i) => ({ ...d, _idx: i }))
    .filter(d => {
      const name = `${d.name} ${d.lastName}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
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
                  <div className="grid grid-cols-2 gap-3 pt-3">
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
                      {dweller.stats?.stats?.map((stat: any, si: number) => {
                        if (si >= 7) return null;
                        const Icon = STAT_ICONS[si];
                        return (
                          <div key={si} className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs font-display w-3">{STAT_NAMES[si]}</span>
                            <Input type="number" min={1} max={10} value={stat.value}
                              onChange={(e) => {
                                const updated = [...dwellers];
                                updated[dweller._idx].stats.stats[si].value = parseInt(e.target.value) || 1;
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
                              {w.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          {ALL_OUTFITS.map((o) => (
                            <SelectItem key={o.id} value={o.id} className="text-xs">
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
