import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const icons = {
    light: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />,
    dark: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />,
    system: <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />,
  };

  const labels = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          aria-label="切换主题"
        >
          {resolvedTheme === 'dark' ? icons.dark : icons.light}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={`gap-2 cursor-pointer ${theme === 'light' ? 'text-[oklch(0.75_0.1_250)]' : ''}`}
        >
          {icons.light}
          <span className="text-sm">{labels.light}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={`gap-2 cursor-pointer ${theme === 'dark' ? 'text-[oklch(0.75_0.1_250)]' : ''}`}
        >
          {icons.dark}
          <span className="text-sm">{labels.dark}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={`gap-2 cursor-pointer ${theme === 'system' ? 'text-[oklch(0.75_0.1_250)]' : ''}`}
        >
          {icons.system}
          <span className="text-sm">{labels.system}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
