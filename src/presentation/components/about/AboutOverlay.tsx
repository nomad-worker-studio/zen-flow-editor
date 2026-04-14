import React from 'react';
import './AboutOverlay.css';
import { i18n } from '../../../application/services/I18nService';

interface AboutOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AboutOverlay: React.FC<AboutOverlayProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="about-overlay-backdrop" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2 className="about-title">{i18n.t('about_title')}</h2>
          <button className="about-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="about-body">
          <section className="about-section">
            <p className="about-desc">{i18n.t('about_desc')}</p>
            <p className="about-version">Version 1.0.0 Stable</p>
          </section>

          <section className="about-section pwa-guide">
            <h3 className="section-title">{i18n.t('pwa_install_title')}</h3>
            <p className="pwa-guide-text">{i18n.t('pwa_install_guide')}</p>
            <div className="pwa-steps">
               <div className="pwa-step-chip">💻 Desktop: ブラウザ上部の「インストール」ボタン、または設定メニューの「保存してインストール」を選択</div>
               <div className="pwa-step-chip">📱 Mobile: ブラウザの「共有」ボタンから「ホーム画面に追加」を選択</div>
            </div>
          </section>

          <section className="about-section">
            <h3 className="section-title">{i18n.t('license_title')}</h3>
            <p className="license-type">{i18n.t('license_text')}</p>
            <div className="credits-list">
              <p>Special thanks to the Open Source Community:</p>
              <ul>
                <li>React (MIT)</li>
                <li>Vite (MIT)</li>
                <li>TypeScript (Apache 2.0)</li>
                <li>ESLint (MIT)</li>
                <li>Ollama Open Source Community</li>
              </ul>
            </div>
          </section>

          <section className="about-section disclaimer">
            <h3 className="section-title">{i18n.t('disclaimer_title')}</h3>
            <p className="disclaimer-text">{i18n.t('disclaimer_text')}</p>
          </section>
        </div>

        <div className="about-footer">
          <p>&copy; 2026 Nomad Worker Studio</p>
        </div>
      </div>
    </div>
  );
};
