import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileUpload } from '@/components/core/FileUpload';
import { SaveEditor } from '@/components/core/SaveEditor';

const Index = () => {
  const [, setSearchParams] = useSearchParams();
  const [saveData, setSaveData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('vault-tec-last-save');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to load save from localStorage', e);
      return null;
    }
  });
  const [fileName, setFileName] = useState(() => localStorage.getItem('vault-tec-last-name') || '');

  const handleDataLoaded = useCallback((data: any, name: string) => {
    setSaveData(data);
    setFileName(name);
    try {
      localStorage.setItem('vault-tec-last-save', JSON.stringify(data));
      localStorage.setItem('vault-tec-last-name', name);
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSaveData(null);
    setFileName('');
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  if (saveData) {
    return <SaveEditor initialData={saveData} fileName={fileName} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen scanline">
      <FileUpload onDataLoaded={handleDataLoaded} />
    </div>
  );
};

export default Index;
