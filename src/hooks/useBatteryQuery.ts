import { useState, useCallback } from 'react';
import type { BatteryResponse } from '@/types';

const API_BASE_URL = 'https://battery-api-eo.07210700.xyz';

interface QueryResult {
  data: BatteryResponse['data'];
  loading: boolean;
  error: string | null;
}

export function useBatteryQuery() {
  const [result, setResult] = useState<QueryResult>({
    data: null,
    loading: false,
    error: null,
  });

  const queryBattery = useCallback(async (roomId: string): Promise<boolean> => {
    setResult({
      data: null,
      loading: true,
      error: null,
    });

    try {

      
      const response = await fetch(`${API_BASE_URL}/api/battery?room=${encodeURIComponent(roomId)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BatteryResponse = await response.json();


      if (data.success && data.data) {
        setResult({
          data: data.data,
          loading: false,
          error: null,
        });
        return true;
      } else {
        setResult({
          data: null,
          loading: false,
          error: data.error || '查询失败',
        });
        return false;
      }
    } catch (error) {
      console.error('Battery query error:', error);
      setResult({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : '网络错误',
      });
      return false;
    }
  }, []);

  const resetResult = useCallback(() => {
    setResult({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...result,
    queryBattery,
    resetResult,
  };
}
