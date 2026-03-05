import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight, MapPin, Building2, Layers, DoorOpen, Check, RotateCcw, Clock } from 'lucide-react';
import type { RoomsTree, Area, Building, Floor, Room, HistoryItem } from '@/types';
import { Button } from '@/components/ui/button';

/**
 * 自然排序比较函数
 * 支持数字大小排序（如 1, 2, 10 而不是 1, 10, 2）
 * 支持中英文首字母排序
 */
function naturalSortCompare(a: string, b: string): number {
  // 提取字符串中的数字和非数字部分
  const extractParts = (str: string): (string | number)[] => {
    return str.split(/(\d+)/).filter(Boolean).map(part => {
      const num = parseInt(part, 10);
      return isNaN(num) ? part : num;
    });
  };
  
  const partsA = extractParts(a);
  const partsB = extractParts(b);
  
  const minLen = Math.min(partsA.length, partsB.length);
  
  for (let i = 0; i < minLen; i++) {
    const partA = partsA[i];
    const partB = partsB[i];
    
    if (typeof partA === 'number' && typeof partB === 'number') {
      // 都是数字，按数值比较
      if (partA !== partB) {
        return partA - partB;
      }
    } else {
      // 至少有一个是字符串，使用本地化比较
      const strA = String(partA);
      const strB = String(partB);
      const comparison = strA.localeCompare(strB, 'zh-CN', { sensitivity: 'base' });
      if (comparison !== 0) {
        return comparison;
      }
    }
  }
  
  // 如果前面都相同，按长度比较
  return partsA.length - partsB.length;
}

/**
 * 对数组进行自然排序，历史记录中的项目排在前面
 */
function naturalSort<T extends { [key: string]: any }>(
  array: T[],
  keyExtractor: (item: T) => string,
  priorityIds?: Set<string>,
  idExtractor?: (item: T) => string
): T[] {
  return [...array].sort((a, b) => {
    // 如果有优先级ID集合，先按优先级排序
    if (priorityIds && idExtractor) {
      const aId = idExtractor(a);
      const bId = idExtractor(b);
      const aInHistory = priorityIds.has(aId);
      const bInHistory = priorityIds.has(bId);
      
      if (aInHistory && !bInHistory) return -1;
      if (!aInHistory && bInHistory) return 1;
    }
    
    // 再按自然排序
    return naturalSortCompare(keyExtractor(a), keyExtractor(b));
  });
}

/**
 * 从历史记录中提取所有相关的ID
 * 同时根据 roomsData 查找房间对应的楼层ID
 */
function extractHistoryIds(
  history: HistoryItem[] = [],
  data: RoomsTree | null
): {
  roomIds: Set<string>;
  roomNames: Set<string>;
  buildingNames: Set<string>;
  floorIds: Set<string>;
} {
  const roomIds = new Set<string>();
  const roomNames = new Set<string>();
  const buildingNames = new Set<string>();
  const floorIds = new Set<string>();
  
  history.forEach(item => {
    roomIds.add(item.roomId);
    roomNames.add(item.roomName);
    buildingNames.add(item.buildingName);
    
    // 从 roomsData 中查找该房间对应的楼层ID
    if (data) {
      for (const area of data.areas) {
        for (const building of area.buildings) {
          for (const floor of building.floors) {
            const room = floor.rooms.find(r => r.room_id === item.roomId);
            if (room) {
              floorIds.add(floor.floor_id);
              break;
            }
          }
        }
      }
    }
  });
  
  return { roomIds, roomNames, buildingNames, floorIds };
}

interface RoomSelectorProps {
  data: RoomsTree | null;
  onSelectRoom: (room: Room, buildingName: string) => void;
  selectedRoomId: string | null;
  history?: HistoryItem[];
}

type SelectionStep = 'area' | 'building' | 'floor' | 'room' | 'complete';

interface SelectionState {
  step: SelectionStep;
  area: Area | null;
  building: Building | null;
  floor: Floor | null;
  room: Room | null;
}

export function RoomSelector({ data, onSelectRoom, selectedRoomId, history = [] }: RoomSelectorProps) {
  const [selection, setSelection] = useState<SelectionState>({
    step: 'area',
    area: null,
    building: null,
    floor: null,
    room: null,
  });
  
  // Use ref to track latest building to avoid closure issues
  // Initialize with selection.building for initial render
  const buildingRef = useRef<Building | null>(selection.building);
  
  // Ref to prevent double-click on room selection
  const isSelectingRef = useRef(false);
  
  // 从历史记录中提取ID，用于高亮显示
  const historyIds = useMemo(() => extractHistoryIds(history, data), [history, data]);
  
  // Sync ref with state - only update when building actually changes and is not null
  useEffect(() => {
    if (selection.building !== null) {
      buildingRef.current = selection.building;
    }
  }, [selection.building]);

  // Reset selection
  const handleReset = () => {
    setSelection({
      step: 'area',
      area: null,
      building: null,
      floor: null,
      room: null,
    });
  };

  // Handle area selection
  const handleSelectArea = (area: Area) => {
    setSelection({
      step: 'building',
      area,
      building: null,
      floor: null,
      room: null,
    });
  };

  // Handle building selection
  const handleSelectBuilding = (building: Building) => {
    // Update ref immediately to ensure latest value is available
    buildingRef.current = building;
    setSelection(prev => ({
      ...prev,
      step: 'floor',
      building,
      floor: null,
      room: null,
    }));
  };

  // Handle floor selection
  const handleSelectFloor = (floor: Floor) => {
    setSelection(prev => ({
      ...prev,
      step: 'room',
      floor,
      room: null,
    }));
  };

  // Handle room selection
  const handleSelectRoom = (room: Room) => {
    // Prevent double-click
    if (isSelectingRef.current) {
      console.log('[RoomSelector] Selection already in progress, ignoring click');
      return;
    }
    isSelectingRef.current = true;
    
    // Use ref to get the latest building value, avoiding closure issues
    const currentBuilding = buildingRef.current;
    

    
    setSelection(prev => ({
      ...prev,
      step: 'complete' as const,
      room,
    }));
    
    // Call onSelectRoom with the room and the latest building name from ref
    if (currentBuilding) {
      onSelectRoom(room, currentBuilding.building_name);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
  };

  // Go back to previous step
  const handleBack = (targetStep: SelectionStep) => {
    const newSelection = { ...selection };
    switch (targetStep) {
      case 'area':
        newSelection.area = null;
        newSelection.building = null;
        newSelection.floor = null;
        newSelection.room = null;
        newSelection.step = 'area';
        break;
      case 'building':
        newSelection.building = null;
        newSelection.floor = null;
        newSelection.room = null;
        newSelection.step = 'building';
        break;
      case 'floor':
        newSelection.floor = null;
        newSelection.room = null;
        newSelection.step = 'floor';
        break;
    }
    setSelection(newSelection);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-1 text-xs">
        <StepIndicator 
          icon={<MapPin className="w-3 h-3" />} 
          label="分区" 
          active={selection.step === 'area'} 
          completed={!!selection.area}
          onClick={() => selection.area && handleBack('area')}
        />
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <StepIndicator 
          icon={<Building2 className="w-3 h-3" />} 
          label="楼栋" 
          active={selection.step === 'building'} 
          completed={!!selection.building}
          onClick={() => selection.building && selection.step !== 'area' && handleBack('building')}
          disabled={!selection.area}
        />
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <StepIndicator 
          icon={<Layers className="w-3 h-3" />} 
          label="楼层" 
          active={selection.step === 'floor'} 
          completed={!!selection.floor}
          onClick={() => selection.floor && selection.step !== 'area' && selection.step !== 'building' && handleBack('floor')}
          disabled={!selection.building}
        />
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <StepIndicator 
          icon={<DoorOpen className="w-3 h-3" />} 
          label="房间" 
          active={selection.step === 'room' || selection.step === 'complete'} 
          completed={!!selection.room}
          disabled={!selection.floor}
        />
      </div>

      {/* Selection Path - 可点击回退的面包屑导航 */}
      {selection.area && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-gray-50 text-xs">
          {/* 分区 - 点击回退到分区选择 */}
          <button
            onClick={() => handleBack('area')}
            className="font-medium text-gray-700 hover:text-[oklch(0.65_0.12_250)] hover:bg-[oklch(0.75_0.1_250_/0.1)] px-2 py-1 rounded-lg transition-all"
            title="点击回退到分区选择"
          >
            {selection.area.area_name}
          </button>
          
          {selection.building && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {/* 楼栋 - 点击回退到楼栋选择 */}
              <button
                onClick={() => handleBack('building')}
                className="font-medium text-gray-700 hover:text-[oklch(0.65_0.12_250)] hover:bg-[oklch(0.75_0.1_250_/0.1)] px-2 py-1 rounded-lg transition-all"
                title="点击回退到楼栋选择"
              >
                {selection.building.building_name}
              </button>
            </>
          )}
          {selection.floor && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {/* 楼层 - 点击回退到楼层选择 */}
              <button
                onClick={() => handleBack('floor')}
                className="font-medium text-gray-700 hover:text-[oklch(0.65_0.12_250)] hover:bg-[oklch(0.75_0.1_250_/0.1)] px-2 py-1 rounded-lg transition-all"
                title="点击回退到楼层选择"
              >
                {selection.floor.floor_name}
              </button>
            </>
          )}
          {selection.room && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              {/* 房间 - 仅展示，不可点击 */}
              <span className="font-medium text-[oklch(0.65_0.12_250)] bg-[oklch(0.75_0.1_250_/0.15)] px-2 py-1 rounded-lg">
                {selection.room.room_name}
              </span>
            </>
          )}
          <button
            onClick={handleReset}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            title="重新选择"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Selection Content */}
      <div className="min-h-[200px]">
        {selection.step === 'area' && (
          <SelectionGrid>
            {naturalSort(
              data.areas,
              (area) => area.area_name,
              undefined,
              undefined
            ).map((area) => (
              <SelectionCard
                key={area.area_id}
                icon={<MapPin className="w-5 h-5" />}
                title={area.area_name}
                subtitle={`${area.buildings.length} 栋楼`}
                onClick={() => handleSelectArea(area)}
                isInHistory={false}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'building' && selection.area && (
          <SelectionGrid>
            {naturalSort(
              selection.area.buildings,
              (building) => building.building_name,
              historyIds.buildingNames,
              (building) => building.building_name
            ).map((building) => (
              <SelectionCard
                key={building.building_id}
                icon={<Building2 className="w-5 h-5" />}
                title={building.building_name}
                subtitle={`${building.floors.length} 层`}
                onClick={() => handleSelectBuilding(building)}
                isInHistory={historyIds.buildingNames.has(building.building_name)}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'floor' && selection.building && (
          <SelectionGrid>
            {naturalSort(
              selection.building.floors,
              (floor) => floor.floor_name,
              historyIds.floorIds,
              (floor) => floor.floor_id
            ).map((floor) => (
              <SelectionCard
                key={floor.floor_id}
                icon={<Layers className="w-5 h-5" />}
                title={floor.floor_name}
                subtitle={`${floor.rooms.length} 间`}
                onClick={() => handleSelectFloor(floor)}
                isInHistory={historyIds.floorIds.has(floor.floor_id)}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'room' && selection.floor && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {naturalSort(
                selection.floor.rooms,
                (room) => room.room_name,
                historyIds.roomIds,
                (room) => room.room_id
              ).map((room) => {
                const isSelected = room.room_id === selectedRoomId;
                const inHistory = historyIds.roomIds.has(room.room_id);
                return (
                  <button
                    key={room.room_id}
                    onClick={() => handleSelectRoom(room)}
                    className={`p-2 rounded-xl text-xs font-medium transition-all relative ${
                      isSelected
                        ? 'bg-[oklch(0.75_0.1_250)] text-white shadow-sm'
                        : inHistory
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-[oklch(0.75_0.1_250_/0.1)] hover:text-[oklch(0.75_0.1_250)] border border-gray-100'
                    }`}
                    title={inHistory ? '该房间曾在历史记录中' : undefined}
                  >
                    {room.room_name}
                    {inHistory && !isSelected && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selection.step === 'complete' && selection.room && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">已选择房间</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{selection.room.room_name}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mt-4"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              重新选择
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Step Indicator Component
interface StepIndicatorProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  completed: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

function StepIndicator({ icon, label, active, completed, onClick, disabled }: StepIndicatorProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || (!completed && !active)}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
        active
          ? 'bg-[oklch(0.75_0.1_250)] text-white'
          : completed
            ? 'bg-[oklch(0.75_0.1_250_/0.1)] text-[oklch(0.75_0.1_250)] hover:bg-[oklch(0.75_0.1_250_/0.2)]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// Selection Grid Container
function SelectionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {children}
    </div>
  );
}

// Selection Card Component
interface SelectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  isInHistory?: boolean;
}

function SelectionCard({ icon, title, subtitle, onClick, isInHistory = false }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-xl border transition-all group relative ${
        isInHistory
          ? 'bg-amber-50/80 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
          : 'bg-gray-50 border-gray-100 hover:bg-[oklch(0.75_0.1_250_/0.1)] hover:border-[oklch(0.75_0.1_250_/0.3)]'
      }`}
      title={isInHistory ? '该楼栋曾在历史记录中' : undefined}
    >
      {isInHistory && (
        <span className="absolute top-2 right-2">
          <Clock className="w-3 h-3 text-amber-500" />
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm ${
        isInHistory 
          ? 'bg-amber-100 text-amber-600' 
          : 'bg-white text-[oklch(0.75_0.1_250)]'
      }`}>
        {icon}
      </div>
      <span className={`mt-2 text-sm font-medium ${
        isInHistory 
          ? 'text-amber-800 group-hover:text-amber-900' 
          : 'text-gray-700 group-hover:text-[oklch(0.75_0.1_250)]'
      }`}>{title}</span>
      <span className={`text-xs ${isInHistory ? 'text-amber-600/70' : 'text-gray-400'}`}>{subtitle}</span>
    </button>
  );
}
