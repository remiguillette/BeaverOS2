import { useState } from "react";
import { 
  Cat, Shield, BookOpen, Heart, Plus, Search, Edit, Eye, 
  MapPin, Clock, User, Phone, Mail, Calendar, AlertTriangle,
  FileText, Camera, Thermometer, Stethoscope, Activity,
  CheckCircle, XCircle, AlertCircle, Clipboard, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { EnhancedHeader } from "@/components/enhanced-header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Response Tracking Form Schema based on Field Response Tracking documentation
const responseTrackingSchema = z.object({
  // Section 1: Response Identification
  caseNumber: z.string().min(1, "Case number is required"),
  dateTimeCall: z.string().min(1, "Call date/time is required"),
  dateTimeResponse: z.string().optional(),
  respondingOfficers: z.string().min(1, "Responding officer is required"),
  sourceOfReport: z.string().min(1, "Source of report is required"),
  priorityLevel: z.enum(["urgent", "high", "normal", "low"]),
  
  // Section 2: Complainant/Requester Information
  complainantName: z.string().min(1, "Complainant name is required"),
  complainantAddress: z.string().min(1, "Complainant address is required"),
  complainantPhone: z.string().min(1, "Phone number is required"),
  complainantPhoneSecondary: z.string().optional(),
  complainantEmail: z.string().email().optional().or(z.literal("")),
  consentToContact: z.boolean().default(true),
  
  // Section 3: Location of Intervention
  interventionAddress: z.string().min(1, "Intervention address is required"),
  locationType: z.string().min(1, "Location type is required"),
  locationDetails: z.string().optional(),
  
  // Section 4: Reason and Description
  interventionCategory: z.string().min(1, "Intervention category is required"),
  detailedDescription: z.string().min(1, "Detailed description is required"),
  
  // Section 5: Animal Details
  animalSpecies: z.string().min(1, "Animal species is required"),
  animalBreed: z.string().optional(),
  animalDescription: z.string().min(1, "Animal description is required"),
  animalCondition: z.string().min(1, "Animal condition is required"),
  animalIdentification: z.string().optional(),
  ownerKnown: z.boolean().default(false),
  ownerName: z.string().optional(),
  ownerAddress: z.string().optional(),
  ownerContact: z.string().optional(),
  
  // Section 6: Officer Actions and Findings
  arrivalDateTime: z.string().optional(),
  officerFindings: z.string().min(1, "Officer findings are required"),
  actionsTaken: z.string().min(1, "Actions taken are required"),
  equipmentUsed: z.string().optional(),
  photosEvidence: z.string().optional(),
  testimoniesCollected: z.string().optional(),
  
  // Section 7: Resolution and Follow-up
  interventionStatus: z.string().min(1, "Intervention status is required"),
  endDateTime: z.string().optional(),
  finalReport: z.string().optional(),
  recommendations: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});

type ResponseTrackingFormData = z.infer<typeof responseTrackingSchema>;

export default function BeaverPaws() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("response");
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showFirstAidForm, setShowFirstAidForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "normal": return "bg-blue-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-500 text-white";
      case "ongoing": return "bg-yellow-500 text-black";
      case "pending": return "bg-orange-500 text-white";
      case "cancelled": return "bg-gray-500 text-white";
      default: return "bg-blue-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader 
        serviceName="BeaverPaws" 
        serviceIcon={Cat}
        showBackButton={true}
        backButtonText="Back to Dashboard"
      />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Cases</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Resolved Today</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Emergency Calls</p>
                  <p className="text-2xl font-bold text-white">3</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Animals Registered</p>
                  <p className="text-2xl font-bold text-white">156</p>
                </div>
                <Tag className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="response" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Clipboard className="w-4 h-4 mr-2" />
              Response Tracking
            </TabsTrigger>
            <TabsTrigger value="firstaid" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Heart className="w-4 h-4 mr-2" />
              First Aid
            </TabsTrigger>
            <TabsTrigger value="registry" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Tag className="w-4 h-4 mr-2" />
              BeaverTag
            </TabsTrigger>
            <TabsTrigger value="laws" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <BookOpen className="w-4 h-4 mr-2" />
              Laws
            </TabsTrigger>
          </TabsList>

          {/* Response Tracking Tab */}
          <TabsContent value="response" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search response cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white"
                  />
                </div>
              </div>
              <Dialog open={showResponseForm} onOpenChange={setShowResponseForm}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Response Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-beaver-surface border-beaver-surface-light max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Field Response Tracking</DialogTitle>
                  </DialogHeader>
                  <ResponseTrackingForm onClose={() => setShowResponseForm(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Sample Response Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">CASE-2025-001</CardTitle>
                    <Badge className="bg-red-500 text-white">Urgent</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Stray Animal - Injured</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <p><strong>Location:</strong> 123 Main St, Downtown</p>
                    <p><strong>Officer:</strong> J. Smith</p>
                    <p><strong>Reported:</strong> 2 hours ago</p>
                    <p><strong>Status:</strong> <span className="text-yellow-400">In Progress</span></p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">CASE-2025-002</CardTitle>
                    <Badge className="bg-blue-500 text-white">Normal</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Noise Complaint - Barking</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <p><strong>Location:</strong> 456 Oak Ave, Westside</p>
                    <p><strong>Officer:</strong> M. Johnson</p>
                    <p><strong>Reported:</strong> 4 hours ago</p>
                    <p><strong>Status:</strong> <span className="text-green-400">Resolved</span></p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" size="sm" className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* First Aid Tab */}
          <TabsContent value="firstaid" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search first aid assessments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white"
                  />
                </div>
              </div>
              <Dialog open={showFirstAidForm} onOpenChange={setShowFirstAidForm}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-beaver-surface border-beaver-surface-light max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Animal First Aid Assessment</DialogTitle>
                  </DialogHeader>
                  <div className="text-center text-gray-400 py-8">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p>First Aid Assessment Form</p>
                    <p className="text-sm">Based on advanced first aid documentation</p>
                    <p className="text-xs mt-2">Form functionality coming soon</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-red-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Emergency Protocol</h3>
                  <p className="text-gray-400 text-sm">Immediate life-threatening situations</p>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-yellow-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Thermometer className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Vital Signs</h3>
                  <p className="text-gray-400 text-sm">Check temperature, pulse, breathing</p>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Assessment</h3>
                  <p className="text-gray-400 text-sm">Complete health evaluation</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BeaverTag Registry Tab */}
          <TabsContent value="registry" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Tag className="w-12 h-12 mx-auto mb-3 text-beaver-orange" />
                  <h3 className="text-lg font-semibold text-white mb-2">License Management</h3>
                  <p className="text-gray-400 text-sm">Pet registration & licensing</p>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Microchips</h3>
                  <p className="text-gray-400 text-sm">Chip reading & database</p>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-green-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Vaccination Records</h3>
                  <p className="text-gray-400 text-sm">Health & immunization tracking</p>
                </CardContent>
              </Card>
              
              <Card className="bg-beaver-surface border-beaver-surface-light hover:border-purple-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Search className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">Database Search</h3>
                  <p className="text-gray-400 text-sm">Animal identity lookup</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2 text-beaver-orange" />
                  Quick Animal Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Microchip Number
                    </label>
                    <Input
                      placeholder="Enter microchip number..."
                      className="bg-beaver-surface border-beaver-surface-light text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tag Number
                    </label>
                    <Input
                      placeholder="Enter tag number..."
                      className="bg-beaver-surface border-beaver-surface-light text-white"
                    />
                  </div>
                </div>
                <Button className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
                  <Search className="w-4 h-4 mr-2" />
                  Search Database
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Laws Tab */}
          <TabsContent value="laws" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-beaver-orange" />
                    Provincial Animal Welfare Services Act
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Key Provisions</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Standards of care for all animals</li>
                      <li>• Duty to report animal distress</li>
                      <li>• Prohibition of animal cruelty</li>
                      <li>• Inspector powers and duties</li>
                      <li>• Animal seizure and protection</li>
                    </ul>
                  </div>
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Penalties</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Fines up to $60,000 for individuals</li>
                      <li>• Fines up to $250,000 for corporations</li>
                      <li>• Imprisonment up to 2 years</li>
                      <li>• Prohibition on animal ownership</li>
                      <li>• Administrative penalties available</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-beaver-orange" />
                    Municipal Bylaws
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Animal Control Bylaws</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Dogs must be leashed in public areas</li>
                      <li>• Pet registration required within 30 days</li>
                      <li>• Maximum 3 pets per household</li>
                      <li>• Noise complaints subject to fines</li>
                      <li>• Vaccination records must be current</li>
                    </ul>
                  </div>
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Fines & Penalties</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Unleashed dog: $75</li>
                      <li>• Unregistered pet: $50</li>
                      <li>• Noise violation: $100</li>
                      <li>• Aggressive behavior: $200</li>
                      <li>• Repeat offenses: Double fine</li>
                    </ul>
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

// Response Tracking Form Component
function ResponseTrackingForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<ResponseTrackingFormData>({
    resolver: zodResolver(responseTrackingSchema),
    defaultValues: {
      caseNumber: `CASE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(3, '0')}`,
      dateTimeCall: new Date().toISOString().slice(0, 16),
      priorityLevel: "normal",
      consentToContact: true,
      ownerKnown: false,
    },
  });

  const ownerKnown = form.watch("ownerKnown");

  const onSubmit = (data: ResponseTrackingFormData) => {
    console.log("Response Tracking Form submitted:", data);
    toast({
      title: "Response Case Created",
      description: `Case ${data.caseNumber} has been successfully created.`,
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Section 1: Response Identification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            1. Response Identification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="caseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Case/Response Number *</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateTimeCall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Date & Time of Call/Report *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dateTimeResponse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Date & Time of Response</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="respondingOfficers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Responding Officer(s) *</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sourceOfReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Source of Report *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="citizen_call">Citizen Call</SelectItem>
                      <SelectItem value="online_complaint">Online Complaint</SelectItem>
                      <SelectItem value="officer_observation">Officer Observation</SelectItem>
                      <SelectItem value="police_request">Police Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priorityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Priority Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Section 2: Complainant/Requester Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            2. Complainant/Requester Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="complainantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="complainantEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="complainantAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Full Address *</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="complainantPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Phone Number (Primary) *</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="complainantPhoneSecondary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Phone Number (Secondary)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="consentToContact"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-beaver-surface-light data-[state=checked]:bg-beaver-orange data-[state=checked]:border-beaver-orange"
                  />
                </FormControl>
                <FormLabel className="text-white">Consent to be contacted for follow-up</FormLabel>
              </FormItem>
            )}
          />
        </div>
        
        {/* Section 3: Location of Intervention */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            3. Location of the Intervention
          </h3>
          
          <FormField
            control={form.control}
            name="interventionAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Complete Address of Intervention *</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Type of Location *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private_residence">Private Residence</SelectItem>
                      <SelectItem value="public_park">Public Park</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="public_road">Public Road</SelectItem>
                      <SelectItem value="vacant_lot">Vacant Lot</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="locationDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Location Details</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., backyard, near shed, intersection" className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Section 4: Reason and Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            4. Reason and Description of the Intervention
          </h3>
          
          <FormField
            control={form.control}
            name="interventionCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Intervention Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="stray_animal">Stray Animal</SelectItem>
                    <SelectItem value="bite">Bite</SelectItem>
                    <SelectItem value="neglect_abuse">Neglect/Abuse</SelectItem>
                    <SelectItem value="nuisance_barking">Nuisance - Barking</SelectItem>
                    <SelectItem value="nuisance_odors">Nuisance - Odors</SelectItem>
                    <SelectItem value="distressed_injured">Distressed/Injured Animal</SelectItem>
                    <SelectItem value="wild_animal">Wild Animal</SelectItem>
                    <SelectItem value="license_check">License Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="detailedDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Detailed Description of the Report *</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Section 5: Animal Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            5. Details of the Animal(s) Involved
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="animalSpecies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Species *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="bird">Bird</SelectItem>
                      <SelectItem value="raccoon">Raccoon</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="animalBreed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Breed (if applicable)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="animalDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description of the Animal *</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Color, size, sex, distinguishing marks, collar, etc." className="bg-beaver-surface border-beaver-surface-light text-white" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="animalCondition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Condition of the Animal *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                      <SelectItem value="fearful">Fearful</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="healthy">Apparently Healthy</SelectItem>
                      <SelectItem value="deceased">Deceased</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="animalIdentification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Identification (Tag/Microchip)</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="ownerKnown"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-beaver-surface-light data-[state=checked]:bg-beaver-orange data-[state=checked]:border-beaver-orange"
                  />
                </FormControl>
                <FormLabel className="text-white">Owner information known</FormLabel>
              </FormItem>
            )}
          />
          
          {ownerKnown && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Owner Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ownerContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Owner Contact</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ownerAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-white">Owner Address</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
        
        {/* Section 6: Officer Actions and Findings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            6. Actions and Findings of the Field Officer
          </h3>
          
          <FormField
            control={form.control}
            name="arrivalDateTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Date & Time of Arrival at Scene</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="officerFindings"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Officer's Findings *</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Objective description of the situation upon arrival" className="bg-beaver-surface border-beaver-surface-light text-white" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="actionsTaken"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Actions Taken *</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="e.g., capture of animal, discussion with owner, issuance of notice, transport to shelter/vet" className="bg-beaver-surface border-beaver-surface-light text-white" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="equipmentUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Equipment Used</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., cage, capture leash, microchip reader" className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="photosEvidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Photos and Evidence</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Digital file references" className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="testimoniesCollected"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Testimonies Collected on Site</FormLabel>
                <FormControl>
                  <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Section 7: Resolution and Follow-up */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-beaver-surface-light pb-2">
            7. Resolution and Follow-up
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="interventionStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Status of Intervention *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="transferred">Transferred to Another Service</SelectItem>
                      <SelectItem value="requires_followup">Requires Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Date & Time Intervention Ended</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="finalReport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Final Officer's Report</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Summary of actions and conclusion" className="bg-beaver-surface border-beaver-surface-light text-white" rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Recommendations</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="e.g., post-adoption follow-up, future inspection, owner education" className="bg-beaver-surface border-beaver-surface-light text-white" rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nextFollowUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Date of Next Follow-up (if necessary)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-6 border-t border-beaver-surface-light">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
            Create Response Case
          </Button>
        </div>
      </form>
    </Form>
  );
}