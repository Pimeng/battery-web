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
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-400 ease-out ${getAnimationClasses()}`}
      style={{
        transitionTimingFunction: animationState === 'entering' 
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' // 弹性效果
          : 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-[oklch(0.75_0.1_250_/0.2)] overflow-hidden transform transition-transform duration-300 hover:scale-[1.02]">
        {/* Progress bar */}
        <div 
          className="h-1 bg-gradient-to-r from-[oklch(0.7_0.12_250)] to-[oklch(0.75_0.1_250)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center animate-pulse">
              <Info className="w-4 h-4 text-[oklch(0.75_0.1_250)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">{notice.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{notice.body}</p>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 hover:rotate-90"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
