import { Zap, AlertCircle, Loader2, MapPin, Building2, Battery, Clock } from 'lucide-react';
import type { BatteryResponse } from '@/types';

interface BatteryResultProps {
  data: BatteryResponse['data'];
  loading: boolean;
  error: string | null;
  roomName?: string;
  buildingName?: string;
}

export function BatteryResult({ data, loading, error, roomName, buildingName }: BatteryResultProps) {
  // Empty state - no selection yet
  if (!data && !loading && !error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Large Battery Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-48 sm:w-40 sm:h-56 rounded-[2rem] border-4 border-dashed border-gray-200 dark:border-gray-600 p-3 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center animate-bounce">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
                <Battery className="w-3 h-3 text-blue-500" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">欢迎使用电量查询</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              请在下方选择房间，或直接输入房间号查询电量
            </p>
            
            {/* Quick hints */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                选择分区
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                选择楼栋
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                查看电量
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {/* Animated battery outline */}
              <div className="w-28 h-40 sm:w-36 sm:h-52 md:w-40 md:h-56 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-[oklch(0.75_0.1_250)] p-2 sm:p-3 relative overflow-hidden">
                {/* Battery cap */}
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3 sm:h-4 bg-[oklch(0.75_0.1_250)] rounded-t-lg sm:rounded-t-xl" />
                
                {/* Loading animation */}
                <div className="absolute inset-3 rounded-2xl bg-gray-50 dark:bg-gray-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.75_0.1_250)] via-[oklch(0.75_0.1_250_/0.5)] to-transparent animate-pulse" 
                    style={{ 
                      animation: 'charging 1.5s ease-in-out infinite',
                    }} 
                  />
                </div>
                
                {/* Center loader */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin drop-shadow-lg" />
                </div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-[oklch(0.75_0.1_250_/0.3)] -z-10" />
            </div>
            
            <p className="mt-6 sm:mt-8 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">正在查询电量...</p>
            <p className="mt-1 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">请稍候</p>
          </div>
        </div>
        
        <style>{`
          @keyframes charging {
            0% { transform: translateY(100%); }
            50% { transform: translateY(0%); }
            100% { transform: translateY(-100%); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4 sm:mb-6">
              <div className="w-28 h-40 sm:w-36 sm:h-52 md:w-40 md:h-56 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-red-200 dark:border-red-800 p-2 sm:p-3 flex items-center justify-center bg-red-50/50 dark:bg-red-900/20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 dark:text-red-400" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-base sm:text-lg">!</span>
              </div>
            </div>
            
            <h2 className="text-base sm:text-lg font-bold text-red-600 mb-2">查询失败</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-xs px-2">{error}</p>
            <p className="mt-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">请检查房间号是否正确，或稍后重试</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state with data
  if (!data) return null;

  const quantity = parseFloat(data.quantity);
  let batteryColor = '#22c55e'; // green-500
  let batteryBgColor = 'bg-green-500';
  let batteryLightColor = 'bg-green-400';
  let batteryLevel = '充足';
  let statusTextColor = 'text-green-600';
  let statusBgColor = 'bg-green-50';
  
  if (quantity < 20) {
    batteryColor = '#ef4444'; // red-500
    batteryBgColor = 'bg-red-500';
    batteryLightColor = 'bg-red-400';
    batteryLevel = '不足';
    statusTextColor = 'text-red-600';
    statusBgColor = 'bg-red-50';
  } else if (quantity < 50) {
    batteryColor = '#eab308'; // yellow-500
    batteryBgColor = 'bg-yellow-500';
    batteryLightColor = 'bg-yellow-400';
    batteryLevel = '一般';
    statusTextColor = 'text-yellow-600';
    statusBgColor = 'bg-yellow-50';
  }

  // Calculate percentage (assuming max is 200)
  const maxQuantity = 200;
  const percentage = Math.min(100, Math.max(5, (quantity / maxQuantity) * 100));

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Room Info Header */}
        <div className="text-center mb-4 sm:mb-6">
          {buildingName && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{buildingName}</span>
            </div>
          )}
          {roomName && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{roomName}</h2>
          )}
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-1">房间号: {data.room}</p>
        </div>

        {/* Main Battery Display */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Battery Container */}
            <div className="w-28 h-44 sm:w-36 sm:h-56 md:w-44 md:h-64 rounded-[1.5rem] sm:rounded-[2rem] border-[5px] sm:border-[6px] border-gray-200 dark:border-gray-600 p-1.5 sm:p-2 relative bg-gray-50 dark:bg-gray-700">
              {/* Battery Cap */}
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded-t-lg sm:rounded-t-xl" />
              
              {/* Battery Body Inner */}
              <div className="w-full h-full rounded-[1.5rem] bg-white dark:bg-gray-800 relative overflow-hidden shadow-inner">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none z-10">
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                </div>
                
                {/* Battery Fill */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 ${batteryBgColor} transition-all duration-1000 ease-out`}
                  style={{ height: `${percentage}%` }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${batteryLightColor} to-transparent opacity-50`} />
                  
                  {/* Shine effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/4 bg-white/30" />
                  
                  {/* Animated wave for low battery */}
                  {quantity < 20 && (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-red-300 animate-pulse" />
                  )}
                </div>
                
                {/* Percentage text inside battery */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg"
                    style={{ 
                      color: percentage > 50 ? 'white' : 'transparent',
                      WebkitTextStroke: percentage > 50 ? 'none' : 'none'
                    }}
                  >
                    {Math.round(percentage)}%
                  </span>
                </div>
              </div>
              
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-2xl -z-10 opacity-30"
                style={{ backgroundColor: batteryColor }}
              />
            </div>
          </div>

          {/* Quantity Display */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
              <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{data.quantity}</span>
              <span className="text-lg sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400">{data.unit}</span>
            </div>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{data.description}</p>
          </div>

          {/* Status Badge */}
          <div className="mt-4 sm:mt-6">
            <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium ${statusBgColor} ${statusTextColor}`}>
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${batteryBgColor} animate-pulse`} />
              电量{batteryLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Banner for Low Battery */}
      {quantity < 30 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/30">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">电量较低，建议及时充值</span>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>查询时间: {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>
    </div>
  );
}
