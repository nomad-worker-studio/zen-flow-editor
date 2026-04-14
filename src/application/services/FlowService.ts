import { FlowManager, FlowStatus } from '../../domain/flow/FlowManager';
import { i18n } from './I18nService';

/**
 * Flow Service (Application Layer)
 * UI とドメインロジック、および ローカル AI (Ollama) 連携を仲介するサービス。
 */
export class FlowService {
  private static instance: FlowService;
  private manager: FlowManager;
  private onHarmoniaIntervention: ((message: string) => void) | null = null;
  
  // 設定値（将来的には環境変数や設定画面から取得）
  private ollamaHost: string = import.meta.env.VITE_OLLAMA_HOST || 'http://localhost:11434';
  private currentModel: string = 'gemma2:2b';

  private constructor() {
    this.manager = new FlowManager(5 * 60 * 1000, {
      onStalled: () => this.handleStall()
    });
    this.manager.startMonitoring();
  }

  public static getInstance(): FlowService {
    if (!FlowService.instance) {
      FlowService.instance = new FlowService();
    }
    return FlowService.instance;
  }

  /**
   * ユーザーの活動を記録
   */
  public notifyActivity(): void {
    this.manager.notifyActivity();
  }

  /**
   * ハルモニアの介入（メッセージ通知）先を登録
   */
  public registerInterventionHandler(handler: (message: string) => void): void {
    this.onHarmoniaIntervention = handler;
  }

  /**
   * AI モデルの切り替え
   */
  public setModel(modelName: string): void {
    this.currentModel = modelName;
  }

  /**
   * AI 接続確認
   */
  public async checkAIConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${this.ollamaHost}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(id);
      return response.ok;
    } catch {
      console.warn("Local AI (Ollama) not detected.");
      return false;
    }
  }

  /**
   * 5分間停滞した時の処理
   */
  private async handleStall(): Promise<void> {
    if (!this.onHarmoniaIntervention) return;

    const isJP = i18n.getLanguage() === 'jp';
    try {
      const prompt = isJP 
        ? "ユーザーの執筆が5分間停滞しました。優しく見守る姿勢で、哲学的な問いかけや励まし（50文字以内）を日本語で生成してください。"
        : "User's writing has stalled for 5 minutes. Generate a gentle, philosophical question or encouragement in one short sentence in English.";
      const response = await this.callOllama(prompt, 'advice');
      this.onHarmoniaIntervention(response);
    } catch (error) {
      console.error("Harmonia stalled intervention failed:", error);
      this.onHarmoniaIntervention(i18n.t('ai_default_prompt'));
    }
  }

  /**
   * 手動での「続きを作成（代筆支援）」
   */
  public async triggerManualHelp(currentText: string = ""): Promise<string> {
    const isJP = i18n.getLanguage() === 'jp';
    try {
      const prompt = isJP
        ? `ユーザーが文章作成に詰まっています。以下の執筆中のテキストの「続き」として、自然で創造的な文章（1〜2文）を作成してください。解説は不要です。文章のみを出力してください。\n\nテキスト:\n${currentText}`
        : `The user is stuck. Generate a natural and creative continuation (1-2 sentences) for the following text. Do not provide commentary, only the continuation text.\n\nText:\n${currentText}`;
      
      const response = await this.callOllama(prompt, 'drafting');
      // 余計な引用符などを除去する簡単なクリーンアップ
      return response.replace(/^["'「]+|["'」]+$/g, '').trim();
    } catch (error) {
      console.error("Harmonia drafting help failed:", error);
      return ""; // 失敗時は空文字を返してUI側で制御
    }
  }

  /**
   * Ollama API へのリクエスト
   */
  private async callOllama(prompt: string, mode: 'advice' | 'drafting' = 'advice'): Promise<string> {
    const isJP = i18n.getLanguage() === 'jp';
    
    let roleDescription = isJP
      ? "あなたは「ハルモニア」です。執筆者を静かに導くエージェントです。"
      : "You are 'Harmonia', an agent who quietly guides the writer.";
      
    let modeConstraint = "";
    if (mode === 'drafting') {
      modeConstraint = isJP
        ? "あなたは代筆者です。解説や挨拶は一切せず、提供されたテキストに続く文章のみを出力してください。"
        : "You are a co-writer. Do not provide any greetings or explanations. Output ONLY the continuation text that follows the provided snippet.";
    } else {
      modeConstraint = isJP
        ? "あなたは賢者です。短く、心に響く助言をしてください。"
        : "You are a sage. Provide short, resonant advice.";
    }

    const systemPrompt = `${roleDescription}\n${modeConstraint}\n${isJP ? "常に日本語で回答してください。" : "Always respond in English."}`;

    const response = await fetch(`${this.ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel,
        prompt: prompt,
        stream: false,
        system: systemPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  public getStatus(): FlowStatus {
    return this.manager.getStatus();
  }

  public setDebugThreshold(ms: number): void {
    this.manager.setThreshold(ms);
  }
}

export const flowService = FlowService.getInstance();
