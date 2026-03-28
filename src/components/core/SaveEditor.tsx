import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, ArrowLeft, FileJson, FileType, Terminal, Eye, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { encryptSave } from '@/lib/crypto';
import { CommonEditor } from '../editors/CommonEditor';
import { VaultEditor } from '../vault/VaultEditor';
import { toast } from 'sonner';

interface SaveEditorProps {
  initialData: any;
  fileName: string;
  onBack: () => void;
}

export function SaveEditor({ initialData, fileName, onBack }: SaveEditorProps) {
  const [data, setData] = useState<any>(initialData);
  const [searchParams, setSearchParams] = useSearchParams();
  const isVaultMode = searchParams.get('mode') !== 'editor';
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const dwellersCount = data?.dwellers?.dwellers?.length || 0;
  const capsCount = data?.vault?.storage?.resources?.Nuka || 0;

  const downloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.sav', '.json');
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON file downloaded');
    setOpen(false);
  }, [data, fileName]);

  const downloadEncrypted = useCallback(async () => {
    setSaving(true);
    try {
      const jsonStr = JSON.stringify(data);
      const encrypted = await encryptSave(jsonStr);
      const blob = new Blob([encrypted], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.sav') ? fileName : fileName.replace('.json', '.sav');
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Encrypted .sav file downloaded');
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Encryption error');
    } finally {
      setSaving(false);
    }
  }, [data, fileName]);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-border px-4 py-3 flex items-center gap-4 bg-card/50 scanline">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-lg pip-text-glow tracking-wider">{fileName}</h1>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{dwellersCount} dwellers</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-primary" />
              {Math.round(capsCount).toLocaleString()} Caps
            </span>
          </div>
        </div>

        <Button
          size="sm"
          variant={isVaultMode ? "outline" : "default"}
          className="gap-2 font-display tracking-wider"
          onClick={() => setSearchParams(prev => {
            prev.set('mode', isVaultMode ? 'editor' : 'vault');
            prev.delete('tab');
            return prev;
          })}
        >
          {isVaultMode ? (
            <>
              <Terminal className="w-4 h-4" />
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
            </>
          )}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={saving} aria-label="Download save file">
              <Download className="w-3.5 h-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wider pip-text-glow">EXPORT FORMAT</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-24"
                onClick={downloadJson}
              >
                <FileJson className="w-8 h-8 text-primary" />
                <span>JSON</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-24"
                onClick={downloadEncrypted}
              >
                <FileType className="w-8 h-8 text-primary" />
                <span>.SAV</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isVaultMode ? (
          <VaultEditor data={data} setData={setData} />
        ) : (
          <CommonEditor data={data} setData={setData} />
        )}
      </main>
    </div>
  );
}
