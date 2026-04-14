import React, { useState, useEffect } from 'react';
import './ZenShell.css';
import { flowService } from '../../../application/services/FlowService';
import { HarmoniaOverlay } from '../harmonia/HarmoniaOverlay';
import { i18n } from '../../../application/services/I18nService';
import type { Language } from '../../../application/services/I18nService';

interface ZenShellProps {
  children: React.ReactNode;
}

export const ZenShell: React.FC<ZenShellProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIReady, setIsAIReady] = useState(false);
  const [manualMessage, setManualMessage] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState('gemma2:2b');
  const [_lang, setLang] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // 30秒ごとに再確認
    const unsub = i18n.subscribe(newLang => setLang(newLang));
    
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  useEffect(() => {
    const checkAI = async () => {
      const ready = await flowService.checkAIConnection();
      setIsAIReady(ready);
    };
    checkAI();
  }, []);

  const checkConnection = async () => {
    const ready = await flowService.checkAIConnection();
    setIsAIReady(ready);
  };

  const handleHitWall = async () => {
    setIsProcessing(true);
    // 現在のエディタ内のテキストを取得して渡すロジックが必要（後述）
    const editorEl = document.querySelector('.zen-editor') as HTMLElement;
    const currentText = editorEl?.innerText || "";
    
    const result = await flowService.triggerManualHelp(currentText);
    if (result) {
      setManualMessage(result);
    }
    setIsProcessing(false);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    setActiveModel(model);
    flowService.setModel(model);
  };

  return (
    <main className="zen-shell">
      <div className="zen-container">
        {children}
      </div>
      
      {isAIReady && (
        <div className="zen-controls">
          <select className="model-selector" value={activeModel} onChange={handleModelChange}>
            <option value="gemma2:2b">Gemma 2 2B</option>
            <option value="gemma2:9b">Gemma 2 9B</option>
          </select>
          <button 
            className={`hit-wall-btn ${isProcessing ? 'processing' : ''}`}
            onClick={handleHitWall}
            disabled={isProcessing}
          >
            {isProcessing ? i18n.t('ui_thinking') : i18n.t('ui_hit_wall')}
          </button>
        </div>
      )}

      <HarmoniaOverlay />
      
      {/* 手動トリガー時のメッセージ表示用ロジック（ハルモニアに統合可能） */}
      {manualMessage && (
        <div className="manual-help-toast">
          {/* 这里可以复用 HarmoniaOverlay 的逻辑 */}
        </div>
      )}
    </main>
  );
};
