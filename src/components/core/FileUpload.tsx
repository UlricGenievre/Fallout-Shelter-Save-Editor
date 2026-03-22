import { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { decryptSave } from '@/lib/crypto';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'vault-tec-last-save';
const STORAGE_NAME_KEY = 'vault-tec-last-name';

interface FileUploadProps {
  onDataLoaded: (data: any, fileName: string) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLastSave, setHasLastSave] = useState(false);
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem(STORAGE_NAME_KEY);
    if (name && localStorage.getItem(STORAGE_KEY)) {
      setHasLastSave(true);
      setLastName(name);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();

      if (file.name.endsWith('.sav')) {
        const decrypted = await decryptSave(text);
        const json = JSON.parse(decrypted);
        onDataLoaded(json, file.name);
      } else if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        onDataLoaded(json, file.name);
      } else {
        setError('Unsupported format. Please use a .sav or .json file.');
      }
    } catch (e) {
      console.error(e);
      setError('Error decrypting/parsing the file. Please check that it is valid.');
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const loadLastSave = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const name = localStorage.getItem(STORAGE_NAME_KEY);
      if (raw && name) {
        const json = JSON.parse(raw);
        onDataLoaded(json, name);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load last save from storage.');
    }
  }, [onDataLoaded]);

  const clearLastSave = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_NAME_KEY);
    setHasLastSave(false);
    setLastName('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-display pip-text-glow tracking-wider">
          VAULT-TEC SAVE EDITOR
        </h1>
        <p className="text-muted-foreground text-lg">
          Decrypt, edit and re-encode your Fallout Shelter save files
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full max-w-lg border-2 border-dashed border-border hover:border-primary/60 rounded-lg p-12 flex flex-col items-center gap-4 transition-colors cursor-pointer scanline"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {loading ? (
          <div className="animate-flicker">
            <FileText className="w-12 h-12 text-primary" />
            <p className="text-foreground font-display mt-3">DECRYPTING...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div className="text-center space-y-1">
              <p className="text-foreground font-display">DROP YOUR FILE HERE</p>
              <p className="text-muted-foreground text-sm">or click to browse</p>
              <p className="text-muted-foreground text-xs mt-2">.sav (encrypted) or .json (decrypted)</p>
            </div>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept=".sav,.json"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {hasLastSave && (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadLastSave} className="font-display tracking-wider">
            <RotateCcw className="w-4 h-4 mr-2" />
            REOPEN: {lastName}
          </Button>
          <Button variant="ghost" size="icon" onClick={clearLastSave} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}