import { useState, useCallback } from 'react';
import { Download, Upload, Users, Package, Code, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { encryptSave } from '@/lib/crypto';
import { DwellerEditor } from './DwellerEditor';
import { ResourcesEditor } from './ResourcesEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { toast } from 'sonner';

type Tab = 'dwellers' | 'resources' | 'raw';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'dwellers', label: 'HABITANTS', icon: Users },
  { id: 'resources', label: 'RESSOURCES', icon: Package },
  { id: 'raw', label: 'BRUT', icon: Code },
];

interface SaveEditorProps {
  initialData: any;
  fileName: string;
  onBack: () => void;
}

export function SaveEditor({ initialData, fileName, onBack }: SaveEditorProps) {
  const [data, setData] = useState<any>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('dwellers');
  const [saving, setSaving] = useState(false);

  const dwellers = data?.dwellers?.dwellers || [];

  const updateDwellers = useCallback((newDwellers: any[]) => {
    setData((prev: any) => ({
      ...prev,
      dwellers: { ...prev.dwellers, dwellers: newDwellers }
    }));
  }, []);

  const downloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.sav', '.json');
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier JSON téléchargé');
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
      toast.success('Fichier .sav chiffré téléchargé');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chiffrement');
    } finally {
      setSaving(false);
    }
  }, [data, fileName]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-4 bg-card/50 scanline">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-lg pip-text-glow tracking-wider">{fileName}</h1>
          <p className="text-xs text-muted-foreground">{dwellers.length} habitants</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadJson}>
          <Download className="w-3.5 h-3.5 mr-1.5" />
          JSON
        </Button>
        <Button size="sm" onClick={downloadEncrypted} disabled={saving}>
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {saving ? 'Chiffrement...' : '.SAV'}
        </Button>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-border bg-card/30">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-display transition-colors border-b-2 ${
              activeTab === id
                ? 'border-primary text-primary pip-text-glow'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'dwellers' && (
            <DwellerEditor dwellers={dwellers} onChange={updateDwellers} />
          )}
          {activeTab === 'resources' && (
            <ResourcesEditor data={data} onChange={setData} />
          )}
          {activeTab === 'raw' && (
            <RawJsonEditor data={data} onChange={setData} />
          )}
        </div>
      </main>
    </div>
  );
}
