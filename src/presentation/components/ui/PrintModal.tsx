import React, { useState } from 'react';
import './PrintModal.css';
import { i18n } from '../../../application/services/I18nService';

interface PrintOptions {
  showTitle: boolean;
  showPageNumber: boolean;
  showDate: boolean;
}

interface PrintModalProps {
  onClose: () => void;
  onConfirm: (options: PrintOptions) => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ onClose, onConfirm }) => {
  const [options, setOptions] = useState<PrintOptions>({
    showTitle: true,
    showPageNumber: true,
    showDate: true,
  });

  const handleToggle = (key: keyof PrintOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="print-modal-overlay" onClick={onClose}>
      <div className="print-modal" onClick={e => e.stopPropagation()}>
        <h2>{i18n.t('print_title')}</h2>
        
        <div className="print-options">
          <label className="print-option-label">
            <input 
              type="checkbox" 
              checked={options.showTitle} 
              onChange={() => handleToggle('showTitle')} 
            />
            {i18n.t('print_doc_title')}
          </label>
          
          <label className="print-option-label">
            <input 
              type="checkbox" 
              checked={options.showPageNumber} 
              onChange={() => handleToggle('showPageNumber')} 
            />
            {i18n.t('print_page_num')}
          </label>
          
          <label className="print-option-label">
            <input 
              type="checkbox" 
              checked={options.showDate} 
              onChange={() => handleToggle('showDate')} 
            />
            {i18n.t('print_date')}
          </label>
        </div>

        <div className="print-actions">
          <button className="btn-print" onClick={() => onConfirm(options)}>
            {i18n.t('print_execute')}
          </button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
