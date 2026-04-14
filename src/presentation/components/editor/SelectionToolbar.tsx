import React, { useState, useEffect, useRef } from 'react';
import './SelectionToolbar.css';
import { i18n } from '../../../application/services/I18nService';
import type { Language } from '../../../application/services/I18nService';

export const SelectionToolbar: React.FC = () => {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [lang, setLang] = useState<Language>(i18n.getLanguage());
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unselected = i18n.subscribe(newLang => setLang(newLang));
    document.addEventListener('selectionchange', updatePosition);
    return () => {
      unselected();
      document.removeEventListener('selectionchange', updatePosition);
    };
  }, []);

  const updatePosition = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setPosition({
      top: rect.top + window.scrollY - 45,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  };

  const applyCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updatePosition();
  };

  if (!position) return null;

  return (
    <div 
      ref={toolbarRef}
      className="selection-toolbar"
      translate="no"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button className="toolbar-btn" onClick={() => applyCommand('bold')}>
        {lang === 'jp' ? `太字` : `Bold`}
      </button>
      <button className="toolbar-btn" onClick={() => applyCommand('formatBlock', 'h1')}>
        {lang === 'jp' ? `大見出し` : `H1`}
      </button>
      <button className="toolbar-btn" onClick={() => applyCommand('formatBlock', 'h2')}>
        {lang === 'jp' ? `中見出し` : `H2`}
      </button>
      <div className="toolbar-divider" />
      <button className="toolbar-btn" onClick={() => applyCommand('insertUnorderedList')}>
        {lang === 'jp' ? `リスト` : `List`}
      </button>
    </div>
  );
};
