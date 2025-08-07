import { ThemeToggle } from '@/components/theme-toggle';
import { Zap } from 'lucide-react';
import LanguageSwitcher from './language-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold">Life Compass</span>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
