import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EnhancedHeader } from "@/components/enhanced-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Map, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Building,
  Flame,
  Droplets,
  Zap,
  AlertCircle,
  ChevronRight,
  Plus,
  Edit,
  Eye,
  Search,
  Filter
} from "lucide-react";
import { insertRiskLocationSchema, insertRiskAssessmentSchema, insertMitigationPlanSchema, insertRiskEventSchema } from "@shared/schema";
import type { RiskLocation, RiskAssessment, MitigationPlan, RiskEvent } from "@shared/schema";
import { format } from "date-fns";

// Form types
type RiskLocationFormData = {
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  capacity?: number;
  contactInfo?: string;
  operatingHours?: string;
};

type RiskAssessmentFormData = {
  title: string;
  riskType: string;
  locationId?: number;
  severityScore: number;
  probabilityScore: number;
  humanImpact: number;
  economicImpact: number;
  environmentalImpact: number;
  description: string;
  affectedPopulation?: number;
  estimatedDamages?: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
};

type MitigationPlanFormData = {
  riskAssessmentId: number;
  title: string;
  description: string;
  responsibleDepartment?: string;
  estimatedCost?: number;
  timeline?: string;
  priority: string;
  startDate?: string;
  targetCompletionDate?: string;
  resources?: string;
  successMetrics?: string;
  notes?: string;
};

type RiskEventFormData = {
  riskAssessmentId: number;
  eventDate: string;
  eventType: string;
  title: string;
  description: string;
  severity: string;
  actualImpact?: string;
  responseTime?: number;
  resourcesUsed?: string;
  lessonsLearned?: string;
  followUpActions?: string;
};

const riskTypes = [
  { value: "fire", label: "Fire/Wildfire", icon: Flame, color: "text-red-500" },
  { value: "flood", label: "Flood", icon: Droplets, color: "text-blue-500" },
  { value: "power_outage", label: "Power Outage", icon: Zap, color: "text-yellow-500" },
  { value: "hazmat", label: "Hazardous Materials", icon: AlertTriangle, color: "text-orange-500" },
  { value: "landslide", label: "Landslide", icon: AlertCircle, color: "text-amber-500" },
  { value: "pandemic", label: "Pandemic", icon: Users, color: "text-purple-500" },
];

const locationTypes = [
  { value: "hospital", label: "Hospital" },
  { value: "school", label: "School" },
  { value: "power_plant", label: "Power Plant" },
  { value: "industrial", label: "Industrial Facility" },
  { value: "flood_zone", label: "Flood Zone" },
  { value: "residential", label: "Residential Area" },
  { value: "commercial", label: "Commercial District" },
];

const riskLevels = {
  low: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", label: "Low" },
  medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", label: "Medium" },
  high: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", label: "High" },
  critical: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", label: "Critical" },
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  mitigated: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export default function BeaverRisk() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const newAssessmentButtonRef = useRef<HTMLButtonElement>(null);

  // Data fetching hooks
  const { data: riskLocations = [], isLoading: locationsLoading } = useQuery<RiskLocation[]>({
    queryKey: ["/api/risk-locations"],
  });

  const { data: riskAssessments = [], isLoading: assessmentsLoading } = useQuery<RiskAssessment[]>({
    queryKey: ["/api/risk-assessments"],
  });

  const { data: mitigationPlans = [], isLoading: plansLoading } = useQuery<MitigationPlan[]>({
    queryKey: ["/api/mitigation-plans"],
  });

  const { data: riskEvents = [], isLoading: eventsLoading } = useQuery<RiskEvent[]>({
    queryKey: ["/api/risk-events"],
  });

  // Calculate risk matrix
  const calculateRiskLevel = (assessment: RiskAssessment): string => {
    const total = assessment.severityScore * assessment.probabilityScore;
    if (total >= 20) return "critical";
    if (total >= 12) return "high";
    if (total >= 6) return "medium";
    return "low";
  };

  // Filter assessments
  const filteredAssessments = riskAssessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || assessment.riskType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    totalAssessments: riskAssessments.length,
    highRiskCount: riskAssessments.filter(a => calculateRiskLevel(a) === "high" || calculateRiskLevel(a) === "critical").length,
    activePlans: mitigationPlans.filter(p => p.status === "in_progress").length,
    recentEvents: riskEvents.filter(e => new Date(e.eventDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  };

  // Animated gradient effect for buttons
  useEffect(() => {
    let angle = 0;
    let animationFrameId: number;

    const rotateGradient = () => {
      angle = (angle + 1) % 360;
      
      // Apply to all buttons with gradient effect
      const buttons = [newAssessmentButtonRef.current];
      buttons.forEach(button => {
        if (button) {
          button.style.setProperty("--gradient-angle", `${angle}deg`);
        }
      });
      
      animationFrameId = requestAnimationFrame(rotateGradient);
    };

    rotateGradient();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Risk Assessment Dialog
  const RiskAssessmentDialog = ({ assessment, onClose }: { assessment?: RiskAssessment; onClose: () => void }) => {
    const form = useForm<RiskAssessmentFormData>({
      resolver: zodResolver(insertRiskAssessmentSchema),
      defaultValues: assessment ? {
        title: assessment.title,
        riskType: assessment.riskType,
        locationId: assessment.locationId || undefined,
        severityScore: assessment.severityScore,
        probabilityScore: assessment.probabilityScore,
        humanImpact: assessment.humanImpact,
        economicImpact: assessment.economicImpact,
        environmentalImpact: assessment.environmentalImpact,
        description: assessment.description,
        affectedPopulation: assessment.affectedPopulation || undefined,
        estimatedDamages: assessment.estimatedDamages || undefined,
        lastReviewDate: assessment.lastReviewDate ? format(new Date(assessment.lastReviewDate), "yyyy-MM-dd") : undefined,
        nextReviewDate: assessment.nextReviewDate ? format(new Date(assessment.nextReviewDate), "yyyy-MM-dd") : undefined,
      } : {
        title: "",
        riskType: "",
        severityScore: 1,
        probabilityScore: 1,
        humanImpact: 1,
        economicImpact: 1,
        environmentalImpact: 1,
        description: "",
        priority: "medium",
      },
    });

    const mutation = useMutation({
      mutationFn: async (data: RiskAssessmentFormData) => {
        const url = assessment ? `/api/risk-assessments/${assessment.id}` : "/api/risk-assessments";
        const method = assessment ? "PUT" : "POST";
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to save risk assessment");
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/risk-assessments"] });
        toast({ title: `Risk assessment ${assessment ? "updated" : "created"} successfully` });
        onClose();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save risk assessment", variant: "destructive" });
      },
    });

    const onSubmit = (data: RiskAssessmentFormData) => {
      const riskLevel = calculateRiskLevel({
        severityScore: data.severityScore,
        probabilityScore: data.probabilityScore,
      } as RiskAssessment);
      mutation.mutate({ ...data, riskLevel });
    };

    return (
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assessment ? "Edit" : "New"} Risk Assessment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Risk assessment title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {riskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {riskLocations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Detailed description of the risk" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-5 gap-4">
              <FormField
                control={form.control}
                name="severityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="5" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probabilityScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Probability (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="5" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="humanImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Human Impact (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="5" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="economicImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Economic Impact (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="5" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environmentalImpact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environmental Impact (1-5)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" max="5" onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="affectedPopulation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Population</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDamages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Damages ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastReviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Review Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextReviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Review Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : assessment ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-beaver-dark text-white">
      <EnhancedHeader
        serviceName="BeaverRisk"
        serviceIcon={Shield}
        showBackButton={true}
        backButtonText="Back to Dashboard"
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  ref={newAssessmentButtonRef}
                  className="border-gradient-button flex items-center justify-center px-3 py-2 md:px-6 md:py-3 font-medium text-xs md:text-sm"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-[#f89422]" />
                  <span className="hidden sm:inline">New Assessment</span>
                </button>
              </DialogTrigger>
              <RiskAssessmentDialog onClose={() => {}} />
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Assessments</p>
                  <p className="text-2xl font-bold text-beaver-orange">{stats.totalAssessments}</p>
                </div>
                <Shield className="text-beaver-orange w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Risk</p>
                  <p className="text-2xl font-bold text-red-400">{stats.highRiskCount}</p>
                </div>
                <AlertTriangle className="text-red-400 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Plans</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activePlans}</p>
                </div>
                <CheckCircle className="text-green-400 w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Recent Events</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.recentEvents}</p>
                </div>
                <Clock className="text-yellow-400 w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="risk-mapping" className="space-y-6">
          <TabsList className="bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="risk-mapping" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-white">
              <Map className="w-4 h-4 mr-2" />
              Risk Mapping
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="mitigation" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mitigation Plans
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Events & History
            </TabsTrigger>
          </TabsList>

          {/* Risk Mapping Tab */}
          <TabsContent value="risk-mapping" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange">Risk Locations Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Interactive Map</p>
                      <p className="text-gray-500 text-sm">OpenStreetMap integration coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-beaver-orange">Risk Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {riskLocations.map((location) => (
                      <div key={location.id} className="p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{location.name}</h4>
                            <p className="text-gray-400 text-sm">{location.type.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-gray-500 text-xs mt-1">{location.address}</p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {location.capacity ? `${location.capacity}` : "N/A"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="assessments" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-beaver-surface border-beaver-surface-light">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Types</SelectItem>
                  {riskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Matrix Grid */}
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange">Risk Assessment Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {assessmentsLoading ? (
                    <div className="col-span-full text-center py-8 text-gray-400">Loading assessments...</div>
                  ) : filteredAssessments.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-400">No assessments found</div>
                  ) : (
                    filteredAssessments.map((assessment) => {
                      const riskLevel = calculateRiskLevel(assessment);
                      const riskType = riskTypes.find(t => t.value === assessment.riskType);
                      const RiskIcon = riskType?.icon || AlertTriangle;

                      return (
                        <Card key={assessment.id} className="bg-gray-800 border-gray-700 hover:border-beaver-orange transition-colors cursor-pointer"
                              onClick={() => setSelectedRisk(assessment)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <RiskIcon className={`w-5 h-5 ${riskType?.color || 'text-gray-400'}`} />
                                <Badge className={riskLevels[riskLevel as keyof typeof riskLevels].color}>
                                  {riskLevels[riskLevel as keyof typeof riskLevels].label}
                                </Badge>
                              </div>
                              <div className="flex space-x-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <RiskAssessmentDialog assessment={assessment} onClose={() => {}} />
                                </Dialog>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedRisk(assessment)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            <h3 className="font-semibold text-white mb-2">{assessment.title}</h3>
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{assessment.description}</p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Severity:</span>
                                <span className="text-white ml-1">{assessment.severityScore}/5</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Probability:</span>
                                <span className="text-white ml-1">{assessment.probabilityScore}/5</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Population:</span>
                                <span className="text-white ml-1">{assessment.affectedPopulation?.toLocaleString() || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                              <Badge variant="outline" className="text-xs">
                                {riskType?.label || assessment.riskType}
                              </Badge>
                              <Badge className={statusColors[assessment.status as keyof typeof statusColors]}>
                                {assessment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mitigation Plans Tab */}
          <TabsContent value="mitigation" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange">Mitigation Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plansLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading mitigation plans...</div>
                  ) : mitigationPlans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No mitigation plans found</div>
                  ) : (
                    mitigationPlans.map((plan) => (
                      <Card key={plan.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{plan.title}</h3>
                              <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors[plan.status as keyof typeof statusColors]}>
                                {plan.status.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className={
                                plan.priority === 'urgent' ? 'border-red-500 text-red-400' :
                                plan.priority === 'high' ? 'border-orange-500 text-orange-400' :
                                plan.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                'border-green-500 text-green-400'
                              }>
                                {plan.priority}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Department:</span>
                              <p className="text-white">{plan.responsibleDepartment || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Cost:</span>
                              <p className="text-white">${plan.estimatedCost?.toLocaleString() || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Timeline:</span>
                              <p className="text-white">{plan.timeline?.replace('_', ' ') || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Target Date:</span>
                              <p className="text-white">
                                {plan.targetCompletionDate ? format(new Date(plan.targetCompletionDate), "MMM dd, yyyy") : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {plan.successMetrics && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <span className="text-gray-500 text-sm">Success Metrics:</span>
                              <p className="text-white text-sm">{plan.successMetrics}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events & History Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange">Risk Events & Historical Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventsLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading risk events...</div>
                  ) : riskEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No risk events found</div>
                  ) : (
                    riskEvents.map((event) => (
                      <Card key={event.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-white">{event.title}</h3>
                                <Badge variant="outline" className={
                                  event.eventType === 'incident' ? 'border-red-500 text-red-400' :
                                  event.eventType === 'drill' ? 'border-blue-500 text-blue-400' :
                                  event.eventType === 'exercise' ? 'border-green-500 text-green-400' :
                                  'border-yellow-500 text-yellow-400'
                                }>
                                  {event.eventType}
                                </Badge>
                                <Badge className={
                                  event.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                  event.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                                  event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                }>
                                  {event.severity}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm">{event.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 text-sm">
                                {format(new Date(event.eventDate), "MMM dd, yyyy")}
                              </p>
                              {event.responseTime && (
                                <p className="text-gray-400 text-sm">
                                  Response: {event.responseTime} min
                                </p>
                              )}
                            </div>
                          </div>

                          {event.actualImpact && (
                            <div className="mb-3">
                              <span className="text-gray-500 text-sm">Impact:</span>
                              <p className="text-white text-sm">{event.actualImpact}</p>
                            </div>
                          )}

                          {event.lessonsLearned && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <span className="text-gray-500 text-sm">Lessons Learned:</span>
                              <p className="text-white text-sm">{event.lessonsLearned}</p>
                            </div>
                          )}

                          {event.followUpActions && (
                            <div className="mt-2">
                              <span className="text-gray-500 text-sm">Follow-up Actions:</span>
                              <p className="text-white text-sm">{event.followUpActions}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}