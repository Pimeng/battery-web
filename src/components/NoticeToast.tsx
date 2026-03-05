import { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';
import type { Notice } from '@/types';

interface NoticeToastProps {
  notice: Notice | null;
  onClose: () => void;
}

export function NoticeToast({ notice, onClose }: NoticeToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notice) {
      setIsVisible(true);
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
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => {
        clearTimeout(hideTimeout);
        clearInterval(progressInterval);
      };
    }
  }, [notice, onClose]);

  if (!notice || !isVisible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-[oklch(0.75_0.1_250_/0.2)] overflow-hidden">
        {/* Progress bar */}
        <div 
          className="h-1 bg-[oklch(0.75_0.1_250)] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center">
              <Info className="w-4 h-4 text-[oklch(0.75_0.1_250)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-gray-900">{notice.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{notice.body}</p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
