import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/core/FileUpload';
import { SaveEditor } from '@/components/core/SaveEditor';

const Index = () => {
  const [saveData, setSaveData] = useState<any>(null);
  const [fileName, setFileName] = useState('');

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
  }, []);

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
