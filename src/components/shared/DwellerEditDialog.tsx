import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCcw, HeartPulse, ArrowUp, Star } from 'lucide-react';
import { ALL_WEAPONS, ALL_OUTFITS, getItemLabel, getItem, formatSpecial } from '@/lib/gameData';
import { toast } from 'sonner';

const STAT_OFFSET = 1;
const STAT_NAMES = ['S', 'P', 'E', 'C', 'I', 'A', 'L'];

interface DwellerEditDialogProps {
  open: boolean;
  onClose: () => void;
  dweller: any;
  onSave: (dwellerId: number, changes: any) => void;
}

export function DwellerEditDialog({ open, onClose, dweller, onSave }: DwellerEditDialogProps) {
  const [localDweller, setLocalDweller] = useState<any>(null);

  useEffect(() => {
    if (open && dweller) {
      setLocalDweller(JSON.parse(JSON.stringify(dweller)));
    }
  }, [open, dweller]);

  if (!localDweller) return null;

  const updateDweller = (path: string, value: any) => {
    const updated = { ...localDweller };
    const keys = path.split('.');
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setLocalDweller(updated);
  };

  const resetToLevel1 = () => {
    const updated = { ...localDweller };
    if (!updated.experience) updated.experience = {};
    updated.experience.currentLevel = 1;
    updated.experience.lastLevelUpdated = 1;
    updated.experience.experienceValue = 0;

    if (!updated.health) updated.health = {};
    updated.health.healthValue = 105;
    updated.health.maxHealth = 105;

    setLocalDweller(updated);
    toast.success('Dweller reset to level 1');
  };

  const optimizeHealth = () => {
    const updated = { ...localDweller };
    const endurance = updated.stats?.stats?.[STAT_OFFSET + 2]?.value ?? 1;
    const level = updated.experience?.currentLevel ?? 1;
    const optimal = 105 + (2.5 + 0.5 * (endurance + 7)) * (level - 1);

    if (!updated.health) updated.health = {};
    updated.health.healthValue = optimal;
    updated.health.maxHealth = optimal;

    setLocalDweller(updated);
    toast.success(`Health optimized: ${Math.round(optimal)} (E=${endurance}, Lv.${level})`);
  };

  const setLevel50 = () => {
    const updated = { ...localDweller };
    if (!updated.experience) updated.experience = {};
    updated.experience.currentLevel = 50;
    updated.experience.lastLevelUpdated = 50;
    updated.experience.experienceValue = 2916000;

    const endurance = updated.stats?.stats?.[STAT_OFFSET + 2]?.value ?? 1;
    const optimal = 105 + (2.5 + 0.5 * (endurance + 7)) * 49;

    if (!updated.health) updated.health = {};
    updated.health.healthValue = optimal;
    updated.health.maxHealth = optimal;

    setLocalDweller(updated);
    toast.success(`Dweller set to Lv.50 — HP: ${Math.round(optimal)} (E=${endurance})`);
  };

  const maxAllSpecial = () => {
    const updated = { ...localDweller };
    if (!updated.stats) updated.stats = { stats: [] };
    for (let i = 0; i < 7; i++) {
      if (updated.stats.stats[STAT_OFFSET + i]) {
        updated.stats.stats[STAT_OFFSET + i].value = 10;
      } else {
        updated.stats.stats[STAT_OFFSET + i] = { value: 10 };
      }
    }
    setLocalDweller(updated);
    toast.success('All S.P.E.C.I.A.L. set to 10');
  };

  const handleSave = () => {
    onSave(dweller.serializeId, localDweller);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider pip-text-glow uppercase">
            EDIT DWELLER: {localDweller.name} {localDweller.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={resetToLevel1}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset Lv.1
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to level 1, 105 HP, 0 XP</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={optimizeHealth}>
                    <HeartPulse className="w-3.5 h-3.5 mr-1.5" />
                    Optimize HP
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set HP based on current E stat: 105 + (2.5 + 0.5×(E+7)) × (LVL-1)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={setLevel50}>
                    <ArrowUp className="w-3.5 h-3.5 mr-1.5" />
                    Lv.50
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Set dweller to level 50</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={maxAllSpecial}>
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
              <Input value={localDweller.name || ''} onChange={(e) => updateDweller('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display">LAST NAME</label>
              <Input value={localDweller.lastName || ''} onChange={(e) => updateDweller('lastName', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-display">HEALTH</label>
              <Input type="number" value={Math.round(localDweller.health?.healthValue ?? 0)}
                onChange={(e) => updateDweller('health.healthValue', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display">MAX HEALTH</label>
              <Input type="number" value={Math.round(localDweller.health?.maxHealth ?? 0)}
                onChange={(e) => updateDweller('health.maxHealth', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display">RADIATION</label>
              <Input type="number" value={Math.round(localDweller.health?.radiationValue ?? 0)}
                onChange={(e) => updateDweller('health.radiationValue', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div className="grid grid-cols-1 grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-display">HAPPINESS</label>
              <Input type="number" min={0} max={100} value={Math.round(localDweller.happiness?.happinessValue ?? 0)}
                onChange={(e) => updateDweller('happiness.happinessValue', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display">LEVEL</label>
              <Input type="number" min={1} max={50} value={localDweller.experience?.currentLevel ?? 1}
                onChange={(e) => updateDweller('experience.currentLevel', parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display">XP</label>
              <Input type="number" value={localDweller.experience?.experienceValue ?? 0}
                onChange={(e) => updateDweller('experience.experienceValue', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-display block mb-2">S.P.E.C.I.A.L.</label>
            <div className="grid grid-cols-4 grid-cols-7 gap-2">
              {STAT_NAMES.map((name, si) => {
                const realIndex = STAT_OFFSET + si;
                const stat = localDweller.stats?.stats?.[realIndex];
                return (
                  <div key={name} className="flex flex-col items-center gap-1 bg-card/30 p-0 rounded border border-border/30">
                    <span className="text-lg font-display text-primary">{name}</span>
                    <Input type="number" min={1} max={10} value={stat?.value || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateDweller(`stats.stats.${realIndex}.value`, val);
                      }}
                      className="h-7 text-xs text-center p-0" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-display flex justify-between">
                <span>WEAPON</span>
              </label>
              <Select
                value={localDweller.equipedWeapon?.id ?? ''}
                onValueChange={(val) => updateDweller('equipedWeapon.id', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="No weapon">
                    {localDweller.equipedWeapon?.id ? getItemLabel(localDweller.equipedWeapon.id) : 'No weapon'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">No weapon</SelectItem>
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
              {localDweller.equipedWeapon?.id && localDweller.equipedWeapon?.id !== 'none' && getItem(localDweller.equipedWeapon.id)?.damage && (
                <p className="text-[10px] text-muted-foreground mt-0.5">⚔ {getItem(localDweller.equipedWeapon.id)!.damage} dmg</p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-display flex justify-between">
                <span>OUTFIT</span>
              </label>
              <Select
                value={localDweller.equipedOutfit?.id ?? ''}
                onValueChange={(val) => updateDweller('equipedOutfit.id', val)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="No outfit">
                    {localDweller.equipedOutfit?.id ? getItemLabel(localDweller.equipedOutfit.id) : 'No outfit'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">No outfit</SelectItem>
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
              {localDweller.equipedOutfit?.id && localDweller.equipedOutfit?.id !== 'none' && formatSpecial(getItem(localDweller.equipedOutfit.id)?.special) && (
                <p className="text-[10px] text-primary mt-0.5">{formatSpecial(getItem(localDweller.equipedOutfit.id)!.special)}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
