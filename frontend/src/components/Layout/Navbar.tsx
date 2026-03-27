import { Menu, Moon, Search, Settings, Sun, UserCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import arFlag from '@/assets/flags/sa.svg';
import enFlag from '@/assets/flags/gb.svg';
import nlFlag from '@/assets/flags/nl.svg';
import urFlag from '@/assets/flags/pk.svg';
import { useTheme } from '@/components/Theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n/LanguageProvider';
import type { SupportedLanguage } from '@/i18n/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  onOpenSidebar: () => void;
}

const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  en: enFlag,
  nl: nlFlag,
  ur: urFlag,
  ar: arFlag,
};

const LANGUAGE_FLAG_ALT: Record<SupportedLanguage, string> = {
  en: 'English',
  nl: 'Dutch',
  ur: 'Urdu',
  ar: 'Arabic',
};

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isRtl, language, languageOptions, setLanguage, t } = useI18n();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button className="md:hidden" size="icon" variant="outline" onClick={onOpenSidebar}>
            <Menu className="h-4 w-4" />
          </Button>

          <div className="relative w-[220px] sm:w-[300px] lg:w-[380px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              className="h-10 bg-card pl-9"
              placeholder={t('common.search', 'Search...')}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setLanguageMenuOpen((open) => !open)}
              className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-input bg-background px-2 text-base hover:bg-secondary"
              aria-label={t('common.language', 'Language')}
              title={t('common.language', 'Language')}
            >
              <img
                src={LANGUAGE_FLAGS[language]}
                alt={`${LANGUAGE_FLAG_ALT[language]} flag`}
                className="h-4 w-6 rounded-[2px] object-cover"
              />
            </button>

            {languageMenuOpen ? (
              <div
                className={[
                  'absolute mt-2 w-52 rounded-xl border border-border/80 bg-card p-2 shadow-lg',
                  isRtl ? 'left-0' : 'right-0',
                ].join(' ')}
              >
                <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('common.language', 'Language')}
                </p>
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                    onClick={() => {
                      setLanguage(option.code);
                      setLanguageMenuOpen(false);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <img
                        src={LANGUAGE_FLAGS[option.code]}
                        alt={`${LANGUAGE_FLAG_ALT[option.code]} flag`}
                        className="h-4 w-6 rounded-[2px] object-cover"
                      />
                      <span>{option.label}</span>
                    </span>
                    {language === option.code ? (
                      <span className="text-xs text-primary">●</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? t('common.switchToLight', 'Switch to light mode')
                : t('common.switchToDark', 'Switch to dark mode')
            }
            title={
              theme === 'dark'
                ? t('common.switchToLight', 'Switch to light mode')
                : t('common.switchToDark', 'Switch to dark mode')
            }
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-full border border-border/80 bg-card px-2.5 py-1.5 hover:bg-secondary"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {getInitials(user?.name)}
              </span>
              <span className={isRtl ? 'hidden text-right sm:block' : 'hidden text-left sm:block'}>
                <span className="block text-sm font-medium leading-tight">
                  {user?.name || t('common.user', 'User')}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {user?.role || 'operator'}
                </span>
              </span>
            </button>

            {menuOpen ? (
              <div
                className={[
                  'absolute mt-2 w-64 rounded-xl border border-border/80 bg-card p-2 shadow-lg',
                  isRtl ? 'left-0' : 'right-0',
                ].join(' ')}
              >
                <div className="px-2 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name || t('common.user', 'User')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || t('common.unknownEmail', 'No email available')}
                  </p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-secondary"
                  onClick={() => setMenuOpen(false)}
                  to="/account"
                >
                  <UserCircle2 className="h-4 w-4" />
                  {t('common.accountSettings', 'Account Settings')}
                </Link>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                  {t('common.preferences', 'Preferences')}
                </button>
                <div className="my-1 h-px bg-border" />
                <button
                  className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  onClick={handleSignout}
                  type="button"
                >
                  {t('common.signOut', 'Sign out')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
