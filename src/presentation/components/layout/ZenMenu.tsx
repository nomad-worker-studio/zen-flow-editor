import React, { useState, useEffect } from 'react';
import './ZenMenu.css';
import { persistenceService } from '../../../application/services/PersistenceService';
import { i18n, type Language } from '../../../application/services/I18nService';
import { flowService } from '../../../application/services/FlowService';

interface ZenMenuProps {
  onOpen: (content: string, handle: FileSystemFileHandle) => void;
  onNew: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onAbout: () => void;
}

export const ZenMenu: React.FC<ZenMenuProps> = ({ onOpen, onNew, onSave, onSaveAs, onExport, onAbout }) => {
  const [lang, setLang] = useState<Language>(i18n.getLanguage());
  const [isAIReady, setIsAIReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000); 
    const unsub = i18n.subscribe(newLang => setLang(newLang));
    
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    const ready = await flowService.checkAIConnection();
    setIsAIReady(ready);
    setIsChecking(false);
  };

  const handleOpen = async () => {
    try {
      const { content, handle } = await persistenceService.openFile();
      onOpen(content, handle);
    } catch (err) {
      // Silent fail or user cancellation
    }
  };

  const handleClear = () => {
    if (window.confirm(i18n.t('ui_initialization_confirm'))) {
      persistenceService.clearSession();
      onNew();
    }
  };

  const toggleLanguage = () => {
    i18n.setLanguage(lang === 'jp' ? 'en' : 'jp');
  };

  return (
    <div className="zen-menu-container">
      <nav className="zen-menu">
        <button className="zen-menu-item" onClick={onNew}>{i18n.t('menu_new')}</button>
        <button className="zen-menu-item" onClick={handleOpen}>{i18n.t('menu_open')}</button>
        <button className="zen-menu-item" onClick={onSave}>{i18n.t('menu_save')}</button>
        <button className="zen-menu-item" onClick={onSaveAs}>{i18n.t('menu_save_as')}</button>
        <button className="zen-menu-item" onClick={onExport}>{i18n.t('menu_export')}</button>
        <div className="zen-menu-divider" />
        <div className={`ai-status-indicator ${isAIReady ? 'online' : 'offline'} ${isChecking ? 'checking' : ''}`}>
          <span className="lamp-icon">🪔</span>
          <span className="status-text">
            {isAIReady ? i18n.t('ai_status_online') : i18n.t('ai_status_offline')}
          </span>
        </div>
        <button className="zen-menu-item" onClick={onAbout}>{i18n.t('ui_about')}</button>
        <button className="zen-menu-item lang-toggle" onClick={toggleLanguage}>
          {lang.toUpperCase()}
        </button>
        <button className="zen-menu-item danger" onClick={handleClear}>{i18n.t('menu_reset')}</button>
      </nav>
    </div>
  );
};
