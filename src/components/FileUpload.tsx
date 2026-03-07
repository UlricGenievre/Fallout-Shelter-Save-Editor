import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { decryptSave } from '@/lib/crypto';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onDataLoaded: (data: any, fileName: string) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
