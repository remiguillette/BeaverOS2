import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, User, Car, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Character, License, VehicleRegistration } from "@shared/schema";
import { EnhancedHeader } from "@/components/enhanced-header";

interface LicenseSearchResult {
  license: License;
  character: Character | null;
}

interface VehicleSearchResult {
  vehicle: VehicleRegistration;
  character: Character | null;
}

export default function BeaverDMV() {
  const [licenseQuery, setLicenseQuery] = useState("");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [searchType, setSearchType] = useState<"plate" | "vin">("plate");
  const { toast } = useToast();

  const { data: allCharacters = [], isLoading: loadingCharacters } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const { data: allLicenses = [], isLoading: loadingLicenses } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  const { data: allVehicles = [], isLoading: loadingVehicles } = useQuery<VehicleRegistration[]>({
    queryKey: ["/api/vehicles"],
  });

  const searchLicense = async (licenseNumber: string) => {
    if (!licenseNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license number",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/licenses/search?licenseNumber=${encodeURIComponent(licenseNumber)}`);
      if (response.ok) {
        const result: LicenseSearchResult = await response.json();
        return result;
      } else {
        const error = await response.json();
        toast({
          title: "License Not Found",
          description: error.error || "No license found with that number",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search license database",
        variant: "destructive",
      });
      return null;
    }
  };

  const searchVehicle = async (query: string, type: "plate" | "vin") => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: `Please enter a ${type === "plate" ? "plate number" : "VIN"}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const queryParam = type === "plate" ? `plate=${encodeURIComponent(query)}` : `vin=${encodeURIComponent(query)}`;
      const response = await fetch(`/api/vehicles/search?${queryParam}`);
      if (response.ok) {
        const result: VehicleSearchResult = await response.json();
        return result;
      } else {
        const error = await response.json();
        toast({
          title: "Vehicle Not Found", 
          description: error.error || "No vehicle found with that information",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search vehicle database",
        variant: "destructive",
      });
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      case "EXPIRED":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      case "REVOKED":
        return <Badge className="bg-red-600 hover:bg-red-700"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      case "STOLEN":
        return <Badge className="bg-red-700 hover:bg-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Stolen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-CA');
  };

  const isExpiringSoon = (expiration: Date | string) => {
    const expirationDate = new Date(expiration);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expirationDate <= thirtyDaysFromNow;
  };

  return (
    <div className="min-h-screen bg-beaver-dark text-white">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="search" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="licenses" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <CreditCard className="w-4 h-4 mr-2" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Car className="w-4 h-4 mr-2" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="characters" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <User className="w-4 h-4 mr-2" />
              Characters
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* License Search */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    License Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter license number (e.g., D12345678)"
                      value={licenseQuery}
                      onChange={(e) => setLicenseQuery(e.target.value)}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          searchLicense(licenseQuery);
                        }
                      }}
                    />
                    <Button
                      onClick={() => searchLicense(licenseQuery)}
                      className="bg-beaver-orange hover:bg-orange-600 text-black"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Search */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Vehicle Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2 mb-2">
                    <Button
                      variant={searchType === "plate" ? "default" : "outline"}
                      onClick={() => setSearchType("plate")}
                      className={searchType === "plate" ? "bg-beaver-orange text-black" : "border-gray-600 text-white"}
                    >
                      Plate
                    </Button>
                    <Button
                      variant={searchType === "vin" ? "default" : "outline"}
                      onClick={() => setSearchType("vin")}
                      className={searchType === "vin" ? "bg-beaver-orange text-black" : "border-gray-600 text-white"}
                    >
                      VIN
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={searchType === "plate" ? "Enter plate number (e.g., ABC123)" : "Enter VIN (e.g., 1HGCM82633A123456)"}
                      value={vehicleQuery}
                      onChange={(e) => setVehicleQuery(e.target.value)}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          searchVehicle(vehicleQuery, searchType);
                        }
                      }}
                    />
                    <Button
                      onClick={() => searchVehicle(vehicleQuery, searchType)}
                      className="bg-beaver-orange hover:bg-orange-600 text-black"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Licenses Tab */}
          <TabsContent value="licenses" className="mt-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Driver Licenses Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingLicenses ? (
                  <div className="text-center py-8">Loading licenses...</div>
                ) : (
                  <div className="space-y-4">
                    {allLicenses.map((license) => {
                      const character = allCharacters.find(c => c.id === license.characterId);
                      return (
                        <Card key={license.id} className="bg-beaver-surface-light border-gray-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {character ? `${character.firstName} ${character.lastName}` : "Unknown"}
                                </h3>
                                <p className="text-gray-400">{license.licenseNumber}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(license.status)}
                                {isExpiringSoon(license.expiration) && license.status === "ACTIVE" && (
                                  <Badge className="bg-orange-500 hover:bg-orange-600">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Type</p>
                                <p className="text-white">{license.type}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Expiration</p>
                                <p className="text-white">{formatDate(license.expiration)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Restrictions</p>
                                <p className="text-white">{license.restrictions || "None"}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Endorsements</p>
                                <p className="text-white">{license.endorsements || "None"}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="mt-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Vehicle Registration Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingVehicles ? (
                  <div className="text-center py-8">Loading vehicles...</div>
                ) : (
                  <div className="space-y-4">
                    {allVehicles.map((vehicle) => {
                      const character = allCharacters.find(c => c.id === vehicle.characterId);
                      return (
                        <Card key={vehicle.id} className="bg-beaver-surface-light border-gray-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                <p className="text-gray-400">Plate: {vehicle.plate}</p>
                                <p className="text-gray-400 text-sm">Owner: {character ? `${character.firstName} ${character.lastName}` : "Unknown"}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                {getStatusBadge(vehicle.status)}
                                {isExpiringSoon(vehicle.expiration) && vehicle.status === "ACTIVE" && (
                                  <Badge className="bg-orange-500 hover:bg-orange-600">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Type</p>
                                <p className="text-white">{vehicle.vehicleType}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Color</p>
                                <p className="text-white">{vehicle.color}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Registration Exp.</p>
                                <p className="text-white">{formatDate(vehicle.expiration)}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Insurance Exp.</p>
                                <p className="text-white">{vehicle.insuranceExpiration ? formatDate(vehicle.insuranceExpiration) : "N/A"}</p>
                              </div>
                            </div>
                            {vehicle.vin && (
                              <div className="mt-2 pt-2 border-t border-gray-600">
                                <p className="text-gray-400 text-sm">VIN: {vehicle.vin}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="mt-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Character Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCharacters ? (
                  <div className="text-center py-8">Loading characters...</div>
                ) : (
                  <div className="space-y-4">
                    {allCharacters.map((character) => {
                      const licenses = allLicenses.filter(l => l.characterId === character.id);
                      const vehicles = allVehicles.filter(v => v.characterId === character.id);
                      return (
                        <Card key={character.id} className="bg-beaver-surface-light border-gray-600">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {character.firstName} {character.lastName}
                                </h3>
                                <p className="text-gray-400">{character.address}</p>
                                <p className="text-gray-400">{character.city}, {character.province} {character.postalCode}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">Born: {character.dateOfBirth ? formatDate(character.dateOfBirth) : "N/A"}</p>
                                <p className="text-gray-400 text-sm">Phone: {character.phone || "N/A"}</p>
                              </div>
                            </div>
                            
                            <Separator className="my-4 bg-gray-600" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-white font-medium mb-2">Licenses ({licenses.length})</h4>
                                {licenses.length > 0 ? (
                                  <div className="space-y-1">
                                    {licenses.map((license) => (
                                      <div key={license.id} className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">{license.licenseNumber}</span>
                                        {getStatusBadge(license.status)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-sm">No licenses</p>
                                )}
                              </div>
                              
                              <div>
                                <h4 className="text-white font-medium mb-2">Vehicles ({vehicles.length})</h4>
                                {vehicles.length > 0 ? (
                                  <div className="space-y-1">
                                    {vehicles.map((vehicle) => (
                                      <div key={vehicle.id} className="flex justify-between items-center">
                                        <span className="text-gray-300 text-sm">{vehicle.plate} - {vehicle.make} {vehicle.model}</span>
                                        {getStatusBadge(vehicle.status)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-400 text-sm">No vehicles</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}