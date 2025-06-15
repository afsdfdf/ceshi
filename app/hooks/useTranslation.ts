"use client"

import { useState, useEffect, useCallback } from 'react';
import { 
  Language, 
  Translations, 
  translations, 
  getCurrentLanguage, 
  saveLanguage,
  DEFAULT_LANGUAGE 
} from '@/app/lib/i18n';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [t, setT] = useState<Translations>(translations[DEFAULT_LANGUAGE]);

  // 初始化语言设置
  useEffect(() => {
    const currentLang = getCurrentLanguage();
    setLanguage(currentLang);
    setT(translations[currentLang]);
  }, []);

  // 切换语言
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    setT(translations[newLanguage]);
    saveLanguage(newLanguage);
  }, []);

  // 获取翻译文本的辅助函数
  const getText = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: any = t;
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  }, [t]);

  return {
    language,
    t,
    changeLanguage,
    getText,
    // 便捷的翻译函数
    tr: getText,
  };
}

// 语言选项
export const languageOptions = [
  { value: 'zh' as Language, label: '中文', flag: '🇨🇳' },
  { value: 'en' as Language, label: 'English', flag: '🇺🇸' },
  { value: 'ja' as Language, label: '日本語', flag: '🇯🇵' },
  { value: 'ko' as Language, label: '한국어', flag: '🇰🇷' },
]; 