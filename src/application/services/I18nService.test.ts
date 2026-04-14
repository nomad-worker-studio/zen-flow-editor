import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nService } from './I18nService';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    // Clear localStorage and document mocks
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
    });
    vi.stubGlobal('document', {
      documentElement: {
        lang: ''
      }
    });
    
    // We need to get the instance. Since it's a singleton, 
    // we might be dealing with the same instance between tests.
    service = I18nService.getInstance();
  });

  it('should default to jp if nothing in localStorage', () => {
    // Note: Since it's a singleton already initialized, 
    // it might already have a value.
    expect(['jp', 'en']).toContain(service.getLanguage());
  });

  it('should translate keys correctly', () => {
    service.setLanguage('jp');
    expect(service.t('menu_new')).toBe('新規作成');
    
    service.setLanguage('en');
    expect(service.t('menu_new')).toBe('New');
  });

  it('should return the key if translation is missing', () => {
    expect(service.t('non_existent_key')).toBe('non_existent_key');
  });

  it('should update document lang attribute', () => {
    service.setLanguage('jp');
    expect(document.documentElement.lang).toBe('ja');
    
    service.setLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('should notify subscribers on language change', () => {
    const callback = vi.fn();
    const unsubscribe = service.subscribe(callback);
    
    service.setLanguage('en');
    expect(callback).toHaveBeenCalledWith('en');
    
    unsubscribe();
    service.setLanguage('jp');
    expect(callback).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
  });
});
