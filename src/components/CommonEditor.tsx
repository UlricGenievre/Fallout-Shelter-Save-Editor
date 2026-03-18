import { useState, useCallback } from 'react';
import { Users, Package, Code, FlaskConical } from 'lucide-react';
import { DwellerEditor } from './DwellerEditor';
import { ResourcesEditor } from './ResourcesEditor';
import { RawJsonEditor } from './RawJsonEditor';
import { RecipesEditor } from './RecipesEditor';

type Tab = 'dwellers' | 'resources' | 'recipes' | 'raw';

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'dwellers', label: 'DWELLERS', icon: Users },
  { id: 'resources', label: 'RESOURCES', icon: Package },
  { id: 'recipes', label: 'RECIPES', icon: FlaskConical },
  { id: 'raw', label: 'RAW', icon: Code },
];

interface CommonEditorProps {
  data: any;
  setData: (data: any) => void;
}

export function CommonEditor({ data, setData }: CommonEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dwellers');

  const dwellers = data?.dwellers?.dwellers || [];

  const updateDwellers = useCallback((newDwellers: any[]) => {
    setData({
      ...data,
      dwellers: { ...data.dwellers, dwellers: newDwellers }
    });
  }, [data, setData]);

  return (
    <>
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

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'dwellers' && (
            <DwellerEditor dwellers={dwellers} onChange={updateDwellers} />
          )}
          {activeTab === 'resources' && (
            <ResourcesEditor data={data} onChange={setData} />
          )}
          {activeTab === 'recipes' && (
            <RecipesEditor data={data} onChange={setData} />
          )}
          {activeTab === 'raw' && (
            <RawJsonEditor data={data} onChange={setData} />
          )}
        </div>
      </div>
    </>
  );
}
