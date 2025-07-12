import { useState, useEffect, useRef } from "react";
import { Shield, Users, AlertTriangle, Activity, Plus, Filter, Search, Phone, Clock, MapPin, Car, Truck, Ambulance, Zap, BarChart3, Map, Radio, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { IncidentForm } from "@/components/incident-form";
import { DispatchMap } from "@/components/dispatch-map";
import { EnhancedHeader } from "@/components/enhanced-header";
import type { Incident, Unit } from "@shared/schema";

export default function BeaverPatch() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("call-entry");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const assignUnitMutation = useMutation({
    mutationFn: async ({ incidentId, unitId }: { incidentId: number; unitId: number }) => {
      return await apiRequest("POST", `/api/incidents/${incidentId}/assign`, { unitId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: t('beaverpatch.unitAssigned'),
        description: t('beaverpatch.unitAssignedDescription'),
      });
    },
  });

  // Unit status update mutation
  const updateUnitStatusMutation = useMutation({
    mutationFn: async ({ unitId, status }: { unitId: number; status: string }) => {
      return await apiRequest(`/api/units/${unitId}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: t('beaverpatch.unitStatusUpdated'),
        description: t('beaverpatch.unitStatusUpdatedDescription'),
      });
    },
    onError: () => {
      toast({
        title: t('beaverpatch.statusUpdateFailed'),
        description: t('beaverpatch.statusUpdateFailedDescription'),
        variant: "destructive",
      });
    },
  });

  // Incident status update mutation
  const updateIncidentStatusMutation = useMutation({
    mutationFn: async ({ incidentId, status }: { incidentId: number; status: string }) => {
      return await apiRequest(`/api/incidents/${incidentId}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: t('beaverpatch.incidentStatusUpdated'),
        description: t('beaverpatch.incidentStatusUpdatedDescription'),
      });
    },
    onError: () => {
      toast({
        title: t('beaverpatch.statusUpdateFailed'),
        description: t('beaverpatch.failedToUpdateIncidentStatus'),
        variant: "destructive",
      });
    },
  });



  const filteredIncidents = incidents.filter(incident => {
    const matchesType = filterType === "all" || incident.type === filterType;
    const matchesStatus = filterStatus === "all" || incident.status === filterStatus;
    const matchesSearch = !searchQuery || 
      incident.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getIncidentPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 border-red-500 text-white";
      case "medium": return "bg-yellow-500 border-yellow-500 text-black";
      case "low": return "bg-green-500 border-green-500 text-white";
      default: return "bg-gray-500 border-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "text-blue-400";
      case "dispatched": return "text-yellow-400";
      case "active": return "text-red-400";
      case "resolved": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getUnitTypeIcon = (type: string) => {
    switch (type) {
      case "police": return <Shield className="w-4 h-4" />;
      case "fire": return <Truck className="w-4 h-4" />;
      case "ambulance": return <Ambulance className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case "available": return "text-green-400";
      case "dispatched": return "text-yellow-400";
      case "responding": return "text-blue-400";
      case "busy": return "text-red-400";
      case "enroute": return "text-orange-400";
      case "off_duty": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  const availableUnits = units.filter(unit => unit.status === "available");
  const activeIncidents = incidents.filter(incident => incident.status !== "resolved");
  const highPriorityIncidents = incidents.filter(incident => incident.priority === "high");

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader 
        serviceName="BeaverPatch CAD" 
        serviceIcon={Shield} 
        showBackButton={true}
        backButtonText="Back to Dashboard"
      />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* System Status Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Radio className="w-3 h-3 mr-1" />
              {t('beaverpatch.cadOnline')}
            </Badge>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1 text-red-400" />
                {activeIncidents.length} {t('common.active')}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-green-400" />
                {availableUnits.length} {t('beaverpatch.available')}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-yellow-400" />
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* CAD Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="call-entry" className="flex items-center space-x-2">
              <Headphones className="w-4 h-4" />
              <span>{t('beaverpatch.callEntry')}</span>
            </TabsTrigger>
            <TabsTrigger value="dispatch" className="flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>{t('beaverpatch.dispatch')}</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="w-4 h-4" />
              <span>{t('beaverpatch.map')}</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>{t('beaverpatch.reports')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Call Entry Tab - Primary Interface */}
          <TabsContent value="call-entry" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Call Entry Form - Takes 2/3 width */}
              <div className="lg:col-span-2">
                <Card className="bg-beaver-surface border-beaver-surface-light">
                  <CardHeader>
                    <CardTitle className="text-xl text-beaver-orange flex items-center">
                      <Phone className="w-6 h-6 mr-3" />
                      {t('beaverpatch.callEntry911')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IncidentForm onClose={() => {}} />
                  </CardContent>
                </Card>
              </div>

              {/* Active Incidents Quick View */}
              <div className="lg:col-span-1">
                <Card className="bg-beaver-surface border-beaver-surface-light h-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-beaver-orange">{t('beaverpatch.activeIncidents')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activeIncidents.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">{t('beaverpatch.noActiveIncidents')}</div>
                      ) : (
                        activeIncidents.slice(0, 5).map((incident) => (
                          <div
                            key={incident.id}
                            className="p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-700"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={getIncidentPriorityColor(incident.priority)}>
                                {incident.priority.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {incident.incidentNumber}
                              </span>
                            </div>
                            <div className="text-sm text-white font-medium mb-1">
                              {incident.type}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {incident.address}
                            </div>
                            <div className={`text-xs ${getStatusColor(incident.status)} mt-1`}>
                              {incident.status.toUpperCase()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dispatch Tab - Unit Assignment and Management */}
          <TabsContent value="dispatch" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incident Management */}
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-beaver-orange">{t('beaverpatch.incidentManagement')}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40 bg-beaver-surface-light border-gray-600 text-white">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('beaverpatch.allStatus')}</SelectItem>
                          <SelectItem value="new">{t('beaverpatch.new')}</SelectItem>
                          <SelectItem value="dispatched">{t('beaverpatch.dispatched')}</SelectItem>
                          <SelectItem value="active">{t('common.active')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder={t('common.search') + "..."}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-beaver-surface-light border-gray-600 text-white w-48"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loadingIncidents ? (
                      <div className="text-center text-gray-400 py-8">{t('beaverpatch.loadingIncidents')}</div>
                    ) : filteredIncidents.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">{t('beaverpatch.noIncidentsFound')}</div>
                    ) : (
                      filteredIncidents.map((incident) => (
                        <div
                          key={incident.id}
                          className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                            selectedIncident?.id === incident.id
                              ? "bg-beaver-surface-light border-beaver-orange"
                              : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                          }`}
                          onClick={() => setSelectedIncident(incident)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getIncidentPriorityColor(incident.priority)}>
                                  {incident.priority.toUpperCase()}
                                </Badge>
                                <span className="text-white font-medium">{incident.incidentNumber}</span>
                                <span className={`text-sm ${getStatusColor(incident.status)}`}>
                                  {incident.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300 mb-2">
                                <div className="flex items-center space-x-2">
                                  <Zap className="w-4 h-4 text-yellow-400" />
                                  <span>{incident.type}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{incident.address}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="text-xs text-gray-500">
                                {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString() : ""}
                              </div>
                              {incident.status !== "resolved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateIncidentStatusMutation.mutate({ incidentId: incident.id, status: "resolved" });
                                  }}
                                  disabled={updateIncidentStatusMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700 text-white border-red-600 text-xs"
                                >
                                  {t('beaverpatch.close')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Unit Assignment for Selected Incident */}
              {selectedIncident ? (
                <Card className="bg-beaver-surface border-beaver-surface-light">
                  <CardHeader>
                    <CardTitle className="text-lg text-beaver-orange">{t('beaverpatch.assignUnits')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-beaver-surface-light rounded-lg border border-beaver-orange/30">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getIncidentPriorityColor(selectedIncident.priority)}>
                            {selectedIncident.priority.toUpperCase()}
                          </Badge>
                          <span className="text-white font-medium">{selectedIncident.incidentNumber}</span>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div className="flex items-center space-x-2 mb-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>{selectedIncident.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{selectedIncident.address}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-300 font-medium">{t('beaverpatch.availableUnits')}:</div>
                        {availableUnits.length === 0 ? (
                          <div className="text-sm text-gray-400 p-4 bg-gray-800 rounded-lg text-center">
                            {t('beaverpatch.noUnitsAvailable')}
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableUnits.map((unit) => (
                              <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    {getUnitTypeIcon(unit.type)}
                                  </div>
                                  <div>
                                    <div className="text-sm text-white font-medium">{unit.unitNumber}</div>
                                    <div className="text-xs text-gray-400">{unit.type}</div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => assignUnitMutation.mutate({ 
                                    incidentId: selectedIncident.id, 
                                    unitId: unit.id 
                                  })}
                                  disabled={assignUnitMutation.isPending}
                                  className="bg-beaver-orange hover:bg-orange-600 text-black font-medium text-xs"
                                >
                                  {assignUnitMutation.isPending ? t('beaverpatch.assigning') : t('beaverpatch.assign')}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-beaver-surface border-beaver-surface-light">
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-lg font-medium">{t('beaverpatch.selectIncident')}</p>
                      <p className="text-sm">{t('beaverpatch.clickToAssignUnits')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <DispatchMap
                  incidents={incidents}
                  units={units}
                  onIncidentSelect={setSelectedIncident}
                  className="h-[600px] w-full"
                />
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-beaver-surface border-beaver-surface-light h-full">
                  <CardHeader>
                    <CardTitle className="text-lg text-beaver-orange">{t('beaverpatch.unitStatus')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {loadingUnits ? (
                        <div className="text-center text-gray-400 py-8">{t('beaverpatch.loadingUnits')}</div>
                      ) : (
                        units.map((unit) => (
                          <div key={unit.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                                unit.status === "available" ? "bg-green-500" :
                                unit.status === "dispatched" ? "bg-yellow-500" :
                                unit.status === "responding" ? "bg-blue-500" :
                                unit.status === "busy" ? "bg-red-500" :
                                unit.status === "enroute" ? "bg-orange-500" :
                                "bg-gray-500"
                              }`}>
                                {getUnitTypeIcon(unit.type)}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm text-white font-medium">{unit.unitNumber}</div>
                                <div className="text-xs text-gray-400">{unit.type}</div>
                              </div>
                            </div>
                            <div className={`text-xs font-medium ${getUnitStatusColor(unit.status)}`}>
                              {unit.status.replace("_", " ").toUpperCase()}
                            </div>
                            {unit.status !== "available" && unit.status !== "off_duty" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUnitStatusMutation.mutate({ unitId: unit.id, status: "available" })}
                                disabled={updateUnitStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-xs mt-2 w-full"
                              >
                                {t('beaverpatch.returnToService')}
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-beaver-orange flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {t('beaverpatch.activeIncidents')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{activeIncidents.length}</div>
                  <div className="text-sm text-red-400">{highPriorityIncidents.length} {t('beaverpatch.highPriority')}</div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-beaver-orange flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    {t('beaverpatch.availableUnits')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{availableUnits.length}</div>
                  <div className="text-sm text-green-400">{t('beaverpatch.outOfTotal')} {units.length} {t('beaverpatch.total')}</div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-beaver-orange flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    {t('beaverpatch.responseTime')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">4.2</div>
                  <div className="text-sm text-gray-400">{t('beaverpatch.minutesAvg')}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-lg text-beaver-orange">{t('beaverpatch.recentActivity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incidents.slice(0, 10).map((incident) => (
                      <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={getIncidentPriorityColor(incident.priority)}>
                            {incident.priority.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="text-sm text-white font-medium">{incident.incidentNumber}</div>
                            <div className="text-xs text-gray-400">{incident.type} • {incident.address}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm ${getStatusColor(incident.status)}`}>
                            {incident.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}