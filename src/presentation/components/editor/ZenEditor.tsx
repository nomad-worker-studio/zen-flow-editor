import React, { useRef, useEffect } from 'react';
import './ZenEditor.css';
import { flowService } from '../../../application/services/FlowService';
import { SelectionToolbar } from './SelectionToolbar';

interface ZenEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ZenEditor: React.FC<ZenEditorProps> = ({ value, onChange, placeholder = "言葉を紡ぎましょう..." }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    const handleInsert = (e: any) => {
      const text = e.detail;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertText', false, text);
        onChange(editorRef.current.innerHTML);
      }
    };

    window.addEventListener('zen:insert-text', handleInsert);
    return () => window.removeEventListener('zen:insert-text', handleInsert);
  }, [onChange]);

  // Synchronize internal state with external value if needed (controlled component)
  useEffect(() => {
    // 変換中（Composition中）は外部からの同期をスキップして入力を保護する
    if (isComposing.current) return;

    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value === "") {
        editorRef.current.innerHTML = "";
      } else {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    // 変換中は親への通知を待機する（IME確定時に一気に送る）
    if (isComposing.current) return;

    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      flowService.notifyActivity();
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
    // 確定したので親の状態を更新
    handleInput();
  };

  return (
    <div className="zen-editor-wrapper">
      <SelectionToolbar />
      <div
        ref={editorRef}
        className="zen-editor zen-serif"
        contentEditable
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};
