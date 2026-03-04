import { useState } from 'react';
import { Code, ChevronRight, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RawJsonEditorProps {
  data: any;
  onChange: (data: any) => void;
  path?: string;
  maxDepth?: number;
}

function JsonNode({ 
  label, 
  value, 
  onUpdate, 
  depth = 0 
}: { 
  label: string; 
  value: any; 
  onUpdate: (v: any) => void; 
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);

  if (value === null || value === undefined) {
    return (
      <div className="flex items-center gap-2 py-0.5 pl-2">
        <span className="text-xs text-muted-foreground font-display">{label}:</span>
        <span className="text-xs text-muted-foreground italic">null</span>
      </div>
    );
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value);
    return (
      <div className="pl-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 py-0.5 hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-xs font-display">{label}</span>
          <span className="text-xs text-muted-foreground">({keys.length})</span>
        </button>
        {expanded && (
          <div className="border-l border-border ml-1.5 pl-1">
            {keys.map(key => (
              <JsonNode
                key={key}
                label={key}
                value={value[key]}
                onUpdate={(v) => {
                  const updated = { ...value, [key]: v };
                  onUpdate(updated);
                }}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="pl-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 py-0.5 hover:text-primary transition-colors"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span className="text-xs font-display">{label}</span>
          <span className="text-xs text-muted-foreground">[{value.length}]</span>
        </button>
        {expanded && value.length <= 50 && (
          <div className="border-l border-border ml-1.5 pl-1">
            {value.map((item, i) => (
              <JsonNode
                key={i}
                label={`${i}`}
                value={item}
                onUpdate={(v) => {
                  const updated = [...value];
                  updated[i] = v;
                  onUpdate(updated);
                }}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
        {expanded && value.length > 50 && (
          <div className="text-xs text-muted-foreground pl-4 py-1">
            Tableau trop grand ({value.length} éléments) - modifiez via les onglets dédiés
          </div>
        )}
      </div>
    );
  }

  // Primitive value
  return (
    <div className="flex items-center gap-2 py-0.5 pl-2">
      <span className="text-xs text-muted-foreground font-display min-w-0 truncate">{label}:</span>
      {typeof value === 'boolean' ? (
        <button
          onClick={() => onUpdate(!value)}
          className={`text-xs px-1.5 py-0.5 rounded-sm font-display ${value ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
        >
          {value ? 'true' : 'false'}
        </button>
      ) : typeof value === 'number' ? (
        <Input
          type="number"
          value={value}
          onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
          className="h-6 text-xs w-28"
        />
      ) : (
        <Input
          value={String(value)}
          onChange={(e) => onUpdate(e.target.value)}
          className="h-6 text-xs flex-1 max-w-xs"
        />
      )}
    </div>
  );
}

export function RawJsonEditor({ data, onChange }: RawJsonEditorProps) {
  const topKeys = Object.keys(data);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-4">
        <Code className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-display pip-text-glow">DONNÉES BRUTES</h2>
      </div>

      <div className="max-h-[70vh] overflow-y-auto text-foreground space-y-0">
        {topKeys.map(key => (
          <JsonNode
            key={key}
            label={key}
            value={data[key]}
            onUpdate={(v) => {
              const updated = { ...data, [key]: v };
              onChange(updated);
            }}
          />
        ))}
      </div>
    </div>
  );
}
