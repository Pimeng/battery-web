import { useState, useRef, useEffect } from 'react';
import { ChevronRight, MapPin, Building2, Layers, DoorOpen, Check, RotateCcw } from 'lucide-react';
import type { RoomsTree, Area, Building, Floor, Room } from '@/types';
import { Button } from '@/components/ui/button';

interface RoomSelectorProps {
  data: RoomsTree | null;
  onSelectRoom: (room: Room, buildingName: string) => void;
  selectedRoomId: string | null;
}

type SelectionStep = 'area' | 'building' | 'floor' | 'room' | 'complete';

interface SelectionState {
  step: SelectionStep;
  area: Area | null;
  building: Building | null;
  floor: Floor | null;
  room: Room | null;
}

export function RoomSelector({ data, onSelectRoom, selectedRoomId }: RoomSelectorProps) {
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

      {/* Selection Path */}
      {selection.area && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 text-xs">
          <span className="font-medium text-gray-700">{selection.area.area_name}</span>
          {selection.building && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="font-medium text-gray-700">{selection.building.building_name}</span>
            </>
          )}
          {selection.floor && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="font-medium text-gray-700">{selection.floor.floor_name}</span>
            </>
          )}
          {selection.room && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="font-medium text-[oklch(0.75_0.1_250)]">{selection.room.room_name}</span>
            </>
          )}
          <button
            onClick={handleReset}
            className="ml-auto p-1 rounded hover:bg-gray-200 transition-colors"
            title="重新选择"
          >
            <RotateCcw className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      )}

      {/* Selection Content */}
      <div className="min-h-[200px]">
        {selection.step === 'area' && (
          <SelectionGrid>
            {data.areas.map((area) => (
              <SelectionCard
                key={area.area_id}
                icon={<MapPin className="w-5 h-5" />}
                title={area.area_name}
                subtitle={`${area.buildings.length} 栋楼`}
                onClick={() => handleSelectArea(area)}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'building' && selection.area && (
          <SelectionGrid>
            {selection.area.buildings.map((building) => (
              <SelectionCard
                key={building.building_id}
                icon={<Building2 className="w-5 h-5" />}
                title={building.building_name}
                subtitle={`${building.floors.length} 层`}
                onClick={() => handleSelectBuilding(building)}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'floor' && selection.building && (
          <SelectionGrid>
            {selection.building.floors.map((floor) => (
              <SelectionCard
                key={floor.floor_id}
                icon={<Layers className="w-5 h-5" />}
                title={floor.floor_name}
                subtitle={`${floor.rooms.length} 间`}
                onClick={() => handleSelectFloor(floor)}
              />
            ))}
          </SelectionGrid>
        )}

        {selection.step === 'room' && selection.floor && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {selection.floor.rooms.map((room) => (
                <button
                  key={room.room_id}
                  onClick={() => handleSelectRoom(room)}
                  className={`p-2 rounded-xl text-xs font-medium transition-all ${
                    room.room_id === selectedRoomId
                      ? 'bg-[oklch(0.75_0.1_250)] text-white shadow-sm'
                      : 'bg-gray-50 text-gray-700 hover:bg-[oklch(0.75_0.1_250_/0.1)] hover:text-[oklch(0.75_0.1_250)] border border-gray-100'
                  }`}
                >
                  {room.room_name}
                </button>
              ))}
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
}

function SelectionCard({ icon, title, subtitle, onClick }: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-[oklch(0.75_0.1_250_/0.1)] border border-gray-100 hover:border-[oklch(0.75_0.1_250_/0.3)] transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[oklch(0.75_0.1_250)] group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-[oklch(0.75_0.1_250)]">{title}</span>
      <span className="text-xs text-gray-400">{subtitle}</span>
    </button>
  );
}
