import { useState, useEffect } from 'react';
import { ZenShell } from './presentation/components/layout/ZenShell';
import { ZenEditor } from './presentation/components/editor/ZenEditor';
import { ZenMenu } from './presentation/components/layout/ZenMenu';
import { PrintModal } from './presentation/components/ui/PrintModal';
import { AboutOverlay } from './presentation/components/about/AboutOverlay';
import { persistenceService } from './application/services/PersistenceService';
import './presentation/styles/index.css';

function App() {
  const [content, setContent] = useState<string>(persistenceService.loadFromLocalStorage() || "");
  const [fileHandle, setFileHandle] = useState<any | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [printOptions, setPrintOptions] = useState({ showTitle: true, showPageNumber: true, showDate: true });

  // オートセーブの実行
  useEffect(() => {
    const timer = setTimeout(() => {
      persistenceService.saveToLocalStorage(content);
    }, 3000); // 3秒の沈黙で保存
    return () => clearTimeout(timer);
  }, [content]);

  const handleOpen = (newContent: string, handle: any) => {
    setContent(newContent);
    setFileHandle(handle);
  };

  const handleNew = () => {
    setContent("");
    setFileHandle(null);
  };

  const handleSave = async () => {
    try {
      const handle = await persistenceService.saveFile(content, fileHandle);
      if (handle) setFileHandle(handle);
    } catch {
      // Silent fail
    }
  };

  const handleSaveAs = async () => {
    try {
      const handle = await persistenceService.saveFile(content, null);
      if (handle) setFileHandle(handle);
    } catch {
      // Silent fail
    }
  };

  const handlePrintConfirm = (options: typeof printOptions) => {
    setPrintOptions(options);
    setIsPrintModalOpen(false);
    
    const firstLine = content.replace(/<[^>]*>/g, '').split('\n')[0] || "Untitled";
    document.documentElement.setAttribute('data-print-title', options.showTitle ? firstLine : '');
    document.documentElement.setAttribute('data-print-date', options.showDate ? new Date().toLocaleDateString() : '');
    document.documentElement.classList.toggle('print-show-page', options.showPageNumber);
    
    setTimeout(() => window.print(), 100);
  };

  return (
    <ZenShell>
      <div className="print-only-title">{printOptions.showTitle ? content.replace(/<[^>]*>/g, '').split('\n')[0] : ''}</div>
      <div className="print-only-footer">
        <span className="print-date">{printOptions.showDate ? new Date().toLocaleDateString() : ''}</span>
        <span className="print-page-num"></span>
      </div>

      <ZenMenu 
        onOpen={handleOpen} 
        onNew={handleNew} 
        onSave={handleSave} 
        onSaveAs={handleSaveAs} 
        onExport={() => setIsPrintModalOpen(true)}
        onAbout={() => setIsAboutVisible(true)}
      />
      
      <ZenEditor 
        value={content} 
        onChange={setContent} 
        placeholder="静寂の中で、思考を紡ぐ..."
      />

      {isPrintModalOpen && (
        <PrintModal 
          onClose={() => setIsPrintModalOpen(false)} 
          onConfirm={handlePrintConfirm} 
        />
      )}

      <AboutOverlay 
        isVisible={isAboutVisible} 
        onClose={() => setIsAboutVisible(false)} 
      />
    </ZenShell>
  );
}

export default App;
