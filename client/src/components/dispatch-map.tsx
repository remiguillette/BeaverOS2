import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Zap, Car, Truck, Ambulance, Shield, Maximize2, Minimize2 } from "lucide-react";
import type { Incident, Unit } from "@shared/schema";

interface DispatchMapProps {
  incidents: Incident[];
  units: Unit[];
  onIncidentSelect?: (incident: Incident) => void;
  onUnitSelect?: (unit: Unit) => void;
  className?: string;
}

export function DispatchMap({ incidents, units, onIncidentSelect, onUnitSelect, className }: DispatchMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Mock map implementation centered on Niagara Falls, Ontario
  const mapBounds = {
    minLat: 43.070,    // Southern boundary of Niagara Falls, ON
    maxLat: 43.110,    // Northern boundary of Niagara Falls, ON
    minLon: -79.110,   // Western boundary 
    maxLon: -79.050    // Eastern boundary
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case "police": return <Shield className="w-4 h-4" />;
      case "fire": return <Truck className="w-4 h-4" />;
      case "ambulance": return <Ambulance className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getUnitColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "responding": return "bg-blue-500";
      case "dispatched": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      case "enroute": return "bg-orange-500";
      case "off_duty": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getPositionOnMap = (lat: number | null, lon: number | null) => {
    if (!lat || !lon) return { x: 50, y: 50 }; // Default center
    
    const x = ((lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 100;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setSelectedUnit(null);
    onIncidentSelect?.(incident);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedIncident(null);
    onUnitSelect?.(unit);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`bg-beaver-surface border-beaver-surface-light ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-beaver-orange flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Dispatch Map - Niagara Falls, ON
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div 
          ref={mapContainerRef}
          className={`relative bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-full min-h-[400px]'
          }`}
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Map overlay with Niagara Falls street patterns */}
          <div className="absolute inset-0 opacity-30">
            {/* Major East-West Roads */}
            <div className="absolute top-[15%] left-0 w-full h-1 bg-yellow-400" title="Rainbow Blvd"></div>
            <div className="absolute top-[35%] left-0 w-full h-0.5 bg-gray-500" title="Falls Ave"></div>
            <div className="absolute top-[50%] left-0 w-full h-1 bg-yellow-400" title="Lundy's Lane"></div>
            <div className="absolute top-[65%] left-0 w-full h-0.5 bg-gray-500" title="Stanley Ave"></div>
            <div className="absolute top-[80%] left-0 w-full h-0.5 bg-gray-500" title="Morrison St"></div>
            
            {/* Major North-South Roads */}
            <div className="absolute left-[20%] top-0 w-1 h-full bg-yellow-400" title="Niagara Pkwy"></div>
            <div className="absolute left-[40%] top-0 w-0.5 h-full bg-gray-500" title="Main St"></div>
            <div className="absolute left-[60%] top-0 w-0.5 h-full bg-gray-500" title="Ferry St"></div>
            <div className="absolute left-[80%] top-0 w-1 h-full bg-yellow-400" title="QEW"></div>
            
            {/* Niagara River representation */}
            <div className="absolute left-[5%] top-0 w-3 h-full bg-blue-400 opacity-50" title="Niagara River"></div>
            
            {/* Falls area indicator */}
            <div className="absolute left-[15%] top-[25%] w-8 h-8 rounded-full bg-blue-300 opacity-60" title="Niagara Falls"></div>
          </div>
          
          {/* Location labels */}
          <div className="absolute inset-0 text-xs text-gray-400 pointer-events-none">
            <div className="absolute left-[10%] top-[20%] font-bold">Falls</div>
            <div className="absolute left-[75%] top-[15%] font-bold">Tourist Area</div>
            <div className="absolute left-[45%] top-[45%] font-bold">Downtown</div>
            <div className="absolute left-[70%] top-[75%] font-bold">Industrial</div>
          </div>

          {/* Render incidents */}
          {incidents.map((incident) => {
            const position = getPositionOnMap(incident.latitude, incident.longitude);
            const isSelected = selectedIncident?.id === incident.id;
            
            return (
              <div
                key={incident.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={() => handleIncidentClick(incident)}
              >
                <div className={`w-6 h-6 rounded-full ${getPriorityColor(incident.priority)} border-2 border-white shadow-lg flex items-center justify-center`}>
                  <Zap className="w-3 h-3 text-white" />
                </div>
                {isSelected && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {incident.incidentNumber} - {incident.type}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render units */}
          {units.map((unit) => {
            const position = getPositionOnMap(unit.latitude, unit.longitude);
            const isSelected = selectedUnit?.id === unit.id;
            
            return (
              <div
                key={unit.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={() => handleUnitClick(unit)}
              >
                <div className={`w-8 h-8 rounded-lg ${getUnitColor(unit.status)} border-2 border-white shadow-lg flex items-center justify-center`}>
                  {getUnitIcon(unit.type)}
                </div>
                {isSelected && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {unit.unitNumber} - {unit.status}
                  </div>
                )}
              </div>
            );
          })}

          {/* Map legend */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
            <div className="space-y-1">
              <div className="font-semibold text-xs mb-1">Legend</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Med</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Low</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span>Avail</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <span>Resp</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                    <span>Busy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected item details */}
        {(selectedIncident || selectedUnit) && (
          <div className="mt-4 p-4 bg-beaver-surface-light rounded-lg">
            {selectedIncident && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${getPriorityColor(selectedIncident.priority)} text-white border-none`}>
                    {selectedIncident.priority.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{selectedIncident.incidentNumber}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <div><strong>Type:</strong> {selectedIncident.type}</div>
                  <div><strong>Address:</strong> {selectedIncident.address}</div>
                  <div><strong>Status:</strong> {selectedIncident.status}</div>
                  <div><strong>Description:</strong> {selectedIncident.description}</div>
                </div>
              </div>
            )}
            {selectedUnit && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${getUnitColor(selectedUnit.status)} text-white border-none`}>
                    {selectedUnit.status.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{selectedUnit.unitNumber}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <div><strong>Type:</strong> {selectedUnit.type}</div>
                  <div><strong>Location:</strong> {selectedUnit.currentLocation}</div>
                  <div><strong>Status:</strong> {selectedUnit.status}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}