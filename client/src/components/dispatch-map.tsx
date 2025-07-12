import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Zap, Car, Truck, Ambulance, Shield, Maximize2, Minimize2, Move, MousePointer, RotateCcw, Building, Flame, Route, Home } from "lucide-react";
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
  const fireServicesRef = useRef<L.LayerGroup>(L.layerGroup());
  const roadsRef = useRef<L.LayerGroup>(L.layerGroup());
  const addressPointsRef = useRef<L.LayerGroup>(L.layerGroup());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isMoveModeActive, setIsMoveModeActive] = useState(false);
  const [draggedUnit, setDraggedUnit] = useState<Unit | null>(null);
  const [showPoliceServices, setShowPoliceServices] = useState(true);
  const [showFireServices, setShowFireServices] = useState(true);
  const [showRoads, setShowRoads] = useState(false);
  const [showAddressPoints, setShowAddressPoints] = useState(false);
  const [fireServicesData, setFireServicesData] = useState<any>(null);
  const [roadsData, setRoadsData] = useState<any>(null);
  const [addressPointsData, setAddressPointsData] = useState<any>(null);

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
    fireServicesRef.current.addTo(map);
    roadsRef.current.addTo(map);
    addressPointsRef.current.addTo(map);

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

  // Load geojson data on mount
  useEffect(() => {
    const loadGeojsonData = async () => {
      try {
        // Load Fire Services data
        const fireResponse = await fetch('/data/Niagara_Falls_Fire_Services_WGS_1984_-15576019196615138.geojson');
        if (fireResponse.ok) {
          const fireData = await fireResponse.json();
          setFireServicesData(fireData);
        }

        // Load Roads data
        const roadsResponse = await fetch('/data/OpenData_Roads_-2370296509799728319.geojson');
        if (roadsResponse.ok) {
          const roadsData = await roadsResponse.json();
          setRoadsData(roadsData);
        }

        // Load Address Points data (sample only due to large size)
        const addressResponse = await fetch('/data/OpenData_Address_Points_-2748781945479425711.geojson');
        if (addressResponse.ok) {
          const addressData = await addressResponse.json();
          // Limit to first 1000 points for performance
          const limitedAddressData = {
            ...addressData,
            features: addressData.features.slice(0, 1000)
          };
          setAddressPointsData(limitedAddressData);
        }
      } catch (error) {
        console.warn("Failed to load geojson data:", error);
      }
    };

    loadGeojsonData();
  }, []);

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

  const createFireServiceIcon = () => {
    return L.divIcon({
      html: `<div style="
        width: 28px; 
        height: 28px; 
        background-color: #dc2626; 
        border: 3px solid white; 
        border-radius: 8px; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.4);
        cursor: pointer;
      ">
        <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
          <path d="M12 2C9.8 4.7 8.3 7.7 8.3 10.5C8.3 13.8 10.5 16 12 16S15.7 13.8 15.7 10.5C15.7 7.7 14.2 4.7 12 2M12 13C10.9 13 10 12.1 10 11S10.9 9 12 9 14 9.9 14 11 13.1 13 12 13Z"/>
        </svg>
      </div>`,
      className: 'custom-fire-service-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const createAddressPointIcon = () => {
    return L.divIcon({
      html: `<div style="
        width: 8px; 
        height: 8px; 
        background-color: #3b82f6; 
        border: 1px solid white; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      className: 'custom-address-point-marker',
      iconSize: [8, 8],
      iconAnchor: [4, 4]
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

  // Load and display fire services data
  useEffect(() => {
    if (!mapRef.current || !showFireServices || !fireServicesData) return;

    fireServicesRef.current.clearLayers();

    fireServicesData.features.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      
      const marker = L.marker([lat, lng], {
        icon: createFireServiceIcon()
      });

      marker.bindPopup(`
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 14px;">${props.NAME}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Station ID:</strong> ${props.NF_ID}</p>
          <p style="margin: 0; font-size: 12px;"><strong>Address:</strong> ${props.ADDRESS}</p>
        </div>
      `);

      fireServicesRef.current.addLayer(marker);
    });
  }, [showFireServices, fireServicesData]);

  // Load and display roads data
  useEffect(() => {
    if (!mapRef.current || !showRoads || !roadsData) return;

    roadsRef.current.clearLayers();

    // Only show a sample of roads for performance (first 500)
    const limitedFeatures = roadsData.features.slice(0, 500);
    
    limitedFeatures.forEach((feature: any) => {
      const coordinates = feature.geometry.coordinates;
      const props = feature.properties;
      
      // Convert coordinates to Leaflet format
      const latlngs = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      const polyline = L.polyline(latlngs, {
        color: '#6b7280',
        weight: 2,
        opacity: 0.6
      });

      polyline.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 14px;">${props.Full_Str_Name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Owner:</strong> ${props.Owner}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Municipality:</strong> ${props.Left_Mun}</p>
          <p style="margin: 0; font-size: 12px;"><strong>Status:</strong> ${props.Public_Status}</p>
        </div>
      `);

      roadsRef.current.addLayer(polyline);
    });
  }, [showRoads, roadsData]);

  // Load and display address points data
  useEffect(() => {
    if (!mapRef.current || !showAddressPoints || !addressPointsData) return;

    addressPointsRef.current.clearLayers();

    addressPointsData.features.forEach((feature: any) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;
      
      const marker = L.marker([lat, lng], {
        icon: createAddressPointIcon()
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #f59e0b; font-size: 14px;">${props.Full_StreetNo} ${props.StreetName} ${props.StreetType}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px;"><strong>Municipality:</strong> ${props.Municipality}</p>
          <p style="margin: 0; font-size: 12px;"><strong>Status:</strong> ${props.LifeCycleStatus}</p>
        </div>
      `);

      addressPointsRef.current.addLayer(marker);
    });
  }, [showAddressPoints, addressPointsData]);

  // Toggle layer visibility
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (showFireServices) {
      fireServicesRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(fireServicesRef.current);
    }
  }, [showFireServices]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (showRoads) {
      roadsRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(roadsRef.current);
    }
  }, [showRoads]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (showAddressPoints) {
      addressPointsRef.current.addTo(mapRef.current);
    } else {
      mapRef.current.removeLayer(addressPointsRef.current);
    }
  }, [showAddressPoints]);

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

  const toggleFireServices = () => {
    setShowFireServices(!showFireServices);
  };

  const toggleRoads = () => {
    setShowRoads(!showRoads);
  };

  const toggleAddressPoints = () => {
    setShowAddressPoints(!showAddressPoints);
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
              variant={showFireServices ? "default" : "ghost"}
              size="sm"
              onClick={toggleFireServices}
              className={`${showFireServices ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title={showFireServices ? "Hide Fire Services" : "Show Fire Services"}
            >
              <Flame className="w-4 h-4" />
            </Button>

            <Button
              variant={showRoads ? "default" : "ghost"}
              size="sm"
              onClick={toggleRoads}
              className={`${showRoads ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title={showRoads ? "Hide Roads" : "Show Roads"}
            >
              <Route className="w-4 h-4" />
            </Button>

            <Button
              variant={showAddressPoints ? "default" : "ghost"}
              size="sm"
              onClick={toggleAddressPoints}
              className={`${showAddressPoints ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title={showAddressPoints ? "Hide Address Points" : "Show Address Points"}
            >
              <Home className="w-4 h-4" />
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
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

          {showFireServices && (
            <div className="bg-beaver-surface-light p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-beaver-orange mb-2">Fire Services</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 border-2 border-white rounded"></div>
                  <span className="text-gray-300">Fire Stations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-700 border-2 border-white rounded"></div>
                  <span className="text-gray-300">Fire Admin</span>
                </div>
              </div>
            </div>
          )}

          {showRoads && (
            <div className="bg-beaver-surface-light p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-beaver-orange mb-2">Road Network</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-gray-500 rounded"></div>
                  <span className="text-gray-300">Municipal Roads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-gray-600 rounded"></div>
                  <span className="text-gray-300">Provincial Roads</span>
                </div>
              </div>
            </div>
          )}

          {showAddressPoints && (
            <div className="bg-beaver-surface-light p-3 rounded-lg">
              <h4 className="text-sm font-semibold text-beaver-orange mb-2">Address Points</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 border border-white rounded-full"></div>
                  <span className="text-gray-300">Residential</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 border border-white rounded-full"></div>
                  <span className="text-gray-300">Commercial</span>
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