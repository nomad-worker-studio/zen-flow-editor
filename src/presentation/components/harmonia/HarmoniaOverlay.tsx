import React, { useState, useEffect } from 'react';
import './HarmoniaOverlay.css';
import { flowService } from '../../../application/services/FlowService';
import { i18n } from '../../../application/services/I18nService';

export const HarmoniaOverlay: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 通常のハルモニア介入（代筆支援など）
    flowService.registerInterventionHandler((msg) => {
      setMessage(msg);
      setStatusMsg(null);
      setIsVisible(true);
    });

    // システム状態通知（AIが見つからない等）
    const handleStatus = (e: any) => {
      setStatusMsg(e.detail);
      setMessage(null);
      setIsVisible(true);
    };

    window.addEventListener('zen:harmonia-status', handleStatus);
    return () => window.removeEventListener('zen:harmonia-status', handleStatus);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setMessage(null);
    setStatusMsg(null);
  };

  const handleInsert = () => {
    if (message) {
      window.dispatchEvent(new CustomEvent('zen:insert-text', { detail: message }));
      handleClose();
    }
  };

  if (!isVisible || (!message && !statusMsg)) return null;

  const displayTitle = statusMsg ? i18n.t('ai_not_found_title') : i18n.t('ai_resonance');
  const displayText = statusMsg || message;

  return (
    <div className={`harmonia-overlay ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="harmonia-card">
        <div className="harmonia-content">
          <h3 className="harmonia-title">{displayTitle}</h3>
          <p className="harmonia-message">{displayText}</p>
          <div className="harmonia-actions">
            {message && (
              <button className="harmonia-btn highlight" onClick={handleInsert}>
                {i18n.t('ui_insert_text')}
              </button>
            )}
            <button className="harmonia-btn" onClick={handleClose}>
              {i18n.t('dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
