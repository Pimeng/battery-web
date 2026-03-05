import { useState } from 'react';
import { GitCommit, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// 由 Vite 插件在构建时注入
const VERSION = __APP_VERSION__;
const GIT_SHA = __APP_GIT_SHA__;
const CHANGELOG = __APP_CHANGELOG__;

// 提交类型翻译映射
const typeTranslations: Record<string, string> = {
  feat: '新功能',
  fix: '修复',
  chore: '改进/杂项',
  docs: '文档',
  style: '样式',
  refactor: '重构',
  perf: '性能',
  test: '测试',
  build: '构建',
  ci: 'CI/CD',
  revert: '回滚',
};

// 获取类型颜色
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    feat: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    fix: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    chore: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    docs: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    style: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    refactor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    perf: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    test: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
    build: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
    ci: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
    revert: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  };
  return colors[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
};

export function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="mt-12 py-6 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            非华夏官方，一切以官方数据为准
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
            数据仅供参考，请以实际为准
          </p>
          
          {/* 版本信息 */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <Tag className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
            <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
              v{VERSION}
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <GitCommit className="w-3 h-3 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400">
              {GIT_SHA}
            </span>
          </button>
        </div>
      </footer>

      {/* 更新日志弹窗 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0 dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader className="px-6 pt-6 pb-4 border-b dark:border-gray-700">
            <DialogTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
              <GitCommit className="w-5 h-5 text-[oklch(0.75_0.1_250)]" />
              更新日志
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[50vh]">
            <div className="px-6 py-4 relative">
              {/* 时间线竖线 */}
              <div className="absolute left-9 top-4 bottom-4 w-px bg-gray-200 dark:bg-gray-700" />
              
              <div className="space-y-0">
                {CHANGELOG.map((entry, index) => (
                  <div
                    key={entry.sha}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* 时间线圆点 */}
                    <div className="relative z-10 shrink-0">
                      <div 
                        className={`w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center ${
                          index === 0 
                            ? 'bg-[oklch(0.75_0.1_250)]' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        {index === 0 && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    
                    {/* 内容卡片 */}
                    <div className="flex-1 -mt-1">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        {/* 第一行：标签和时间 */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getTypeColor(
                              entry.type
                            )}`}
                          >
                            {typeTranslations[entry.type] || entry.type}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {entry.date}
                          </span>
                        </div>
                        
                        {/* 提交信息 */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                          {entry.message}
                        </p>
                        
                        {/* SHA */}
                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1">
                          {entry.sha}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          
          <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
            <Button
              onClick={() => setOpen(false)}
              className="w-full h-10 rounded-xl bg-[oklch(0.75_0.1_250)] hover:bg-[oklch(0.7_0.12_250)] text-white"
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
