import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Zap, History, Trash2, Bell, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useBatteryQuery } from '@/hooks/useBatteryQuery';
import { NoticeToast } from '@/components/NoticeToast';
import { RoomSelector } from '@/components/RoomSelector';
import { HistoryList } from '@/components/HistoryList';
import { BatteryResult } from '@/components/BatteryResult';
import type { RoomsTree, Notice, HistoryItem, Room } from '@/types';

function App() {
  // Data states
  const [roomsData, setRoomsData] = useState<RoomsTree | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  
  // User input states
  const [roomInput, setRoomInput] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBuildingName, setSelectedBuildingName] = useState('');
  
  // History
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('battery-query-history', []);
  
  // UI states
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  // Ref to track if URL params have been processed
  const urlParamsProcessed = useRef(false);
  
  // Battery query hook
  const { data, loading, error, queryBattery, resetResult } = useBatteryQuery();
  


  // Load initial data
  useEffect(() => {
    // Load rooms data
    fetch('/all_rooms_tree.json')
      .then(res => res.json())
      .then((data: RoomsTree) => {
        setRoomsData(data);
      })
      .catch(err => console.error('Failed to load rooms data:', err));

    // Load notice
    fetch('/notice.json')
      .then(res => res.json())
      .then((data: Notice) => {
        setNotice(data);
        setShowNotice(true);
      })
      .catch(err => console.error('Failed to load notice:', err));
  }, []);

  // Handle URL search params - only process once
  useEffect(() => {
    // Skip if already processed
    if (urlParamsProcessed.current) return;
    
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('roomid');
    
    if (roomId && roomsData) {

      urlParamsProcessed.current = true;
      
      // Find room info
      for (const area of roomsData.areas) {
        for (const building of area.buildings) {
          for (const floor of building.floors) {
            const room = floor.rooms.find(r => r.room_id === roomId);
            if (room) {
              setSelectedRoom(room);
              setSelectedBuildingName(building.building_name);
              setRoomInput(roomId);
              // Auto query
              handleQuery(roomId, room.room_name, building.building_name);
              return;
            }
          }
        }
      }
      // Room not found, just set the input
      setRoomInput(roomId);
    }
  }, [roomsData]);

  // Handle query
  const handleQuery = useCallback(async (roomId: string, roomName?: string, buildingName?: string) => {
    const success = await queryBattery(roomId);
    
    if (success && roomName && buildingName) {
      // Add to history
      const newItem: HistoryItem = {
        roomId,
        roomName,
        buildingName,
        timestamp: Date.now(),
      };
      
      setHistory(prev => {
        // Remove duplicates
        const filtered = prev.filter(item => item.roomId !== roomId);
        // Add to front, limit to 20
        return [newItem, ...filtered].slice(0, 20);
      });
    }
  }, [queryBattery, setHistory]);

  // Handle manual query button click
  const handleQueryClick = () => {
    if (!roomInput.trim()) return;
    
    // Try to find room info
    let roomName = roomInput;
    let buildingName = '未知楼栋';
    
    if (roomsData) {
      for (const area of roomsData.areas) {
        for (const building of area.buildings) {
          for (const floor of building.floors) {
            const room = floor.rooms.find(r => r.room_id === roomInput);
            if (room) {
              roomName = room.room_name;
              buildingName = building.building_name;
              setSelectedRoom(room);
              setSelectedBuildingName(buildingName);
              break;
            }
          }
        }
      }
    }
    
    handleQuery(roomInput.trim(), roomName, buildingName);
  };

  // Handle room selection from tree
  const handleRoomSelect = useCallback((room: Room, buildingName: string) => {
    setSelectedRoom(room);
    setSelectedBuildingName(buildingName);
    setRoomInput(room.room_id);
    // Auto query when room is selected - directly call queryBattery to avoid closure issues
    queryBattery(room.room_id).then((success) => {
      if (success) {
        // Add to history
        const newItem: HistoryItem = {
          roomId: room.room_id,
          roomName: room.room_name,
          buildingName: buildingName,
          timestamp: Date.now(),
        };
        
        setHistory(prev => {
          // Remove duplicates
          const filtered = prev.filter(item => item.roomId !== room.room_id);
          // Add to front, limit to 20
          return [newItem, ...filtered].slice(0, 20);
        });
      }
    });
  }, [queryBattery, setHistory]);

  // Handle history selection
  const handleHistorySelect = (item: HistoryItem) => {
    setRoomInput(item.roomId);
    setSelectedBuildingName(item.buildingName);
    
    // Find room info
    if (roomsData) {
      for (const area of roomsData.areas) {
        for (const building of area.buildings) {
          for (const floor of building.floors) {
            const room = floor.rooms.find(r => r.room_id === item.roomId);
            if (room) {
              setSelectedRoom(room);
              break;
            }
          }
        }
      }
    }
    
    handleQuery(item.roomId, item.roomName, item.buildingName);
    setShowHistoryPanel(false);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Remove single history item
  const handleRemoveHistoryItem = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  // Clear input and result
  const handleClear = () => {
    setRoomInput('');
    setSelectedRoom(null);
    setSelectedBuildingName('');
    resetResult();
    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notice Toast */}
      {showNotice && notice && (
        <NoticeToast 
          notice={notice} 
          onClose={() => setShowNotice(false)} 
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.75_0.1_250)] flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">电量查询</h1>
                <p className="text-xs text-gray-500">广州华夏职业学院</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                className={`p-2.5 rounded-xl transition-all ${
                  showHistoryPanel 
                    ? 'bg-[oklch(0.75_0.1_250)] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <History className="w-5 h-5" />
              </button>
              {notice && (
                <button
                  onClick={() => setShowNotice(true)}
                  className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <Bell className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Primary: Battery Result Display */}
        <div className="mb-6">
          <BatteryResult
            data={data}
            loading={loading}
            error={error}
            roomName={selectedRoom?.room_name}
            buildingName={selectedBuildingName}
          />
        </div>

        {/* Secondary: Room Selection & Quick Query */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Selector */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center text-[oklch(0.75_0.1_250)]">
                    <MapPin className="w-4 h-4" />
                  </span>
                  选择房间
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoomSelector
                  data={roomsData}
                  onSelectRoom={handleRoomSelect}
                  selectedRoomId={selectedRoom?.room_id || null}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right panel: Quick Query & History */}
          <div className="space-y-6">
            {/* Quick Query Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center text-[oklch(0.75_0.1_250)]">
                    <Search className="w-4 h-4" />
                  </span>
                  快速查询
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="输入房间号查询"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQueryClick()}
                        className="pr-10 h-11 rounded-xl border-gray-200 focus:border-[oklch(0.75_0.1_250)] focus:ring-[oklch(0.75_0.1_250_/0.2)]"
                      />
                      {roomInput && (
                        <button
                          onClick={handleClear}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <Button
                      onClick={handleQueryClick}
                      disabled={!roomInput.trim() || loading}
                      className="h-11 px-5 rounded-xl bg-[oklch(0.75_0.1_250)] hover:bg-[oklch(0.7_0.12_250)] text-white shadow-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-400">
                      格式: 分区ID-楼栋ID--楼层ID-房间号
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      例: 1-1--45-1419
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History Panel */}
            {showHistoryPanel && (
              <Card className="border-0 shadow-sm animate-in slide-in-from-right duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-[oklch(0.75_0.1_250_/0.1)] flex items-center justify-center text-[oklch(0.75_0.1_250)]">
                      <History className="w-4 h-4" />
                    </span>
                    历史记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HistoryList
                    history={history}
                    onSelect={handleHistorySelect}
                    onClear={handleClearHistory}
                    onRemove={handleRemoveHistoryItem}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            电量查询系统 · 广州华夏职业学院
          </p>
          <p className="text-xs text-gray-300 mt-1">
            数据仅供参考，请以实际为准
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
