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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { EnhancedHeader } from "@/components/enhanced-header";

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
                  <div className="text-center text-gray-400 py-8">
                    <Clipboard className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p>Response Tracking Form</p>
                    <p className="text-sm">Based on Field Response Tracking documentation</p>
                    <p className="text-xs mt-2">Form functionality coming soon</p>
                  </div>
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