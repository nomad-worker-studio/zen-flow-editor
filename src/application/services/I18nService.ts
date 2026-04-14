/**
 * I18n Service (Application Layer)
 * 多言語対応（日本語/英語）の管理を行う。
 */
export type Language = 'jp' | 'en';

export interface Translations {
  [key: string]: {
    jp: string;
    en: string;
  };
}

const TRANSLATIONS: Translations = {
  // Menu
  menu_new: { jp: '新規作成', en: 'New' },
  menu_open: { jp: '開く', en: 'Open' },
  menu_save: { jp: '保存', en: 'Save' },
  menu_save_as: { jp: '名前を付けて保存', en: 'Save As' },
  menu_reset: { jp: '初期化', en: 'Reset Cache' },
  menu_export: { jp: 'PDF 書き出し', en: 'Export PDF' },
  
  // Print Modal
  print_title: { jp: '印刷設定', en: 'Print Settings' },
  print_page_num: { jp: 'ページ番号を表示', en: 'Show Page Numbers' },
  print_date: { jp: '背景に現在の日付を挿入', en: 'Insert Date' },
  print_doc_title: { jp: '文書タイトルを表示 (1行目)', en: 'Show Document Title (1st Line)' },
  print_execute: { jp: '印刷を開始', en: 'Start Printing' },
  
  // Toolbar
  tool_bold: { jp: '太字', en: 'Bold' },
  tool_h1: { jp: '大見出し', en: 'H1' },
  tool_h2: { jp: '中見出し', en: 'H2' },
  tool_list: { jp: '箇条書き', en: 'List' },
  
  // Shell / AI
  ui_hit_wall: { jp: '続きを作成', en: 'Next Step' },
  ui_thinking: { jp: '思考中...', en: 'Thinking...' },
  ui_insert_text: { jp: '文章を挿入', en: 'Insert Text' },
  ui_placeholder: { jp: '静寂の中で、思考を紡ぐ...', en: 'Spelling thoughts in silence...' },
  ui_about: { jp: 'このアプリについて', en: 'About' },
  about_title: { jp: 'Zen Flow Editor について', en: 'About Zen Flow Editor' },
  about_desc: { 
    jp: 'Zen Flow Editor は、沈黙と集中を尊ぶミニマリストのための執筆環境です。ローカル AI 「ハルモニア」が、あなたの創作のフローを静かに見守ります。', 
    en: 'Zen Flow Editor is a minimalist writing environment for those who value silence and concentration. Local AI "Harmonia" quietly watches over your creative flow.' 
  },
  license_title: { jp: 'ライセンスとクレジット', en: 'License & Credits' },
  license_text: { 
    jp: 'MIT ライセンスに基づき、Nomad Worker Studio によって提供されています。', 
    en: 'Provided by Nomad Worker Studio under the MIT License.' 
  },
  disclaimer_title: { jp: '免責事項', en: 'Disclaimer' },
  disclaimer_text: { 
    jp: '本アプリはローカル環境で動作し、データはブラウザ内に保存されます。AI との対話には Ollama のインストールが必要です。生成されたコンテンツの正確性については責任を負いかねます。', 
    en: 'This app runs locally and data is stored in your browser. Ollama is required for AI interaction. We are not responsible for the accuracy of generated content.' 
  },
  ui_initialization_confirm: { jp: '全てのデータを消去して初期化しますか？', en: 'Clear all data and reset?' },
  
  // Harmonia
  ai_resonance: { jp: 'ハルモニアの共鳴', en: 'Harmonia Resonance' },
  ai_default_prompt: { 
    jp: '少し筆が止まったようです。沈黙は、新しい言葉が生まれるための聖域。今の段落にある『問い』を、一度声に出してみませんか？',
    en: 'Words seem to have paused. Silence is the sanctuary where new words are born. Why not speak the "question" in your current paragraph out loud once?'
  },
  ai_not_found_title: { jp: 'ハルモニアの不在', en: 'Absence of Harmonia' },
  ai_not_found_msg: { 
    jp: 'ローカル AI (Ollama) が見つかりませんでした。現在はオフラインモードで動作しています。', 
    en: 'Local AI (Ollama) not detected. Operating in offline mode.' 
  },
  ai_status_online: { jp: 'ハルモニア接続中', en: 'Harmonia Connected' },
  ai_status_offline: { jp: '静寂モード', en: 'Silence Mode' },
  pwa_install_title: { jp: 'アプリとしてインストール', en: 'Install as App' },
  pwa_install_guide: { 
    jp: 'ブラウザの「インストール」ボタン、または「ホーム画面に追加」から、スタンドアロンアプリとして利用できます。', 
    en: 'Use as a standalone app via the "Install" button or "Add to Home Screen" in your browser.' 
  },
  dismiss: { jp: '閉じる', en: 'Dismiss' }
};

export class I18nService {
  private static instance: I18nService;
  private currentLanguage: Language = 'jp';
  private listeners: Array<(lang: Language) => void> = [];

  private constructor() {
    const saved = localStorage.getItem('zen-language') as Language;
    if (saved) this.currentLanguage = saved;
    this.syncHtmlLang(this.currentLanguage);
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('zen-language', lang);
    this.syncHtmlLang(lang);
    this.listeners.forEach(cb => cb(lang));
  }

  private syncHtmlLang(lang: Language): void {
    // jp -> ja, en -> en
    const htmlLang = lang === 'jp' ? 'ja' : 'en';
    document.documentElement.lang = htmlLang;
  }

  public t(key: string): string {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[this.currentLanguage];
  }

  public subscribe(cb: (lang: Language) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }
}

export const i18n = I18nService.getInstance();
