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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
        title: t('beaverpatch.incidentCreated'),
        description: t('beaverpatch.incidentCreatedDescription'),
      });
      onClose();
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('beaverpatch.failedToCreateIncident'),
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
            title: t('beaverpatch.locationSet'),
            description: t('beaverpatch.gpsCoordinatesCaptured'),
          });
        },
        (error) => {
          toast({
            title: t('beaverpatch.locationError'),
            description: t('beaverpatch.unableToGetLocation'),
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
        title: t('common.error'),
        description: t('beaverpatch.pleaseEnterLicenseNumber'),
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
          title: t('beaverpatch.licenseFound'),
          description: `${t('beaverpatch.licenseFoundInDatabase')} ${licenseNumber}`,
        });
      } else {
        const error = await response.json();
        setLicenseResult(null);
        toast({
          title: t('beaverpatch.licenseNotFound'),
          description: error.error || t('beaverpatch.noLicenseFound'),
          variant: "destructive",
        });
      }
    } catch (error) {
      setLicenseResult(null);
      toast({
        title: t('beaverpatch.searchError'),
        description: t('beaverpatch.failedToSearchLicense'),
        variant: "destructive",
      });
    } finally {
      setIsSearchingLicense(false);
    }
  };

  const searchVehicle = async (plateNumber: string) => {
    if (!plateNumber.trim()) {
      toast({
        title: t('common.error'),
        description: t('beaverpatch.pleaseEnterPlateNumber'),
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
          title: t('beaverpatch.vehicleFound'),
          description: `${t('beaverpatch.vehicleFoundInDatabase')} ${plateNumber}`,
        });
      } else {
        const error = await response.json();
        setVehicleResult(null);
        toast({
          title: t('beaverpatch.vehicleNotFound'),
          description: error.error || t('beaverpatch.noVehicleFound'),
          variant: "destructive",
        });
      }
    } catch (error) {
      setVehicleResult(null);
      toast({
        title: t('beaverpatch.searchError'),
        description: t('beaverpatch.failedToSearchVehicle'),
        variant: "destructive",
      });
    } finally {
      setIsSearchingVehicle(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />{t('beaverpatch.active')}</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />{t('beaverpatch.suspended')}</Badge>;
      case "EXPIRED":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />{t('beaverpatch.expired')}</Badge>;
      case "REVOKED":
        return <Badge className="bg-red-600 hover:bg-red-700"><XCircle className="w-3 h-3 mr-1" />{t('beaverpatch.revoked')}</Badge>;
      case "STOLEN":
        return <Badge className="bg-red-700 hover:bg-red-800"><AlertTriangle className="w-3 h-3 mr-1" />{t('beaverpatch.stolen')}</Badge>;
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
              {t('beaverpatch.callInfo')}
            </TabsTrigger>
            <TabsTrigger value="location" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <MapPin className="w-4 h-4 mr-2" />
              {t('beaverpatch.location')}
            </TabsTrigger>
            <TabsTrigger value="dmv" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Search className="w-4 h-4 mr-2" />
              {t('beaverpatch.dmv')}
            </TabsTrigger>
            <TabsTrigger value="triage" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black" disabled={!isMedicalEmergency}>
              <Heart className="w-4 h-4 mr-2" />
              {t('beaverpatch.triage')}
            </TabsTrigger>
            <TabsTrigger value="details" className="text-white data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t('beaverpatch.details')}
            </TabsTrigger>
          </TabsList>

          {/* Call Information Tab */}
          <TabsContent value="call-info" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  {t('beaverpatch.initialCallInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="incidentNumber" className="text-white">{t('beaverpatch.incidentId')}</Label>
                    <Input
                      id="incidentNumber"
                      {...form.register("incidentNumber")}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                      readOnly
                    />
                    <span className="text-xs text-gray-400">({t('beaverpatch.pending')})</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="callBackPhone" className="text-white">{t('beaverpatch.callBackPhone')}</Label>
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
                    <Label htmlFor="callerName" className="text-white">{t('beaverpatch.callerName')}</Label>
                    <Input
                      id="callerName"
                      {...form.register("callerName")}
                      placeholder={t('beaverpatch.enterCallerName')}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationPhone" className="text-white">{t('beaverpatch.locationPhone')}</Label>
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
                    <Label htmlFor="calledFrom" className="text-white">{t('beaverpatch.calledFrom')}</Label>
                    <Input
                      id="calledFrom"
                      {...form.register("calledFrom")}
                      placeholder={t('beaverpatch.cellPhoneLandline')}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="landlineDetection"
                      checked={form.watch("landlineDetection")}
                      onCheckedChange={(checked) => form.setValue("landlineDetection", checked as boolean)}
                    />
                    <Label htmlFor="landlineDetection" className="text-white">{t('beaverpatch.landlineDetection')}</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-white">{t('beaverpatch.natureProblem')}</Label>
                    <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder={t('beaverpatch.selectIncidentType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">{t('beaverpatch.medicalEmergency')}</SelectItem>
                        <SelectItem value="fire">{t('beaverpatch.fire')}</SelectItem>
                        <SelectItem value="accident">{t('beaverpatch.trafficAccident')}</SelectItem>
                        <SelectItem value="assault">{t('beaverpatch.assault')}</SelectItem>
                        <SelectItem value="burglary">{t('beaverpatch.burglary')}</SelectItem>
                        <SelectItem value="domestic">{t('beaverpatch.domesticViolence')}</SelectItem>
                        <SelectItem value="theft">{t('beaverpatch.theft')}</SelectItem>
                        <SelectItem value="other">{t('beaverpatch.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="problemCode" className="text-white">{t('beaverpatch.problemCode')}</Label>
                    <Select value={form.watch("problemCode")} onValueChange={(value) => form.setValue("problemCode", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder={t('beaverpatch.selectPriorityCode')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="red">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            {t('beaverpatch.redCritical')}
                          </div>
                        </SelectItem>
                        <SelectItem value="yellow">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            {t('beaverpatch.yellowUrgent')}
                          </div>
                        </SelectItem>
                        <SelectItem value="blue">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            {t('beaverpatch.blueNonUrgent')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="natureOfProblem" className="text-white">{t('beaverpatch.natureProblemDetails')}</Label>
                  <Textarea
                    id="natureOfProblem"
                    {...form.register("natureOfProblem")}
                    placeholder={t('beaverpatch.describeEmergency')}
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
                  {t('beaverpatch.locationInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">{t('beaverpatch.address')}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder={t('beaverpatch.enterFullAddress')}
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
                    <Label htmlFor="city" className="text-white">{t('beaverpatch.city')}</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder={t('beaverpatch.city')}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crossStreet" className="text-white">{t('beaverpatch.crossStreet')}</Label>
                    <Input
                      id="crossStreet"
                      {...form.register("crossStreet")}
                      placeholder={t('beaverpatch.crossStreet')}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mapPage" className="text-white">{t('beaverpatch.mapPage')}</Label>
                  <Input
                    id="mapPage"
                    {...form.register("mapPage")}
                    placeholder={t('beaverpatch.mapPage')}
                    className="bg-beaver-surface-light border-gray-600 text-white"
                  />
                </div>

                {form.watch("latitude") && form.watch("longitude") && (
                  <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">
                      {t('beaverpatch.gpsCoordinates')}: {form.watch("latitude")?.toFixed(6)}, {form.watch("longitude")?.toFixed(6)}
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
                    {t('beaverpatch.licenseInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('beaverpatch.enterLicenseNumber')}
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
                              t('beaverpatch.unknownDriver')
                            }
                          </h4>
                          <p className="text-gray-400 text-sm">{licenseResult.license.licenseNumber}</p>
                        </div>
                        {getStatusBadge(licenseResult.license.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">{t('beaverpatch.type')}</p>
                          <p className="text-white">{licenseResult.license.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('beaverpatch.expires')}</p>
                          <p className="text-white">{new Date(licenseResult.license.expiration).toLocaleDateString()}</p>
                        </div>
                        {licenseResult.license.restrictions && (
                          <div className="col-span-2">
                            <p className="text-gray-400">{t('beaverpatch.restrictions')}</p>
                            <p className="text-white">{licenseResult.license.restrictions}</p>
                          </div>
                        )}
                      </div>

                      {licenseResult.character && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">{t('beaverpatch.address')}</p>
                          <p className="text-white text-sm">
                            {licenseResult.character.address}, {licenseResult.character.city}, {licenseResult.character.province} {licenseResult.character.postalCode}
                          </p>
                          {licenseResult.character.phone && (
                            <p className="text-white text-sm">{t('beaverpatch.phone')}: {licenseResult.character.phone}</p>
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
                    {t('beaverpatch.vehicleInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t('beaverpatch.enterPlateNumber')}
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
                          <p className="text-gray-400 text-sm">{t('beaverpatch.plate')}: {vehicleResult.vehicle.plate}</p>
                          <p className="text-gray-400 text-sm">
                            {t('beaverpatch.owner')}: {vehicleResult.character ? 
                              `${vehicleResult.character.firstName} ${vehicleResult.character.lastName}` : 
                              t('beaverpatch.unknown')
                            }
                          </p>
                        </div>
                        {getStatusBadge(vehicleResult.vehicle.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-400">{t('beaverpatch.type')}</p>
                          <p className="text-white">{vehicleResult.vehicle.vehicleType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('beaverpatch.color')}</p>
                          <p className="text-white">{vehicleResult.vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">{t('beaverpatch.registrationExp')}</p>
                          <p className="text-white">{new Date(vehicleResult.vehicle.expiration).toLocaleDateString()}</p>
                        </div>
                        {vehicleResult.vehicle.insuranceExpiration && (
                          <div>
                            <p className="text-gray-400">{t('beaverpatch.insuranceExp')}</p>
                            <p className="text-white">{new Date(vehicleResult.vehicle.insuranceExpiration).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>

                      {vehicleResult.vehicle.vin && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">{t('beaverpatch.vin')}</p>
                          <p className="text-white text-sm font-mono">{vehicleResult.vehicle.vin}</p>
                        </div>
                      )}

                      {vehicleResult.character && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <p className="text-gray-400 text-sm">{t('beaverpatch.ownerAddress')}</p>
                          <p className="text-white text-sm">
                            {vehicleResult.character.address}, {vehicleResult.character.city}, {vehicleResult.character.province} {vehicleResult.character.postalCode}
                          </p>
                          {vehicleResult.character.phone && (
                            <p className="text-white text-sm">{t('beaverpatch.phone')}: {vehicleResult.character.phone}</p>
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
                  {t('beaverpatch.patientTriageQuestions')}
                </CardTitle>
                <Badge className="bg-red-600 text-white">{t('beaverpatch.medicalEmergencyOnly')}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">{t('beaverpatch.withPatientNow')}</Label>
                    <Select value={form.watch("withPatientNow")?.toString()} onValueChange={(value) => form.setValue("withPatientNow", value === "true")}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder={t('beaverpatch.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">{t('beaverpatch.yes')}</SelectItem>
                        <SelectItem value="false">{t('beaverpatch.no')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberHurtSick" className="text-white">{t('beaverpatch.numberHurtSick')}</Label>
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
                    <Label htmlFor="patientAge" className="text-white">{t('beaverpatch.patientAge')}</Label>
                    <Input
                      id="patientAge"
                      {...form.register("patientAge")}
                      placeholder={t('beaverpatch.ageExample')}
                      className="bg-beaver-surface-light border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientGender" className="text-white">{t('beaverpatch.patientGender')}</Label>
                    <Select value={form.watch("patientGender")} onValueChange={(value) => form.setValue("patientGender", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder={t('beaverpatch.selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('beaverpatch.male')}</SelectItem>
                        <SelectItem value="female">{t('beaverpatch.female')}</SelectItem>
                        <SelectItem value="unknown">{t('beaverpatch.unknown')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breathingStatus" className="text-white">{t('beaverpatch.breathingStatus')}</Label>
                  <Select value={form.watch("breathingStatus")} onValueChange={(value) => form.setValue("breathingStatus", value)}>
                    <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                      <SelectValue placeholder={t('beaverpatch.selectBreathingStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t('beaverpatch.yes')}</SelectItem>
                      <SelectItem value="no">{t('beaverpatch.no')}</SelectItem>
                      <SelectItem value="unknown">{t('beaverpatch.unknownThirdParty')}</SelectItem>
                      <SelectItem value="uncertain">{t('beaverpatch.uncertainSecondParty')}</SelectItem>
                      <SelectItem value="ineffective_agonal">{t('beaverpatch.ineffectiveAgonal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chiefComplaintCode" className="text-white">{t('beaverpatch.chiefComplaintCode')}</Label>
                  <Select value={form.watch("chiefComplaintCode")} onValueChange={(value) => form.setValue("chiefComplaintCode", value)}>
                    <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                      <SelectValue placeholder={t('beaverpatch.selectPrimaryComplaint')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_breathing">{t('beaverpatch.notBreathing')}</SelectItem>
                      <SelectItem value="choking">{t('beaverpatch.choking')}</SelectItem>
                      <SelectItem value="hanging">{t('beaverpatch.hanging')}</SelectItem>
                      <SelectItem value="strangulation">{t('beaverpatch.strangulation')}</SelectItem>
                      <SelectItem value="suffocation">{t('beaverpatch.suffocation')}</SelectItem>
                      <SelectItem value="underwater_domestic">{t('beaverpatch.underwaterDomestic')}</SelectItem>
                      <SelectItem value="underwater_specialized">{t('beaverpatch.underwaterSpecialized')}</SelectItem>
                      <SelectItem value="sinking_vehicle">{t('beaverpatch.sinkingVehicle')}</SelectItem>
                      <SelectItem value="flood_vehicle">{t('beaverpatch.floodVehicle')}</SelectItem>
                      <SelectItem value="pregnancy">{t('beaverpatch.pregnancy')}</SelectItem>
                      <SelectItem value="pregnancy_problem">{t('beaverpatch.pregnancyProblem')}</SelectItem>
                      <SelectItem value="other">{t('beaverpatch.others')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pregnancy-specific section */}
                {(form.watch("chiefComplaintCode") === "pregnancy" || form.watch("chiefComplaintCode") === "pregnancy_problem") && (
                  <Card className="bg-pink-900/10 border-pink-500/30">
                    <CardHeader>
                      <CardTitle className="text-pink-400 flex items-center text-sm">
                        <Baby className="w-4 h-4 mr-2" />
                        {t('beaverpatch.pregnancySpecificQuestions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pregnancyComplications" className="text-white">{t('beaverpatch.complications')}</Label>
                        <Select value={form.watch("pregnancyComplications")} onValueChange={(value) => form.setValue("pregnancyComplications", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder={t('beaverpatch.select')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">{t('beaverpatch.no')}</SelectItem>
                            <SelectItem value="miscarriage">{t('beaverpatch.miscarriage')}</SelectItem>
                            <SelectItem value="threatened_miscarriage">{t('beaverpatch.threatenedMiscarriage')}</SelectItem>
                            <SelectItem value="stillbirth">{t('beaverpatch.stillbirth')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pregnancyWeeks" className="text-white">{t('beaverpatch.howManyWeeksPregnant')}</Label>
                        <Select value={form.watch("pregnancyWeeks")} onValueChange={(value) => form.setValue("pregnancyWeeks", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder={t('beaverpatch.select')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="third_trimester">{t('beaverpatch.thirdTrimester')}</SelectItem>
                            <SelectItem value="second_trimester">{t('beaverpatch.secondTrimester')}</SelectItem>
                            <SelectItem value="first_trimester">{t('beaverpatch.firstTrimester')}</SelectItem>
                            <SelectItem value="due_date">{t('beaverpatch.knowsDueDate')}</SelectItem>
                            <SelectItem value="unknown">{t('beaverpatch.unknown')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="babyVisible" className="text-white">{t('beaverpatch.canYouSeeAnyPartOfBaby')}</Label>
                        <Select value={form.watch("babyVisible")} onValueChange={(value) => form.setValue("babyVisible", value)}>
                          <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                            <SelectValue placeholder={t('beaverpatch.select')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">{t('beaverpatch.no')}</SelectItem>
                            <SelectItem value="completely_out">{t('beaverpatch.babyCompletelyOut')}</SelectItem>
                            <SelectItem value="head_visible">{t('beaverpatch.headVisible')}</SelectItem>
                            <SelectItem value="head_out">{t('beaverpatch.headOut')}</SelectItem>
                            <SelectItem value="umbilical_cord">{t('beaverpatch.umbilicalCord')}</SelectItem>
                            <SelectItem value="hands_feet_buttocks">{t('beaverpatch.handsFeetsButt')}</SelectItem>
                            <SelectItem value="something_out">{t('beaverpatch.somethingOut')}</SelectItem>
                            <SelectItem value="cant_check">{t('beaverpatch.cantCheck')}</SelectItem>
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
                  {t('beaverpatch.additionalDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-white">{t('beaverpatch.priorityLevel')}</Label>
                    <Select value={form.watch("priority")} onValueChange={(value) => form.setValue("priority", value)}>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder={t('beaverpatch.selectPriority')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t('beaverpatch.highPriority')}</SelectItem>
                        <SelectItem value="medium">{t('beaverpatch.mediumPriority')}</SelectItem>
                        <SelectItem value="low">{t('beaverpatch.lowPriority')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peopleInvolved" className="text-white">{t('beaverpatch.peopleInvolved')}</Label>
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
                  <Label htmlFor="complainant" className="text-white">{t('beaverpatch.complainantCaller')}</Label>
                  <Input
                    id="complainant"
                    {...form.register("complainant")}
                    placeholder={t('beaverpatch.nameOfCaller')}
                    className="bg-beaver-surface-light border-gray-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">{t('beaverpatch.detailedDescription')}</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder={t('beaverpatch.detailedDescriptionPlaceholder')}
                    className="bg-beaver-surface-light border-gray-600 text-white min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-white">{t('beaverpatch.additionalComments')}</Label>
                  <Textarea
                    id="comments"
                    {...form.register("comments")}
                    placeholder={t('beaverpatch.additionalCommentsPlaceholder')}
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
                {t('beaverpatch.creatingIncident')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {t('beaverpatch.create911Incident')}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            {t('beaverpatch.clearForm')}
          </Button>
        </div>
      </form>
    </div>
  );
}