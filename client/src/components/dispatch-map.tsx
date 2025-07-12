import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Zap, Car, Truck, Ambulance, Shield, Maximize2, Minimize2, Move, MousePointer, RotateCcw, Building } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Incident, Unit } from "@shared/schema";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Police services data
const policeServicesData = {
  "type": "FeatureCollection",
  "crs": {"type": "name", "properties": {"name": "EPSG:4326"}},
  "features": [
    {
      "type": "Feature",
      "id": 1,
      "geometry": {"type": "Point", "coordinates": [-79.0895878955032, 43.0967581049929]},
      "properties": {
        "OBJECTID": 1,
        "supp_ID": 35,
        "pID": 139574,
        "Name": "Niagara Regional Police Service - 2 District",
        "Address": "5700 VALLEY WY",
        "Type": "NRP",
        "SUBCAT": "Regional",
        "URL": "http://www.nrps.com"
      }
    },
    {
      "type": "Feature",
      "id": 2,
      "geometry": {"type": "Point", "coordinates": [-79.0861005540053, 43.0974804958421]},
      "properties": {
        "OBJECTID": 2,
        "supp_ID": 36,
        "pID": 3841,
        "Name": "Ontario Provincial Police - HSD-NIAGARA",
        "Address": "5345 STANLEY AVE",
        "Type": "OPP",
        "SUBCAT": "Provincial",
        "URL": "http://www.opp.ca/"
      }
    },
    {
      "type": "Feature",
      "id": 3,
      "geometry": {"type": "Point", "coordinates": [-79.0772266015336, 43.0872466389696]},
      "properties": {
        "OBJECTID": 3,
        "supp_ID": 5757,
        "pID": 30748,
        "Name": "Niagara Parks Police Service Headquarters",
        "Address": "6075 NIAGARA RIVER PY",
        "Type": "NPP",
        "SUBCAT": "Niagara Parks Commission",
        "URL": "http://www.niagaraparks.com/about/niagara-parks-police.html"
      }
    }
  ]
};

interface DispatchMapProps {
  incidents: Incident[];
  units: Unit[];
  onIncidentSelect?: (incident: Incident) => void;
  onUnitSelect?: (unit: Unit) => void;
  className?: string;
}

export function DispatchMap({ incidents, units, onIncidentSelect, onUnitSelect, className }: DispatchMapProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const incidentMarkersRef = useRef<L.LayerGroup>(L.layerGroup());
  const unitMarkersRef = useRef<L.LayerGroup>(L.layerGroup());
  const policeServicesRef = useRef<L.LayerGroup>(L.layerGroup());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isMoveModeActive, setIsMoveModeActive] = useState(false);
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null);
  const [showPoliceServices, setShowPoliceServices] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Niagara Falls, Ontario
    const map = L.map(mapContainerRef.current, {
      center: [43.0896, -79.0849], // Niagara Falls coordinates
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add marker layers
    incidentMarkersRef.current.addTo(map);
    unitMarkersRef.current.addTo(map);
    policeServicesRef.current.addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current!.invalidateSize();
      }, 100);
    }
  }, [isFullscreen]);

  // Create custom icons
  const createIncidentIcon = (priority: string) => {
    const color = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#eab308' : '#22c55e';
    return L.divIcon({
      html: `<div style="
        width: 24px; 
        height: 24px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
          <path d="M13 3a9 9 0 0 0-9 9H1l4 4 4-4H6a7 7 0 1 1 7 7v-2.5a4.5 4.5 0 1 0-4.5-4.5H11l-4 4-4-4h3a6 6 0 0 1 6-6z"/>
        </svg>
      </div>`,
      className: 'custom-incident-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createUnitIcon = (type: string, status: string) => {
    const statusColor = status === 'available' ? '#22c55e' : 
                       status === 'responding' ? '#3b82f6' : 
                       status === 'dispatched' ? '#eab308' : 
                       status === 'busy' ? '#ef4444' : '#6b7280';
    
    const iconSvg = type === 'police' ? 
      '<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>' :
      type === 'fire' ? 
      '<path d="M3 17h18v2H3v-2zM6.5 6L12 2l5.5 4v11h-11V6z"/>' :
      '<path d="M19 7c0-1.1-.9-2-2-2h-3V3c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v2H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7z"/>';

    return L.divIcon({
      html: `<div style="
        width: 32px; 
        height: 32px; 
        background-color: ${statusColor}; 
        border: 2px solid white; 
        border-radius: 6px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: ${isMoveModeActive ? 'move' : 'pointer'};
      ">
        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
          ${iconSvg}
        </svg>
      </div>`,
      className: 'custom-unit-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const createPoliceServiceIcon = (type: string) => {
    const color = type === 'NRP' ? '#1e40af' : type === 'OPP' ? '#dc2626' : '#059669';
    
    return L.divIcon({
      html: `<div style="
        width: 28px; 
        height: 28px; 
        background-color: ${color}; 
        border: 3px solid white; 
        border-radius: 8px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        cursor: pointer;
      ">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
          <path d="M7 3V1H17V3H20C21.1 3 22 3.9 22 5V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H7ZM7 5H4V19H20V5H17V7H7V5ZM9 5V7H15V5H9Z"/>
        </svg>
      </div>`,
      className: 'custom-police-service-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Update incident markers
  useEffect(() => {
    if (!mapRef.current) return;

    incidentMarkersRef.current.clearLayers();

    incidents.forEach((incident) => {
      if (incident.latitude && incident.longitude) {
        const marker = L.marker([incident.latitude, incident.longitude], {
          icon: createIncidentIcon(incident.priority)
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #f59e0b;">${incident.incidentNumber}</h3>
            <p style="margin: 0 0 4px 0;"><strong>${t('beaverpatch.type')}:</strong> ${incident.type}</p>
            <p style="margin: 0 0 4px 0;"><strong>${t('common.priority')}:</strong> ${incident.priority}</p>
            <p style="margin: 0 0 4px 0;"><strong>${t('common.address')}:</strong> ${incident.address}</p>
            <p style="margin: 0 0 4px 0;"><strong>${t('common.status')}:</strong> ${incident.status}</p>
            <p style="margin: 0;"><strong>${t('common.description')}:</strong> ${incident.description}</p>
          </div>
        `);

        marker.on('click', () => {
          setSelectedIncident(incident);
          setSelectedUnit(null);
          onIncidentSelect?.(incident);
        });

        incidentMarkersRef.current.addLayer(marker);
      }
    });
  }, [incidents, onIncidentSelect, t]);

  // Update unit markers
  useEffect(() => {
    if (!mapRef.current) return;

    unitMarkersRef.current.clearLayers();

    units.forEach((unit) => {
      if (unit.latitude && unit.longitude) {
        const marker = L.marker([unit.latitude, unit.longitude], {
          icon: createUnitIcon(unit.type, unit.status),
          draggable: isMoveModeActive
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #f59e0b;">${unit.unitNumber}</h3>
            <p style="margin: 0 0 4px 0;"><strong>${t('beaverpatch.type')}:</strong> ${unit.type}</p>
            <p style="margin: 0 0 4px 0;"><strong>${t('common.status')}:</strong> ${unit.status}</p>
            <p style="margin: 0;"><strong>${t('common.location')}:</strong> ${unit.currentLocation}</p>
          </div>
        `);

        marker.on('click', () => {
          if (!isMoveModeActive) {
            setSelectedUnit(unit);
            setSelectedIncident(null);
            onUnitSelect?.(unit);
          }
        });

        if (isMoveModeActive) {
          marker.on('dragstart', () => {
            setDraggedUnit(unit);
          });

          marker.on('dragend', (e) => {
            const newPos = e.target.getLatLng();
            // Here you would normally update the unit position in your backend
            console.log(`Unit ${unit.unitNumber} moved to:`, newPos.lat, newPos.lng);
            setDraggedUnit(null);
          });
        }

        unitMarkersRef.current.addLayer(marker);
      }
    });
  }, [units, isMoveModeActive, onUnitSelect, t]);

  // Load and display police services data
  useEffect(() => {
    if (!mapRef.current || !showPoliceServices) return;

    policeServicesRef.current.clearLayers();

    // Load the GeoJSON data
    policeServicesData.features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      
      const marker = L.marker([lat, lng], {
        icon: createPoliceServiceIcon(props.Type)
      });

      marker.bindPopup(`
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 14px;">${props.Name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Type:</strong> ${props.Type} - ${props.SUBCAT}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Address:</strong> ${props.Address}</p>
          ${props.URL ? `<p style="margin: 0; font-size: 12px;"><strong>Website:</strong> <a href="${props.URL}" target="_blank" style="color: #3b82f6;">${props.URL}</a></p>` : ''}
        </div>
      `);

      policeServicesRef.current.addLayer(marker);
    });
  }, [showPoliceServices]);

  // Toggle police services visibility
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (showPoliceServices) {
      policeServicesRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(policeServicesRef.current);
    }
  }, [showPoliceServices]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMoveMode = () => {
    setIsMoveModeActive(!isMoveModeActive);
    if (isMoveModeActive) {
      setDraggedUnit(null);
    }
  };

  const togglePoliceServices = () => {
    setShowPoliceServices(!showPoliceServices);
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([43.0896, -79.0849], 13);
    }
  };

  return (
    <Card className={`bg-beaver-surface border-beaver-surface-light ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-beaver-orange flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
{t('beaverpatch.dispatchMapTitle')}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Map Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="text-gray-400 hover:text-white"
              title={t('beaverpatch.mapReset')}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant={isMoveModeActive ? "default" : "ghost"}
              size="sm"
              onClick={toggleMoveMode}
              className={`${isMoveModeActive ? 'bg-beaver-orange text-white' : 'text-gray-400 hover:text-white'}`}
              title={isMoveModeActive ? t('beaverpatch.mapExitMoveMode') : t('beaverpatch.mapMoveMode')}
            >
              {isMoveModeActive ? <MousePointer className="w-4 h-4" /> : <Move className="w-4 h-4" />}
            </Button>

            <Button
              variant={showPoliceServices ? "default" : "ghost"}
              size="sm"
              onClick={togglePoliceServices}
              className={`${showPoliceServices ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title={showPoliceServices ? "Hide Police Services" : "Show Police Services"}
            >
              <Building className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-gray-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Move Mode Indicator */}
        {isMoveModeActive && (
          <div className="mt-2 p-2 bg-beaver-orange bg-opacity-20 border border-beaver-orange rounded text-sm text-beaver-orange">
            🎯 {t('beaverpatch.moveModeActive')}
            {draggedUnit && ` | ${t('beaverpatch.moving')}: ${draggedUnit.unitNumber}`}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-3">
        <div 
          ref={mapContainerRef}
          className={`w-full rounded-lg border border-gray-700 ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-full min-h-[400px]'
          }`}
        />

        {/* Real-time Legend */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-beaver-surface-light p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-beaver-orange mb-2">{t('beaverpatch.incidentPriority')}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                <span className="text-gray-300">{t('beaverpatch.highPriority')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 border-2 border-white rounded-full"></div>
                <span className="text-gray-300">{t('beaverpatch.mediumPriority')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                <span className="text-gray-300">{t('beaverpatch.lowPriority')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-beaver-surface-light p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-beaver-orange mb-2">{t('beaverpatch.unitStatus')}</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 border-2 border-white rounded"></div>
                <span className="text-gray-300">{t('beaverpatch.available')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded"></div>
                <span className="text-gray-300">{t('beaverpatch.responding')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 border-2 border-white rounded"></div>
                <span className="text-gray-300">{t('beaverpatch.dispatched')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 border-2 border-white rounded"></div>
                <span className="text-gray-300">{t('beaverpatch.busy')}</span>
              </div>
            </div>
          </div>
          
          {showPoliceServices && (
            <div className="bg-beaver-surface-light p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-beaver-orange mb-2">Police Services</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-700 border-2 border-white rounded"></div>
                  <span className="text-gray-300">NRP - Regional</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 border-2 border-white rounded"></div>
                  <span className="text-gray-300">OPP - Provincial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 border-2 border-white rounded"></div>
                  <span className="text-gray-300">NPP - Parks</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected item details */}
        {(selectedIncident || selectedUnit) && (
          <div className="mt-4 p-4 bg-beaver-surface-light rounded-lg">
            {selectedIncident && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-red-500 text-white border-none">
                    {selectedIncident.priority.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{selectedIncident.incidentNumber}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <div><strong>{t('beaverpatch.type')}:</strong> {selectedIncident.type}</div>
                  <div><strong>{t('common.address')}:</strong> {selectedIncident.address}</div>
                  <div><strong>{t('common.status')}:</strong> {selectedIncident.status}</div>
                  <div><strong>{t('common.description')}:</strong> {selectedIncident.description}</div>
                </div>
              </div>
            )}
            {selectedUnit && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-500 text-white border-none">
                    {selectedUnit.status.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{selectedUnit.unitNumber}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <div><strong>{t('beaverpatch.type')}:</strong> {selectedUnit.type}</div>
                  <div><strong>{t('common.location')}:</strong> {selectedUnit.currentLocation}</div>
                  <div><strong>{t('common.status')}:</strong> {selectedUnit.status}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}