import { History, X, Clock } from 'lucide-react';
import type { HistoryItem } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemove: (index: number) => void;
}

export function HistoryList({ history, onSelect, onClear, onRemove }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-gray-400 dark:text-gray-500">
        <History className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-30" />
        <span className="text-xs sm:text-sm">暂无查询记录</span>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than 1 minute
    if (diff < 60000) {
      return '刚刚';
    }
    // Less than 1 hour
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    }
    // Less than 7 days
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)} 天前`;
    }
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(0.75_0.1_250)]" />
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">查询历史</span>
        </div>
        <button
          onClick={onClear}
          className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          清空
        </button>
      </div>
      
      <ScrollArea className="h-[160px] sm:h-[200px] -mx-2 px-2">
        <div className="space-y-2">
          {history.map((item, index) => (
            <div
              key={`${item.roomId}-${item.timestamp}`}
              className="group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-[oklch(0.75_0.1_250_/0.05)] dark:hover:bg-[oklch(0.75_0.1_250_/0.1)] border border-transparent hover:border-[oklch(0.75_0.1_250_/0.2)] transition-all cursor-pointer"
              onClick={() => onSelect(item)}
            >
              <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center">
                <span className="text-xs sm:text-sm">⚡</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.buildingName} - {item.roomName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{formatTime(item.timestamp)}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="flex-shrink-0 p-1 sm:p-1.5 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                aria-label="删除记录"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 dark:text-gray-500 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
