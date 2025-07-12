// Import the GeoJSON data as JSON modules
const streetDataURL = "/data/Niagara_Falls_Street_Name_Index_-8670139053025367381_1752312661882.geojson";
const intersectionDataURL = "/data/Niagara_Falls_Road_Intersections_-1092401235777495093_1752312814144.geojson";

export interface StreetData {
  objectId: number;
  street: string;
  streetBack: string;
  streetAhead: string;
  status: string;
  owner: string;
}

export interface IntersectionData {
  objectId: number;
  intName: string;
  street1: string;
  street2: string;
  street3?: string;
  street4?: string;
  coordinates: [number, number];
  junction: string;
}

let streetsData: StreetData[] = [];
let intersectionsData: IntersectionData[] = [];
let isDataLoaded = false;

// Load and parse the GeoJSON data
export const loadStreetData = async (): Promise<void> => {
  if (isDataLoaded) return;

  try {
    // Fetch street data
    const streetResponse = await fetch(streetDataURL);
    const streetDataGeoJSON = await streetResponse.json();
    
    if (streetDataGeoJSON && streetDataGeoJSON.features) {
      streetsData = streetDataGeoJSON.features.map((feature: any) => ({
        objectId: feature.properties.OBJECTID,
        street: feature.properties.STREET,
        streetBack: feature.properties.STREET_BACK,
        streetAhead: feature.properties.STREET_AHEAD,
        status: feature.properties.STATUS,
        owner: feature.properties.OWNER,
      }));
    }

    // Fetch intersection data
    const intersectionResponse = await fetch(intersectionDataURL);
    const intersectionDataGeoJSON = await intersectionResponse.json();
    
    if (intersectionDataGeoJSON && intersectionDataGeoJSON.features) {
      intersectionsData = intersectionDataGeoJSON.features.map((feature: any) => ({
        objectId: feature.properties.OBJECTID,
        intName: feature.properties.INT_NAME,
        street1: feature.properties.STREET1,
        street2: feature.properties.STREET2,
        street3: feature.properties.STREET3,
        street4: feature.properties.STREET4,
        coordinates: feature.geometry?.coordinates || [0, 0],
        junction: feature.properties.JUNCTION,
      }));
    }

    isDataLoaded = true;
    console.log(`Loaded ${streetsData.length} streets and ${intersectionsData.length} intersections`);
  } catch (error) {
    console.error("Failed to load street data:", error);
  }
};

// Search for streets that match the input
export const searchStreets = async (query: string): Promise<string[]> => {
  await loadStreetData();
  
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const matchingStreets = new Set<string>();

  // Search in main street names
  streetsData.forEach(street => {
    if (street.street && street.street.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(street.street);
    }
    if (street.streetBack && street.streetBack.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(street.streetBack);
    }
    if (street.streetAhead && street.streetAhead.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(street.streetAhead);
    }
  });

  // Also search in intersection street names
  intersectionsData.forEach(intersection => {
    if (intersection.street1 && intersection.street1.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(intersection.street1);
    }
    if (intersection.street2 && intersection.street2.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(intersection.street2);
    }
    if (intersection.street3 && intersection.street3.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(intersection.street3);
    }
    if (intersection.street4 && intersection.street4.toLowerCase().includes(normalizedQuery)) {
      matchingStreets.add(intersection.street4);
    }
  });

  return Array.from(matchingStreets)
    .filter(street => street && street.trim() !== "")
    .sort();
};

// Find intersections for a given street
export const findIntersectionsForStreet = async (streetName: string): Promise<IntersectionData[]> => {
  await loadStreetData();
  
  if (!streetName || streetName.trim() === "") return [];

  const normalizedStreet = streetName.toLowerCase().trim();
  
  return intersectionsData.filter(intersection => 
    intersection.street1?.toLowerCase() === normalizedStreet ||
    intersection.street2?.toLowerCase() === normalizedStreet ||
    intersection.street3?.toLowerCase() === normalizedStreet ||
    intersection.street4?.toLowerCase() === normalizedStreet
  );
};

// Parse address and detect potential intersection
export const parseAddressAndDetectIntersection = async (address: string): Promise<{
  detectedStreets: string[];
  suggestedIntersections: IntersectionData[];
  crossStreet?: string;
}> => {
  await loadStreetData();
  
  if (!address || address.trim() === "") {
    return { detectedStreets: [], suggestedIntersections: [] };
  }

  const normalizedAddress = address.toLowerCase().trim();
  const detectedStreets: string[] = [];
  const suggestedIntersections: IntersectionData[] = [];

  // Look for street names in the address
  const uniqueStreets = new Set<string>();
  
  // Check against all known streets
  streetsData.forEach(street => {
    if (street.street && normalizedAddress.includes(street.street.toLowerCase())) {
      uniqueStreets.add(street.street);
    }
    if (street.streetBack && normalizedAddress.includes(street.streetBack.toLowerCase())) {
      uniqueStreets.add(street.streetBack);
    }
    if (street.streetAhead && normalizedAddress.includes(street.streetAhead.toLowerCase())) {
      uniqueStreets.add(street.streetAhead);
    }
  });

  // Also check intersection street names
  intersectionsData.forEach(intersection => {
    [intersection.street1, intersection.street2, intersection.street3, intersection.street4]
      .filter(street => street && street.trim() !== "")
      .forEach(street => {
        if (street && normalizedAddress.includes(street.toLowerCase())) {
          uniqueStreets.add(street);
        }
      });
  });

  const detectedStreetsArray = Array.from(uniqueStreets);

  // If we found streets, look for intersections
  if (detectedStreetsArray.length > 0) {
    // Get intersections for the first detected street
    const intersections = await findIntersectionsForStreet(detectedStreetsArray[0]);
    suggestedIntersections.push(...intersections);

    // If we found multiple streets in the address, try to find a specific intersection
    if (detectedStreetsArray.length > 1) {
      const intersection = intersectionsData.find(int => {
        const intStreets = [int.street1, int.street2, int.street3, int.street4]
          .filter(s => s && s.trim() !== "")
          .map(s => s.toLowerCase());
        
        return detectedStreetsArray.every(street => 
          intStreets.some(intStr => intStr.includes(street.toLowerCase()))
        );
      });

      if (intersection) {
        // Found a specific intersection, suggest the cross street
        const mainStreet = detectedStreetsArray[0];
        const crossStreetCandidate = [intersection.street1, intersection.street2, intersection.street3, intersection.street4]
          .find(street => street && street.toLowerCase() !== mainStreet.toLowerCase());
        
        return {
          detectedStreets: detectedStreetsArray,
          suggestedIntersections: [intersection],
          crossStreet: crossStreetCandidate
        };
      }
    }
  }

  return {
    detectedStreets: detectedStreetsArray,
    suggestedIntersections: suggestedIntersections.slice(0, 10), // Limit to 10 suggestions
  };
};

// Get the closest intersection to given coordinates
export const findClosestIntersection = async (lat: number, lng: number, maxDistance: number = 0.01): Promise<IntersectionData | null> => {
  await loadStreetData();
  
  let closestIntersection: IntersectionData | null = null;
  let minDistance = maxDistance;

  intersectionsData.forEach(intersection => {
    if (intersection.coordinates && intersection.coordinates.length === 2) {
      const [intLng, intLat] = intersection.coordinates;
      const distance = Math.sqrt(
        Math.pow(lat - intLat, 2) + Math.pow(lng - intLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIntersection = intersection;
      }
    }
  });

  return closestIntersection;
};