// Room hierarchy types
export interface Room {
  room_id: string;
  room_name: string;
}

export interface Floor {
  floor_id: string;
  floor_name: string;
  rooms: Room[];
}

export interface Building {
  building_id: string;
  building_name: string;
  floors: Floor[];
}

export interface Area {
  area_id: string;
  area_name: string;
  buildings: Building[];
}

export interface RoomsTree {
  summary: {
    total_areas: number;
    total_buildings: number;
    total_floors: number;
    total_rooms: number;
    generated_at: string;
    hierarchy_structure: string;
    data_format: string;
  };
  areas: Area[];
}

// Notice types
export interface Notice {
  title: string;
  body: string;
  icon: string;
  duration: number;
}

// Battery API types
export interface BatteryResponse {
  success: boolean;
  data: {
    room: string;
    quantity: string;
    unit: string;
    description: string;
  } | null;
  message?: string;
  error?: string;
}

// History types
export interface HistoryItem {
  roomId: string;
  roomName: string;
  buildingName: string;
  timestamp: number;
}

// Query state
export interface QueryState {
  selectedArea: string | null;
  selectedBuilding: string | null;
  selectedFloor: string | null;
  selectedRoom: string | null;
}
