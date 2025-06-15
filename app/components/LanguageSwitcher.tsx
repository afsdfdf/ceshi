"use client"

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, languageOptions } from '@/app/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showFlag?: boolean;
}

export default function LanguageSwitcher({ 
  className, 
  variant = 'default',
  showFlag = true 
}: LanguageSwitcherProps) {
  const { language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = languageOptions.find(option => option.value === language);

  const handleLanguageChange = (newLanguage: string) => {
    changeLanguage(newLanguage as any);
    setIsOpen(false);
  };

  if (variant === 'icon-only') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-9 h-9 rounded-lg transition-all duration-200",
              "hover:bg-accent/50 focus:ring-2 focus:ring-primary/50",
              className
            )}
          >
            <Globe className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languageOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                language === option.value && "bg-accent"
              )}
            >
              {showFlag && <span className="text-lg">{option.flag}</span>}
              <span className="flex-1">{option.label}</span>
              {language === option.value && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 gap-1 rounded-lg transition-all duration-200",
              "hover:bg-accent/50 focus:ring-2 focus:ring-primary/50",
              className
            )}
          >
            {showFlag && currentOption && (
              <span className="text-sm">{currentOption.flag}</span>
            )}
            <span className="text-xs font-medium">
              {currentOption?.value.toUpperCase() || 'ZH'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languageOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                language === option.value && "bg-accent"
              )}
            >
              {showFlag && <span className="text-sm">{option.flag}</span>}
              <span className="flex-1 text-sm">{option.label}</span>
              {language === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-10 px-3 gap-2 rounded-lg transition-all duration-200",
            "hover:bg-accent/50 focus:ring-2 focus:ring-primary/50",
            className
          )}
        >
          <Globe className="w-4 h-4" />
          {showFlag && currentOption && (
            <span>{currentOption.flag}</span>
          )}
          <span className="font-medium">
            {currentOption?.label || '中文'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {languageOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleLanguageChange(option.value)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-2.5",
              language === option.value && "bg-accent"
            )}
          >
            {showFlag && <span className="text-lg">{option.flag}</span>}
            <span className="flex-1">{option.label}</span>
            {language === option.value && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 