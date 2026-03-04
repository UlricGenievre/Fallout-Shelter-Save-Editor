import { useState, useCallback } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SaveEditor } from '@/components/SaveEditor';

const Index = () => {
  const [saveData, setSaveData] = useState<any>(null);
  const [fileName, setFileName] = useState('');

  const handleDataLoaded = useCallback((data: any, name: string) => {
    setSaveData(data);
    setFileName(name);
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
