import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Phone, Clock, AlertTriangle, Heart, User, Baby, Search, Car, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertIncidentSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const incidentFormSchema = insertIncidentSchema.extend({
  incidentNumber: z.string().min(1, "Incident number is required"),
});

type IncidentFormData = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  onClose: () => void;
}

export function IncidentForm({ onClose }: IncidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("call-info");
  const [isMedicalEmergency, setIsMedicalEmergency] = useState(false);
  const [licenseQuery, setLicenseQuery] = useState("");
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [licenseResult, setLicenseResult] = useState<any>(null);
  const [vehicleResult, setVehicleResult] = useState<any>(null);
  const [isSearchingLicense, setIsSearchingLicense] = useState(false);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      incidentNumber: `2025-${String(Date.now()).slice(-4)}`,
      type: "",
      priority: "",
      status: "new",
      address: "",
      latitude: null,
      longitude: null,
      complainant: "",
      description: "",
      peopleInvolved: 0,
      callBackPhone: "",
      landlineDetection: false,
      locationPhone: "",
      callerName: "",
      calledFrom: "",
      natureOfProblem: "",
      problemCode: "",
      mapPage: "",
      city: "",
      crossStreet: "",
      comments: "",
      withPatientNow: undefined,
      numberHurtSick: undefined,
      patientAge: "",
      patientGender: "",
      breathingStatus: "",
      chiefComplaintCode: "",
      pregnancyComplications: "",
      pregnancyWeeks: "",
      babyVisible: "",
    },
  });

  const createIncidentMutation = useMutation({
    mutationFn: async (data: IncidentFormData) => {
      return await apiRequest("POST", "/api/incidents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Incident Created",
        description: "New incident has been successfully created and is ready for dispatch.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    await createIncidentMutation.mutateAsync(data);
    setIsSubmitting(false);
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude);
          form.setValue("longitude", position.coords.longitude);
          toast({
            title: "Location Set",
            description: "GPS coordinates have been captured.",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please enter address manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  // DMV Search Functions
  const searchLicense = async (licenseNumber: string) => {
    if (!licenseNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license number",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingLicense(true);
    try {
      const response = await fetch(`/api/licenses/search?licenseNumber=${encodeURIComponent(licenseNumber)}`);
      if (response.ok) {
        const result = await response.json();
        setLicenseResult(result);
        toast({
          title: "License Found",
          description: `License ${licenseNumber} found in database`,
        });
      } else {
        const error = await response.json();
        setLicenseResult(null);
        toast({
          title: "License Not Found",
          description: error.error || "No license found with that number",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLicenseResult(null);
      toast({
        title: "Search Error",
        description: "Failed to search license database",
        variant: "destructive",
      });
    } finally {
      setIsSearchingLicense(false);
    }
  };

  const searchVehicle = async (plateNumber: string) => {
    if (!plateNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plate number",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingVehicle(true);
    try {
      const response = await fetch(`/api/vehicles/search?plate=${encodeURIComponent(plateNumber)}`);
      if (response.ok) {
        const result = await response.json();
        setVehicleResult(result);
        toast({
          title: "Vehicle Found",
          description: `Vehicle ${plateNumber} found in database`,
        });
      } else {
        const error = await response.json();
        setVehicleResult(null);
        toast({
          title: "Vehicle Not Found",
          description: error.error || "No vehicle found with that plate number",
          variant: "destructive",
        });
      }
    } catch (error) {
      setVehicleResult(null);
      toast({
        title: "Search Error",
        description: "Failed to search vehicle database",
        variant: "destructive",
      });
    } finally {
      setIsSearchingVehicle(false);
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

  // Watch type changes to trigger medical emergency UI
  const watchedType = form.watch("type");
  if (watchedType === "medical" && !isMedicalEmergency) {
    setIsMedicalEmergency(true);
  } else if (watchedType !== "medical" && isMedicalEmergency) {
    setIsMedicalEmergency(false);
  }

  return (
    <div className="w-full">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="call-info" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Phone className="w-4 h-4 mr-2" />
              Call Info
            </TabsTrigger>
            <TabsTrigger value="location" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="dmv" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Search className="w-4 h-4 mr-2" />
              DMV
            </TabsTrigger>
            <TabsTrigger value="triage" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black" disabled={!isMedicalEmergency}>
              <Heart className="w-4 h-4 mr-2" />
              Triage
            </TabsTrigger>
            <TabsTrigger value="details" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          {/* Call Information Tab */}
          <TabsContent value="call-info" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Initial Call Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incidentNumber" className="text-white">Incident ID</Label>
                    <Input
                      id="incidentNumber"
                      {...form.register("incidentNumber")}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      readOnly
                    />
                    <span className="text-xs text-gray-400">(Pending)</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callBackPhone" className="text-white">Call Back Phone</Label>
                    <Input
                      id="callBackPhone"
                      {...form.register("callBackPhone")}
                      placeholder="(555) 123-4567"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="callerName" className="text-white">Caller Name</Label>
                    <Input
                      id="callerName"
                      {...form.register("callerName")}
                      placeholder="Enter caller's name"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationPhone" className="text-white">Location Phone</Label>
                    <Input
                      id="locationPhone"
                      {...form.register("locationPhone")}
                      placeholder="(555) 123-4567"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calledFrom" className="text-white">Called From</Label>
                    <Input
                      id="calledFrom"
                      {...form.register("calledFrom")}
                      placeholder="e.g., Cell phone, landline"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="landlineDetection"
                      checked={form.watch("landlineDetection")}
                      onCheckedChange={(checked) => form.setValue("landlineDetection", checked as boolean)}
                    />
                    <Label htmlFor="landlineDetection" className="text-white">Landline Detection</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">Nature/Problem</Label>
                    <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical Emergency</SelectItem>
                        <SelectItem value="fire">Fire</SelectItem>
                        <SelectItem value="accident">Traffic Accident</SelectItem>
                        <SelectItem value="assault">Assault</SelectItem>
                        <SelectItem value="burglary">Burglary</SelectItem>
                        <SelectItem value="domestic">Domestic Violence</SelectItem>
                        <SelectItem value="theft">Theft</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problemCode" className="text-white">Problem Code</Label>
                    <Select value={form.watch("problemCode")} onValueChange={(value) => form.setValue("problemCode", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select priority code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            Red (Critical)
                          </div>
                        </SelectItem>
                        <SelectItem value="yellow">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            Yellow (Urgent)
                          </div>
                        </SelectItem>
                        <SelectItem value="blue">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            Blue (Non-urgent)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="natureOfProblem" className="text-white">Nature/Problem Details</Label>
                  <Textarea
                    id="natureOfProblem"
                    {...form.register("natureOfProblem")}
                    placeholder="Describe the nature of the emergency..."
                    className="bg-beaver-surface-light border-gray-600 text-white min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">Address</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="Enter full address"
                      className="bg-beaver-surface-light border-gray-600 text-white flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleGeolocation}
                      variant="outline"
                      className="bg-beaver-surface-light border-gray-600 text-white hover:bg-gray-600"
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">City</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="Enter city"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crossStreet" className="text-white">Cross Street</Label>
                    <Input
                      id="crossStreet"
                      {...form.register("crossStreet")}
                      placeholder="Nearest cross street"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapPage" className="text-white">Map Page</Label>
                  <Input
                    id="mapPage"
                    {...form.register("mapPage")}
                    placeholder="Map grid reference"
                    className="bg-beaver-surface-light border-gray-600 text-white"
                  />
                </div>

                {form.watch("latitude") && form.watch("longitude") && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      GPS Coordinates: {form.watch("latitude")?.toFixed(6)}, {form.watch("longitude")?.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DMV Database Query Tab */}
          <TabsContent value="dmv" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* License Search */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Driver's License Search
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
                      type="button"
                      onClick={() => searchLicense(licenseQuery)}
                      disabled={isSearchingLicense}
                      className="bg-beaver-orange hover:bg-orange-600 text-black"
                    >
                      {isSearchingLicense ? <Clock className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>

                  {licenseResult && (
                    <div className="mt-4 p-4 bg-beaver-surface-light border border-gray-600 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold">
                            {licenseResult.character ? 
                              `${licenseResult.character.firstName} ${licenseResult.character.lastName}` : 
                              "Unknown Driver"
                            }
                          </h4>
                          <p className="text-gray-400 text-sm">{licenseResult.license.licenseNumber}</p>
                        </div>
                        {getStatusBadge(licenseResult.license.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white">{licenseResult.license.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Expires</p>
                          <p className="text-white">{new Date(licenseResult.license.expiration).toLocaleDateString()}</p>
                        </div>
                        {licenseResult.license.restrictions && (
                          <div className="col-span-2">
                            <p className="text-gray-400">Restrictions</p>
                            <p className="text-white">{licenseResult.license.restrictions}</p>
                          </div>
                        )}
                      </div>

                      {licenseResult.character && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">Address</p>
                          <p className="text-white text-sm">
                            {licenseResult.character.address}, {licenseResult.character.city}, {licenseResult.character.province} {licenseResult.character.postalCode}
                          </p>
                          {licenseResult.character.phone && (
                            <p className="text-white text-sm">Phone: {licenseResult.character.phone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Search */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Vehicle Registration Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter plate number (e.g., ABC123)"
                      value={vehicleQuery}
                      onChange={(e) => setVehicleQuery(e.target.value)}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          searchVehicle(vehicleQuery);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => searchVehicle(vehicleQuery)}
                      disabled={isSearchingVehicle}
                      className="bg-beaver-orange hover:bg-orange-600 text-black"
                    >
                      {isSearchingVehicle ? <Clock className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>

                  {vehicleResult && (
                    <div className="mt-4 p-4 bg-beaver-surface-light border border-gray-600 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold">
                            {vehicleResult.vehicle.year} {vehicleResult.vehicle.make} {vehicleResult.vehicle.model}
                          </h4>
                          <p className="text-gray-400 text-sm">Plate: {vehicleResult.vehicle.plate}</p>
                          <p className="text-gray-400 text-sm">
                            Owner: {vehicleResult.character ? 
                              `${vehicleResult.character.firstName} ${vehicleResult.character.lastName}` : 
                              "Unknown"
                            }
                          </p>
                        </div>
                        {getStatusBadge(vehicleResult.vehicle.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">Type</p>
                          <p className="text-white">{vehicleResult.vehicle.vehicleType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Color</p>
                          <p className="text-white">{vehicleResult.vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Registration Exp.</p>
                          <p className="text-white">{new Date(vehicleResult.vehicle.expiration).toLocaleDateString()}</p>
                        </div>
                        {vehicleResult.vehicle.insuranceExpiration && (
                          <div>
                            <p className="text-gray-400">Insurance Exp.</p>
                            <p className="text-white">{new Date(vehicleResult.vehicle.insuranceExpiration).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {vehicleResult.vehicle.vin && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">VIN</p>
                          <p className="text-white text-sm font-mono">{vehicleResult.vehicle.vin}</p>
                        </div>
                      )}

                      {vehicleResult.character && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">Owner Address</p>
                          <p className="text-white text-sm">
                            {vehicleResult.character.address}, {vehicleResult.character.city}, {vehicleResult.character.province} {vehicleResult.character.postalCode}
                          </p>
                          {vehicleResult.character.phone && (
                            <p className="text-white text-sm">Phone: {vehicleResult.character.phone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Medical Triage Tab */}
          <TabsContent value="triage" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Patient Triage Questions
                </CardTitle>
                <Badge className="bg-red-600 text-white">Medical Emergency Only</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">With patient now?</Label>
                    <Select value={form.watch("withPatientNow")?.toString()} onValueChange={(value) => form.setValue("withPatientNow", value === "true")}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberHurtSick" className="text-white">Number of hurt/sick</Label>
                    <Input
                      id="numberHurtSick"
                      type="number"
                      {...form.register("numberHurtSick", { valueAsNumber: true })}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge" className="text-white">Patient's age</Label>
                    <Input
                      id="patientAge"
                      {...form.register("patientAge")}
                      placeholder="e.g., 25, infant, elderly"
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientGender" className="text-white">Patient's gender</Label>
                    <Select value={form.watch("patientGender")} onValueChange={(value) => form.setValue("patientGender", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breathingStatus" className="text-white">Breathing Status</Label>
                  <Select value={form.watch("breathingStatus")} onValueChange={(value) => form.setValue("breathingStatus", value)}>
                    <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                      <SelectValue placeholder="Select breathing status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="unknown">Unknown (3rd/4th party)</SelectItem>
                      <SelectItem value="uncertain">UNCERTAIN (2nd party)</SelectItem>
                      <SelectItem value="ineffective_agonal">INEFFECTIVE/AGONAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chiefComplaintCode" className="text-white">Chief Complaint Code</Label>
                  <Select value={form.watch("chiefComplaintCode")} onValueChange={(value) => form.setValue("chiefComplaintCode", value)}>
                    <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                      <SelectValue placeholder="Select primary complaint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_breathing">Obviously NOT BREATHING & Unconscious (non-trauma)</SelectItem>
                      <SelectItem value="choking">Verified Choking - COMPLETE obstruction</SelectItem>
                      <SelectItem value="hanging">Hanging</SelectItem>
                      <SelectItem value="strangulation">Strangulation (no assailant involved)</SelectItem>
                      <SelectItem value="suffocation">Suffocation</SelectItem>
                      <SelectItem value="underwater_domestic">Underwater (DOMESTIC rescue)</SelectItem>
                      <SelectItem value="underwater_specialized">Underwater (SPECIALIZED rescue)</SelectItem>
                      <SelectItem value="sinking_vehicle">Sinking vehicle - Caller inside</SelectItem>
                      <SelectItem value="flood_vehicle">Vehicle in floodwater - Caller inside</SelectItem>
                      <SelectItem value="pregnancy">Pregnancy / Childbirth / Miscarriage</SelectItem>
                      <SelectItem value="pregnancy_problem">Pregnancy problem (no contractions or birth)</SelectItem>
                      <SelectItem value="other">Others (specify in comments)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pregnancy-specific section */}
                {(form.watch("chiefComplaintCode") === "pregnancy" || form.watch("chiefComplaintCode") === "pregnancy_problem") && (
                  <Card className="bg-pink-900/10 border-pink-500/30">
                    <CardHeader>
                      <CardTitle className="text-pink-400 flex items-center text-sm">
                        <Baby className="w-4 h-4 mr-2" />
                        Pregnancy-Specific Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pregnancyComplications" className="text-white">Complications</Label>
                        <Select value={form.watch("pregnancyComplications")} onValueChange={(value) => form.setValue("pregnancyComplications", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="miscarriage">MISCARRIAGE (fetus or tissue)</SelectItem>
                            <SelectItem value="threatened_miscarriage">Threatened MISCARRIAGE (contractions)</SelectItem>
                            <SelectItem value="stillbirth">STILLBIRTH (non-viable baby born)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pregnancyWeeks" className="text-white">How many weeks (or months) pregnant?</Label>
                        <Select value={form.watch("pregnancyWeeks")} onValueChange={(value) => form.setValue("pregnancyWeeks", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="third_trimester">24+ wks (6-9 mos) 3rd TRIMESTER</SelectItem>
                            <SelectItem value="second_trimester">13-23 wks (4-5 mos) 2nd TRIMESTER</SelectItem>
                            <SelectItem value="first_trimester">0-12 wks (0-3 mos) 1st TRIMESTER</SelectItem>
                            <SelectItem value="due_date">Knows due date</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="babyVisible" className="text-white">Can you see any part of the baby now?</Label>
                        <Select value={form.watch("babyVisible")} onValueChange={(value) => form.setValue("babyVisible", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="completely_out">Baby completely out</SelectItem>
                            <SelectItem value="head_visible">Head visible (crowning)</SelectItem>
                            <SelectItem value="head_out">Head out</SelectItem>
                            <SelectItem value="umbilical_cord">Umbilical cord</SelectItem>
                            <SelectItem value="hands_feet_buttocks">Hands / Feet / Buttocks</SelectItem>
                            <SelectItem value="something_out">Something out (not sure what)</SelectItem>
                            <SelectItem value="cant_check">Can't check</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-white">Priority Level</Label>
                    <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority (Emergency)</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peopleInvolved" className="text-white">People Involved</Label>
                    <Input
                      id="peopleInvolved"
                      type="number"
                      {...form.register("peopleInvolved", { valueAsNumber: true })}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complainant" className="text-white">Complainant/Caller</Label>
                  <Input
                    id="complainant"
                    {...form.register("complainant")}
                    placeholder="Name of caller (optional)"
                    className="bg-beaver-surface-light border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Detailed Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Detailed description of the incident..."
                    className="bg-beaver-surface-light border-gray-600 text-white min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-white">Additional Comments</Label>
                  <Textarea
                    id="comments"
                    {...form.register("comments")}
                    placeholder="Any additional comments or notes..."
                    className="bg-beaver-surface-light border-gray-600 text-white min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 border-t border-gray-700">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-beaver-orange hover:bg-orange-600 text-black flex-1"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Creating Incident...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create 911 Incident
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
}