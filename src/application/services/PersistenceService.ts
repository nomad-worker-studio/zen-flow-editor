/**
 * Persistence Service (Application Layer)
 * 執筆データのオートセーブ、およびローカルファイルシステムとの連携を管理する。
 */
export class PersistenceService {
  private static instance: PersistenceService;
  private STORAGE_KEY = 'zen-flow-last-session';
  private fileHandle: any | null = null;

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  /**
   * LocalStorage へのオートセーブ
   */
  public saveToLocalStorage(content: string): void {
    localStorage.setItem(this.STORAGE_KEY, content);
  }

  /**
   * LocalStorage からの復元
   */
  public loadFromLocalStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * ファイルブラウザを開いて読み込む
   */
  public async openFile(): Promise<{ content: string; handle: any }> {
    // @ts-ignore (File System Access API is modern)
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'Markdown Files', accept: { 'text/markdown': ['.md', '.txt'] } }],
    });
    const file = await handle.getFile();
    const content = await file.text();
    this.fileHandle = handle;
    return { content, handle };
  }

  /**
   * 現在のハンドルに上書き保存、または新規保存
   * サポート外ブラウザ（Firefox等）では自動的に通常のダウンロードへフォールバック
   */
  public async saveFile(content: string, handle: any = null): Promise<any> {
    const targetHandle = handle || this.fileHandle;
    
    // File System Access API のチェック
    // @ts-ignore
    if (typeof window.showSaveFilePicker !== 'function') {
      console.warn("File System Access API not supported. Falling back to legacy download.");
      this.legacyDownload(content, 'zen-draft.md');
      return null;
    }

    let finalHandle: any;
    try {
      if (!targetHandle) {
        // @ts-ignore
        finalHandle = await window.showSaveFilePicker({
          suggestedName: 'zen-draft.md',
          types: [{ description: 'Markdown Files', accept: { 'text/markdown': ['.md'] } }],
        });
      } else {
        finalHandle = targetHandle;
      }

      // @ts-ignore
      const writable = await finalHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      this.fileHandle = finalHandle;
      return finalHandle;
    } catch (err: any) {
      if (err.name === 'AbortError') return null; // ユーザーキャンセル
      throw err;
    }
  }

  /**
   * サポート外環境向け：ブラウザ標準のダウンロードを発火
   */
  private legacyDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  public clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.fileHandle = null;
  }
}

export const persistenceService = PersistenceService.getInstance();
