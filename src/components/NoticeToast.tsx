import { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';
import type { Notice } from '@/types';

interface NoticeToastProps {
  notice: Notice | null;
  onClose: () => void;
}

export function NoticeToast({ notice, onClose }: NoticeToastProps) {
  const [progress, setProgress] = useState(100);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('exited');

  useEffect(() => {
    if (notice) {
      // 触发动画进入
      setAnimationState('entering');
      requestAnimationFrame(() => {
        setAnimationState('entered');
      });
      setProgress(100);
      
      const duration = notice.duration || 5000;
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(progressInterval);
        }
      }, 50);

      const hideTimeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(hideTimeout);
        clearInterval(progressInterval);
      };
    }
  }, [notice]);

  const handleClose = () => {
    setAnimationState('exiting');
    setTimeout(() => {
      setAnimationState('exited');
      onClose();
    }, 400);
  };

  if (!notice || animationState === 'exited') return null;

  // 根据动画状态获取对应的类名
  const getAnimationClasses = () => {
    switch (animationState) {
      case 'entering':
        return 'opacity-0 translate-x-full scale-95';
      case 'entered':
        return 'opacity-100 translate-x-0 scale-100';
      case 'exiting':
        return 'opacity-0 translate-x-full scale-95';
      default:
        return 'opacity-0 translate-x-full scale-95';
    }
  };

  return (
    <div 
      className={`fixed top-3 sm:top-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-sm w-auto sm:w-full transition-all duration-400 ease-out ${getAnimationClasses()}`}
      style={{
        transitionTimingFunction: animationState === 'entering' 
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // 弹性效果
          : 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 border border-[oklch(0.75_0.1_250_/0.2)] dark:border-[oklch(0.75_0.1_250_/0.3)] overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
        {/* Progress bar */}
        <div 
          className="h-1 bg-gradient-to-r from-[oklch(0.7_0.12_250)] to-[oklch(0.75_0.1_250)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center animate-pulse">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(0.75_0.1_250)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100">{notice.title}</h4>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">{notice.body}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 sm:p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:rotate-90"
              aria-label="关闭通知"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
