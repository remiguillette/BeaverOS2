import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  searchStreets,
  parseAddressAndDetectIntersection,
  findClosestIntersection,
  IntersectionData,
} from "@/utils/street-intersection";

interface SmartAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onCrossStreetChange: (crossStreet: string) => void;
  onGeolocation: () => void;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function SmartAddressInput({
  value,
  onChange,
  onCrossStreetChange,
  onGeolocation,
  latitude,
  longitude,
  className,
}: SmartAddressInputProps) {
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [intersectionSuggestions, setIntersectionSuggestions] = useState<IntersectionData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedStreets, setDetectedStreets] = useState<string[]>([]);
  const [suggestedCrossStreet, setSuggestedCrossStreet] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value && value.length >= 2) {
        handleAddressAnalysis(value);
      } else {
        setStreetSuggestions([]);
        setIntersectionSuggestions([]);
        setDetectedStreets([]);
        setSuggestedCrossStreet("");
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  // Check for nearby intersections when GPS coordinates are available
  useEffect(() => {
    if (latitude && longitude) {
      handleGPSIntersectionCheck(latitude, longitude);
    }
  }, [latitude, longitude]);

  const handleAddressAnalysis = async (address: string) => {
    setIsLoading(true);
    try {
      // Get street suggestions
      const streets = await searchStreets(address);
      setStreetSuggestions(streets.slice(0, 8)); // Limit to 8 suggestions

      // Analyze the address for intersections
      const analysis = await parseAddressAndDetectIntersection(address);
      setDetectedStreets(analysis.detectedStreets);
      setIntersectionSuggestions(analysis.suggestedIntersections);
      
      if (analysis.crossStreet) {
        setSuggestedCrossStreet(analysis.crossStreet);
        onCrossStreetChange(analysis.crossStreet);
      }

      setShowSuggestions(streets.length > 0 || analysis.suggestedIntersections.length > 0);
    } catch (error) {
      console.error("Error analyzing address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGPSIntersectionCheck = async (lat: number, lng: number) => {
    try {
      const closestIntersection = await findClosestIntersection(lat, lng);
      if (closestIntersection) {
        const crossStreet = closestIntersection.street2 || closestIntersection.street1;
        if (crossStreet) {
          setSuggestedCrossStreet(crossStreet);
          onCrossStreetChange(crossStreet);
        }
      }
    } catch (error) {
      console.error("Error finding closest intersection:", error);
    }
  };

  const handleStreetSelect = (street: string) => {
    onChange(street);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleIntersectionSelect = (intersection: IntersectionData) => {
    // Set the main address to the intersection name
    onChange(intersection.intName);
    
    // Extract cross street (usually the second street in the intersection)
    const crossStreet = intersection.street2 || intersection.street1;
    if (crossStreet && crossStreet !== intersection.street1) {
      setSuggestedCrossStreet(crossStreet);
      onCrossStreetChange(crossStreet);
    }
    
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeCrossStreetSuggestion = () => {
    setSuggestedCrossStreet("");
    onCrossStreetChange("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="address" className="text-white">{t('beaverpatch.address')}</Label>
      <div className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              id="address"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('beaverpatch.enterFullAddress')}
              className={`bg-beaver-surface-light border-gray-600 text-white ${className}`}
              onFocus={() => setShowSuggestions(streetSuggestions.length > 0 || intersectionSuggestions.length > 0)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-beaver-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <Button
            type="button"
            onClick={onGeolocation}
            variant="outline"
            className="bg-beaver-surface-light border-gray-600 text-white hover:bg-gray-600"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (streetSuggestions.length > 0 || intersectionSuggestions.length > 0) && (
          <div className="absolute z-50 w-full mt-1 bg-beaver-surface-light border border-gray-600 rounded-md shadow-lg max-h-64 overflow-y-auto">
            {/* Street suggestions */}
            {streetSuggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-beaver-surface border-b border-gray-600">
                  {t('beaverpatch.streetSuggestions')}
                </div>
                {streetSuggestions.map((street, index) => (
                  <button
                    key={`street-${index}`}
                    className="w-full px-3 py-2 text-left text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-none"
                    onClick={() => handleStreetSelect(street)}
                  >
                    <div className="flex items-center">
                      <Navigation className="w-4 h-4 mr-2 text-gray-400" />
                      {street}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Intersection suggestions */}
            {intersectionSuggestions.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-beaver-surface border-b border-gray-600">
                  {t('beaverpatch.intersectionSuggestions')}
                </div>
                {intersectionSuggestions.slice(0, 5).map((intersection, index) => (
                  <button
                    key={`intersection-${index}`}
                    className="w-full px-3 py-2 text-left text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-none"
                    onClick={() => handleIntersectionSelect(intersection)}
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-beaver-orange" />
                      <div>
                        <div className="font-medium">{intersection.intName}</div>
                        <div className="text-xs text-gray-400">
                          {intersection.street1} & {intersection.street2}
                          {intersection.street3 && ` & ${intersection.street3}`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detected streets badges */}
      {detectedStreets.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs text-gray-400">{t('beaverpatch.detectedStreets')}:</span>
          {detectedStreets.map((street, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {street}
            </Badge>
          ))}
        </div>
      )}

      {/* Suggested cross street */}
      {suggestedCrossStreet && (
        <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">
              {t('beaverpatch.suggestedCrossStreet')}: <strong>{suggestedCrossStreet}</strong>
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeCrossStreetSuggestion}
            className="text-green-400 hover:text-green-300 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}