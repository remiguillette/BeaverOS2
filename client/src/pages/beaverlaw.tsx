import { useState } from "react";
import { Cat, Shield, BookOpen, Heart, Plus, Search, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ServiceHeader } from "@/components/service-header";
import { insertAnimalSchema, insertEnforcementReportSchema } from "@shared/schema";
import type { Animal, EnforcementReport } from "@shared/schema";

type AnimalFormData = z.infer<typeof insertAnimalSchema>;
type EnforcementReportFormData = z.infer<typeof insertEnforcementReportSchema>;

export default function BeaverLaw() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("registry");
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showEnforcementForm, setShowEnforcementForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedReport, setSelectedReport] = useState<EnforcementReport | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animals = [], isLoading: loadingAnimals } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  const { data: reports = [], isLoading: loadingReports } = useQuery<EnforcementReport[]>({
    queryKey: ["/api/enforcement-reports"],
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      return await apiRequest("/api/animals", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      setShowAnimalForm(false);
      toast({
        title: "Animal Registered",
        description: "The animal has been successfully registered.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register animal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createEnforcementReportMutation = useMutation({
    mutationFn: async (data: EnforcementReportFormData) => {
      return await apiRequest("/api/enforcement-reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enforcement-reports"] });
      setShowEnforcementForm(false);
      toast({
        title: "Report Created",
        description: "Enforcement report has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create enforcement report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredAnimals = animals.filter(animal => 
    animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReports = reports.filter(report => 
    report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.violationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.violatorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "injured": return "bg-yellow-500";
      case "sick": return "bg-red-500";
      case "deceased": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-500";
      case "paid": return "bg-green-500";
      case "contested": return "bg-yellow-500";
      case "dismissed": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      <ServiceHeader 
        serviceName="BeaverLaw" 
        serviceIcon={Cat}
        userName={`Welcome, ${user?.name}`}
      />

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Animal Controls</h1>
          <p className="text-gray-400">
            Register pets and manage animal control enforcement activities
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface border-beaver-surface-light">
            <TabsTrigger value="registry" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Cat className="w-4 h-4 mr-2" />
              Registry
            </TabsTrigger>
            <TabsTrigger value="enforcement" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Shield className="w-4 h-4 mr-2" />
              Enforcement
            </TabsTrigger>
            <TabsTrigger value="laws" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <BookOpen className="w-4 h-4 mr-2" />
              Laws
            </TabsTrigger>
            <TabsTrigger value="firstaid" className="data-[state=active]:bg-beaver-orange data-[state=active]:text-black">
              <Heart className="w-4 h-4 mr-2" />
              First Aid
            </TabsTrigger>
          </TabsList>

          {/* Animal Registry Tab */}
          <TabsContent value="registry" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search animals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white"
                  />
                </div>
              </div>
              <Dialog open={showAnimalForm} onOpenChange={setShowAnimalForm}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Register Animal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-beaver-surface border-beaver-surface-light max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Register New Animal</DialogTitle>
                  </DialogHeader>
                  <AnimalForm onClose={() => setShowAnimalForm(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Animals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingAnimals ? (
                <div className="col-span-full text-center text-gray-400">Loading animals...</div>
              ) : filteredAnimals.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No animals found</div>
              ) : (
                filteredAnimals.map((animal) => (
                  <Card key={animal.id} className="bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                          {animal.name || "Unnamed"}
                        </CardTitle>
                        <Badge className={`${getStatusColor(animal.healthStatus)} text-white`}>
                          {animal.healthStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">#{animal.registrationNumber}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-gray-300">
                        <p><strong>Species:</strong> {animal.species}</p>
                        <p><strong>Breed:</strong> {animal.breed || "Unknown"}</p>
                        <p><strong>Color:</strong> {animal.color || "Unknown"}</p>
                        {animal.ownerName && (
                          <p><strong>Owner:</strong> {animal.ownerName}</p>
                        )}
                        {animal.isWild && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500 mt-2">
                            Wild Animal
                          </Badge>
                        )}
                        {animal.isStray && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500 mt-2">
                            Stray
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnimal(animal)}
                          className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Enforcement Tab */}
          <TabsContent value="enforcement" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-beaver-surface border-beaver-surface-light text-white"
                  />
                </div>
              </div>
              <Dialog open={showEnforcementForm} onOpenChange={setShowEnforcementForm}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-beaver-orange/90 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-beaver-surface border-beaver-surface-light max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Enforcement Report</DialogTitle>
                  </DialogHeader>
                  <EnforcementReportForm onClose={() => setShowEnforcementForm(false)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loadingReports ? (
                <div className="col-span-full text-center text-gray-400">Loading reports...</div>
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full text-center text-gray-400">No reports found</div>
              ) : (
                filteredReports.map((report) => (
                  <Card key={report.id} className="bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                          {report.reportNumber}
                        </CardTitle>
                        <Badge className={`${getReportStatusColor(report.status)} text-white`}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{report.type}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-gray-300">
                        <p><strong>Violation:</strong> {report.violationType}</p>
                        <p><strong>Location:</strong> {report.location}</p>
                        <p><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</p>
                        <p><strong>Officer:</strong> {report.officerName}</p>
                        {report.violatorName && (
                          <p><strong>Violator:</strong> {report.violatorName}</p>
                        )}
                        {report.fineAmount && (
                          <p><strong>Fine:</strong> ${report.fineAmount}</p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Laws Tab */}
          <TabsContent value="laws" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-beaver-orange" />
                    Municipal Regulations
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

              <Card className="bg-beaver-surface border-beaver-surface-light">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-beaver-orange" />
                    Provincial Laws
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Animal Protection Act</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Duty of care for all animals</li>
                      <li>• Prohibition of animal cruelty</li>
                      <li>• Mandatory veterinary care</li>
                      <li>• Proper shelter and nutrition</li>
                      <li>• Reporting obligations for injuries</li>
                    </ul>
                  </div>
                  <div className="text-gray-300">
                    <h4 className="font-semibold text-white mb-2">Wildlife Protection</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Protected species regulations</li>
                      <li>• Habitat preservation requirements</li>
                      <li>• Hunting and fishing licenses</li>
                      <li>• Endangered species protocols</li>
                      <li>• Wildlife rehabilitation permits</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* First Aid Tab */}
          <TabsContent value="firstaid" className="space-y-6">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-beaver-orange" />
                  Animal First Aid Menu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black h-20 flex flex-col items-center justify-center">
                    <Heart className="w-8 h-8 mb-2" />
                    Emergency Protocols
                  </Button>
                  <Button variant="outline" className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black h-20 flex flex-col items-center justify-center">
                    <Shield className="w-8 h-8 mb-2" />
                    Safety Guidelines
                  </Button>
                  <Button variant="outline" className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-black h-20 flex flex-col items-center justify-center">
                    <BookOpen className="w-8 h-8 mb-2" />
                    Treatment Guide
                  </Button>
                </div>
                <div className="mt-6 text-center text-gray-400">
                  <p>First Aid functionality will be available in future updates</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Animal Registration Form Component
function AnimalForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AnimalFormData>({
    resolver: zodResolver(insertAnimalSchema),
    defaultValues: {
      species: "",
      healthStatus: "healthy",
      isWild: false,
      isStray: false,
      hasOwner: false,
    },
  });

  const createAnimalMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      return await apiRequest("/api/animals", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      onClose();
      toast({
        title: "Animal Registered",
        description: "The animal has been successfully registered.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register animal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnimalFormData) => {
    createAnimalMutation.mutate(data);
  };

  const hasOwner = form.watch("hasOwner");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="species"
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
                    <SelectItem value="rabbit">Rabbit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Breed</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Color</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Age</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 2 years" className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="healthStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Health Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="healthy">Healthy</SelectItem>
                    <SelectItem value="injured">Injured</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="deceased">Deceased</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="healthNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Health Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="foundLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Found Location</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="surrenderLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Surrender Location</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., spa, kennel, veterinary hospital" className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="surrenderReason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Surrender Reason</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-6">
          <FormField
            control={form.control}
            name="isWild"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-beaver-orange"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">
                    Wild Animal
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isStray"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-beaver-orange"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">
                    Stray
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hasOwner"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-beaver-orange"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white">
                    Has Owner
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {hasOwner && (
          <div className="space-y-4 border-t border-beaver-surface-light pt-4">
            <h4 className="text-white font-semibold">Owner Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="ownerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Owner Phone</FormLabel>
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
              name="ownerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Owner Address</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Owner Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="bg-beaver-surface border-beaver-surface-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="microchipNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Microchip Number</FormLabel>
              <FormControl>
                <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Additional Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createAnimalMutation.isPending}
            className="bg-beaver-orange hover:bg-beaver-orange/90 text-black"
          >
            {createAnimalMutation.isPending ? "Registering..." : "Register Animal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Enforcement Report Form Component
function EnforcementReportForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create a custom schema that transforms string numbers to actual numbers
  const enforcementReportFormSchema = insertEnforcementReportSchema.extend({
    fineAmount: z.union([
      z.string().transform((val) => val === "" ? undefined : Number(val)),
      z.number(),
      z.undefined()
    ]).optional(),
  });

  const form = useForm<EnforcementReportFormData>({
    resolver: zodResolver(enforcementReportFormSchema),
    defaultValues: {
      type: "municipal_report",
      status: "active",
      date: new Date(),
      violationType: "",
      location: "",
      officerName: "",
      violatorName: "",
      violatorAddress: "",
      violatorPhone: "",
      description: "",
      fineAmount: "",
    },
  });

  const createEnforcementReportMutation = useMutation({
    mutationFn: async (data: EnforcementReportFormData) => {
      return await apiRequest("/api/enforcement-reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enforcement-reports"] });
      onClose();
      toast({
        title: "Report Created",
        description: "Enforcement report has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create enforcement report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnforcementReportFormData) => {
    console.log("Form submitted with data:", data);
    // Generate report number
    const reportNumber = `ER-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    // Transform data to match backend expectations
    const transformedData = {
      ...data,
      reportNumber,
      date: new Date(data.date), // Ensure date is a Date object
      fineAmount: data.fineAmount ? parseFloat(data.fineAmount as string) : undefined, // Convert string to number
    };
    
    console.log("Transformed data:", transformedData);
    createEnforcementReportMutation.mutate(transformedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Report Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="municipal_report">Municipal Report</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="violationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Violation Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-beaver-surface border-beaver-surface-light text-white">
                      <SelectValue placeholder="Select violation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unleashed_dog">Unleashed Dog</SelectItem>
                    <SelectItem value="noise_complaint">Noise Complaint</SelectItem>
                    <SelectItem value="aggressive_animal">Aggressive Animal</SelectItem>
                    <SelectItem value="unregistered_pet">Unregistered Pet</SelectItem>
                    <SelectItem value="waste_violation">Waste Violation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Location *</FormLabel>
              <FormControl>
                <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="officerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Officer Name *</FormLabel>
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
            name="violatorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Violator Name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="violatorPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Violator Phone</FormLabel>
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
          name="violatorAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Violator Address</FormLabel>
              <FormControl>
                <Input {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description *</FormLabel>
              <FormControl>
                <Textarea {...field} className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fineAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Fine Amount</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" className="bg-beaver-surface border-beaver-surface-light text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={createEnforcementReportMutation.isPending}
            className="bg-beaver-orange hover:bg-beaver-orange/90 text-black"
            onClick={() => {
              console.log("Submit button clicked");
              const formData = form.getValues();
              console.log("Form data:", formData);
              onSubmit(formData);
            }}
          >
            {createEnforcementReportMutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}