import { useState } from "react";
import { ArrowLeft, Shield, Users, AlertTriangle, Activity, Plus, Filter, Search, Phone, Clock, MapPin, Car, Truck, Ambulance, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { IncidentForm } from "@/components/incident-form";
import { DispatchMap } from "@/components/dispatch-map";
import type { Incident, Unit } from "@shared/schema";
import beaverImage from "@assets/beaver_1751858605395.png";

export default function BeaverPatch() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
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
        title: "Unit Assigned",
        description: "Unit has been successfully assigned to the incident.",
      });
    },
  });

  // Unit status update mutation
  const updateUnitStatusMutation = useMutation({
    mutationFn: async ({ unitId, status }: { unitId: number; status: string }) => {
      return await apiRequest("POST", `/api/units/${unitId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      toast({
        title: "Unit Status Updated",
        description: "Unit status has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Status Update Failed",
        description: "Failed to update unit status",
        variant: "destructive",
      });
    },
  });

  // Incident status update mutation
  const updateIncidentStatusMutation = useMutation({
    mutationFn: async ({ incidentId, status }: { incidentId: number; status: string }) => {
      return await apiRequest("POST", `/api/incidents/${incidentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Incident Status Updated",
        description: "Incident status has been successfully updated",
      });
    },
    onError: () => {
      toast({
        title: "Status Update Failed",
        description: "Failed to update incident status",
        variant: "destructive",
      });
    },
  });

  const handleBackToServices = () => {
    setLocation("/dashboard");
  };

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
      {/* Header Navigation */}
      <header className="bg-beaver-surface border-b border-beaver-surface-light">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-beaver-orange">
                <img src={beaverImage} alt="Beaver" className="w-6 h-6 object-contain" />
              </div>
              <h1 className="text-xl font-bold text-beaver-orange">BEAVERNET</h1>
              <div className="hidden sm:block text-gray-400">|</div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-beaver-orange" />
                <span className="text-lg font-semibold text-white">BeaverPatch</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:inline">{user?.name}</span>
              <Dialog open={showIncidentForm} onOpenChange={setShowIncidentForm}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-orange-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-beaver-surface border-beaver-surface-light">
                  <IncidentForm onClose={() => setShowIncidentForm(false)} />
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleBackToServices}
                variant="ghost"
                className="bg-beaver-surface-light hover:bg-gray-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Services</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-beaver-orange/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-beaver-orange" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-beaver-orange">Frontline Dispatch</h1>
                <p className="text-gray-400">Computer-Aided Dispatch System</p>
              </div>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{activeIncidents.length}</div>
              <div className="text-sm text-red-400">{highPriorityIncidents.length} high priority</div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Available Units
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">{availableUnits.length}</div>
              <div className="text-sm text-green-400">out of {units.length} total</div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">4.2</div>
              <div className="text-sm text-gray-400">minutes avg</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="space-y-6">
          {/* Top Row: Incident Dashboard and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Incidents Panel - Takes 2/3 width */}
            <div className="lg:col-span-2">
              <Card className="bg-beaver-surface border-beaver-surface-light h-full">
                <CardHeader className="pb-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-beaver-orange">Incident Dashboard</CardTitle>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="Search incidents..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-beaver-surface-light border-gray-600 text-white w-64"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-48 bg-beaver-surface-light border-gray-600 text-white">
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="fire">Fire</SelectItem>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="assault">Assault</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48 bg-beaver-surface-light border-gray-600 text-white">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {loadingIncidents ? (
                      <div className="text-center text-gray-400 py-8">Loading incidents...</div>
                    ) : filteredIncidents.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">No incidents found</div>
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
                              <div className="text-sm text-gray-400 truncate">
                                {incident.description}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2 ml-4">
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
                                  Close Incident
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
            </div>

            {/* Map Panel - Takes 1/3 width */}
            <div className="lg:col-span-1">
              <DispatchMap
                incidents={incidents}
                units={units}
                onIncidentSelect={setSelectedIncident}
                className="h-full min-h-[500px]"
              />
            </div>
          </div>

          {/* Bottom Row: Unit Assignment and Unit Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unit Assignment Panel */}
            {selectedIncident ? (
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-lg text-beaver-orange">Assign Units to Incident</CardTitle>
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
                      <div className="text-sm text-gray-300 font-medium">Available Units:</div>
                      {availableUnits.length === 0 ? (
                        <div className="text-sm text-gray-400 p-4 bg-gray-800 rounded-lg text-center">
                          No units currently available
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {availableUnits.map((unit) => (
                            <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                  {getUnitTypeIcon(unit.type)}
                                </div>
                                <div>
                                  <div className="text-sm text-white font-medium">{unit.unitNumber}</div>
                                  <div className="text-xs text-gray-400">{unit.type} • {unit.currentLocation}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => assignUnitMutation.mutate({ 
                                  incidentId: selectedIncident.id, 
                                  unitId: unit.id 
                                })}
                                disabled={assignUnitMutation.isPending}
                                className="bg-beaver-orange hover:bg-orange-600 text-black font-medium"
                              >
                                {assignUnitMutation.isPending ? "Assigning..." : "Assign"}
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
                    <p className="text-lg font-medium">Select an Incident</p>
                    <p className="text-sm">Click on an incident from the dashboard to assign units</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Units Status Panel */}
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-lg text-beaver-orange">Unit Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {loadingUnits ? (
                    <div className="text-center text-gray-400 py-8">Loading units...</div>
                  ) : (
                    units.map((unit) => (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                            unit.status === "available" ? "bg-green-500" :
                            unit.status === "dispatched" ? "bg-yellow-500" :
                            unit.status === "responding" ? "bg-blue-500" :
                            unit.status === "busy" ? "bg-red-500" :
                            unit.status === "enroute" ? "bg-orange-500" :
                            "bg-gray-500"
                          }`}>
                            {getUnitTypeIcon(unit.type)}
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{unit.unitNumber}</div>
                            <div className="text-xs text-gray-400">{unit.type} • {unit.currentLocation}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className={`text-sm font-medium ${getUnitStatusColor(unit.status)}`}>
                              {unit.status.replace("_", " ").toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {unit.updatedAt ? new Date(unit.updatedAt).toLocaleTimeString() : ""}
                            </div>
                          </div>
                          {unit.status !== "available" && unit.status !== "off_duty" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUnitStatusMutation.mutate({ unitId: unit.id, status: "available" })}
                              disabled={updateUnitStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-xs"
                            >
                              Return to Service
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}