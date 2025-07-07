import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Plus, Search, Users, Phone, Mail, MapPin, Edit, Save, X, User, FileText, Building, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

const customerFormSchema = insertCustomerSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  homePhone: z.string().optional(),
  workPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export default function BeaverCRM() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Search customers
  const { data: searchResults = [] } = useQuery({
    queryKey: [`/api/customers/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 0,
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiRequest<Customer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsFormOpen(false);
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Customer> }) => {
      return apiRequest<Customer>(`/api/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setEditingCustomer(null);
      setSelectedCustomer(null);
    },
  });

  const handleBackToServices = () => {
    setLocation("/dashboard");
  };

  const displayedCustomers = searchQuery.length > 0 ? searchResults : customers;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-600";
      case "inactive": return "bg-gray-600";
      case "suspended": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return "N/A";
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      {/* Header */}
      <header className="bg-beaver-surface border-b border-beaver-surface-light">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackToServices}
                variant="ghost"
                className="bg-beaver-surface-light hover:bg-gray-700 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Services
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-beaver-orange">BeaverCRM</h1>
                <p className="text-sm text-gray-400">Customer Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-beaver-orange hover:bg-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-beaver-surface border-beaver-surface-light">
                  <DialogHeader>
                    <DialogTitle className="text-beaver-orange">Add New Customer</DialogTitle>
                  </DialogHeader>
                  <CustomerForm onClose={() => setIsFormOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Customer List */}
        <div className="w-1/2 border-r border-beaver-surface-light">
          <div className="p-6 border-b border-beaver-surface-light">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-beaver-orange">Customer Directory</h2>
              <Badge variant="outline" className="text-beaver-orange border-beaver-orange">
                {displayedCustomers.length} customers
              </Badge>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customers by name, ID, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-beaver-surface-light border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {isLoading ? (
              <div className="p-6 text-center text-gray-400">Loading customers...</div>
            ) : displayedCustomers.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No customers found</div>
            ) : (
              <div className="space-y-2 p-4">
                {displayedCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedCustomer?.id === customer.id
                        ? "bg-beaver-orange/20 border-beaver-orange"
                        : "bg-beaver-surface border-beaver-surface-light hover:border-beaver-orange/50"
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-beaver-orange rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            <p className="text-sm text-gray-400">ID: {customer.customerId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(customer.status)} text-white`}>
                            {customer.status}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </div>
                      {customer.email && (
                        <div className="mt-2 flex items-center text-sm text-gray-400">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email}
                        </div>
                      )}
                      {customer.homePhone && (
                        <div className="mt-1 flex items-center text-sm text-gray-400">
                          <Phone className="w-3 h-3 mr-1" />
                          {formatPhone(customer.homePhone)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="w-1/2 overflow-y-auto">
          {selectedCustomer ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h2>
                  <p className="text-gray-400">Customer ID: {selectedCustomer.customerId}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(selectedCustomer.status)} text-white`}>
                    {selectedCustomer.status}
                  </Badge>
                  <Button
                    onClick={() => setEditingCustomer(selectedCustomer)}
                    size="sm"
                    variant="outline"
                    className="border-beaver-orange text-beaver-orange hover:bg-beaver-orange hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-beaver-surface-light">
                  <TabsTrigger value="identity" className="data-[state=active]:bg-beaver-orange">
                    <User className="w-4 h-4 mr-2" />
                    Identity
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="data-[state=active]:bg-beaver-orange">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="data-[state=active]:bg-beaver-orange">
                    <Building className="w-4 h-4 mr-2" />
                    Professional
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-beaver-orange">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="identity" className="space-y-4">
                  <Card className="bg-beaver-surface border-beaver-surface-light">
                    <CardHeader>
                      <CardTitle className="text-beaver-orange">Identity Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-400">First Name</Label>
                          <p className="text-white">{selectedCustomer.firstName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Last Name</Label>
                          <p className="text-white">{selectedCustomer.lastName}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-400">Phonetic Name</Label>
                          <p className="text-white">{selectedCustomer.phoneticName || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Nickname</Label>
                          <p className="text-white">{selectedCustomer.nickname || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Date of Birth</Label>
                        <p className="text-white">{formatDate(selectedCustomer.dateOfBirth)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Driver's License Number</Label>
                        <p className="text-white">{selectedCustomer.driverLicenseNumber || "N/A"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card className="bg-beaver-surface border-beaver-surface-light">
                    <CardHeader>
                      <CardTitle className="text-beaver-orange">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-400">Home Phone</Label>
                          <p className="text-white">{formatPhone(selectedCustomer.homePhone)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Work Phone</Label>
                          <p className="text-white">{formatPhone(selectedCustomer.workPhone)}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-400">Work Extension</Label>
                        <p className="text-white">{selectedCustomer.workExtension || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Email</Label>
                        <p className="text-white">{selectedCustomer.email || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Address</Label>
                        <div className="text-white">
                          {selectedCustomer.address && (
                            <p>{selectedCustomer.address}</p>
                          )}
                          {(selectedCustomer.city || selectedCustomer.state || selectedCustomer.zipCode) && (
                            <p>
                              {selectedCustomer.city && selectedCustomer.city}
                              {selectedCustomer.city && selectedCustomer.state && ", "}
                              {selectedCustomer.state && selectedCustomer.state}
                              {selectedCustomer.zipCode && ` ${selectedCustomer.zipCode}`}
                            </p>
                          )}
                          {!selectedCustomer.address && !selectedCustomer.city && !selectedCustomer.state && !selectedCustomer.zipCode && (
                            <p>N/A</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="professional" className="space-y-4">
                  <Card className="bg-beaver-surface border-beaver-surface-light">
                    <CardHeader>
                      <CardTitle className="text-beaver-orange">Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Group/Category</Label>
                        <p className="text-white">{selectedCustomer.group || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Professional Information</Label>
                        <p className="text-white">{selectedCustomer.professionalInfo || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Professional License Number</Label>
                        <p className="text-white">{selectedCustomer.professionalLicenseNumber || "N/A"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <Card className="bg-beaver-surface border-beaver-surface-light">
                    <CardHeader>
                      <CardTitle className="text-beaver-orange">Notes & Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Notes</Label>
                          <div className="mt-2 p-3 bg-beaver-surface-light rounded-md">
                            <p className="text-white whitespace-pre-wrap">
                              {selectedCustomer.notes || "No notes available"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-beaver-surface-light">
                          <div>
                            <Label className="text-gray-400">Created</Label>
                            <p className="text-white">{formatDate(selectedCustomer.createdAt)}</p>
                          </div>
                          <div>
                            <Label className="text-gray-400">Last Updated</Label>
                            <p className="text-white">{formatDate(selectedCustomer.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Edit Form Dialog */}
              {editingCustomer && (
                <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-beaver-surface border-beaver-surface-light">
                    <DialogHeader>
                      <DialogTitle className="text-beaver-orange">Edit Customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                      customer={editingCustomer}
                      onClose={() => setEditingCustomer(null)}
                      isEditing={true}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Customer Selected</h3>
                <p className="text-gray-500">Select a customer from the list to view their details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomerForm({ 
  customer, 
  onClose, 
  isEditing = false 
}: { 
  customer?: Customer; 
  onClose: () => void; 
  isEditing?: boolean;
}) {
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      customerId: customer?.customerId || "",
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      phoneticName: customer?.phoneticName || "",
      nickname: customer?.nickname || "",
      dateOfBirth: customer?.dateOfBirth ? format(new Date(customer.dateOfBirth), "yyyy-MM-dd") : "",
      homePhone: customer?.homePhone || "",
      workPhone: customer?.workPhone || "",
      workExtension: customer?.workExtension || "",
      email: customer?.email || "",
      address: customer?.address || "",
      city: customer?.city || "",
      state: customer?.state || "",
      zipCode: customer?.zipCode || "",
      group: customer?.group || "",
      professionalInfo: customer?.professionalInfo || "",
      professionalLicenseNumber: customer?.professionalLicenseNumber || "",
      driverLicenseNumber: customer?.driverLicenseNumber || "",
      notes: customer?.notes || "",
      status: customer?.status || "active",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      return apiRequest<Customer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!customer?.id) throw new Error("Customer ID is required");
      return apiRequest<Customer>(`/api/customers/${customer.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      onClose();
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-beaver-surface-light">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneticName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Phonetic Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Nickname</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Date of Birth</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        className="bg-beaver-surface-light border-gray-600 text-white" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverLicenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Driver's License Number</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Home Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Work Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workExtension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Work Extension</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Address</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">City</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">State</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="professional" className="space-y-4">
            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Group/Category</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Professional Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      className="bg-beaver-surface-light border-gray-600 text-white" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="professionalLicenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Professional License Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-beaver-surface-light border-gray-600 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-beaver-surface-light border-gray-600 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-beaver-surface border-gray-600">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={6}
                      className="bg-beaver-surface-light border-gray-600 text-white" 
                      placeholder="Add any additional notes or information about the customer..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t border-beaver-surface-light">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-beaver-orange hover:bg-orange-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isPending ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Customer" : "Create Customer")}
          </Button>
        </div>
      </form>
    </Form>
  );
}