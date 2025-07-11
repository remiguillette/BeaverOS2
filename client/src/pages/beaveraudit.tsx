import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EnhancedHeader } from "@/components/enhanced-header";
import { 
  ClipboardCheck, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Camera, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileCheck,
  Search,
  Plus,
  Download,
  Edit,
  Eye
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { 
  AuditSchedule, 
  InsertAuditSchedule,
  AuditTemplate,
  InsertAuditTemplate,
  AuditReport, 
  InsertAuditReport,
  AuditNonCompliance,
  InsertAuditNonCompliance,
  AuditEvidence,
  InsertAuditEvidence 
} from "@shared/schema";

// Form schemas
const scheduleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  auditType: z.enum(["recurring", "one_time"]),
  facilityType: z.enum(["command_post", "community_center", "pound", "vehicle", "equipment"]),
  missionType: z.enum(["animal_intervention", "fire_safety", "first_aid", "health_safety"]),
  standardsFramework: z.enum(["OHS", "PSC", "PAWS", "municipal_laws", "CSA"]),
  inspectorId: z.string().min(1, "Inspector ID is required"),
  inspectorName: z.string().min(1, "Inspector name is required"),
  location: z.string().min(1, "Location is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  frequency: z.string().optional(),
});

const reportFormSchema = z.object({
  scheduleId: z.number(),
  reportNumber: z.string().min(1, "Report number is required"),
  auditDate: z.string().min(1, "Audit date is required"),
  inspectorId: z.string().min(1, "Inspector ID is required"),
  inspectorName: z.string().min(1, "Inspector name is required"),
  location: z.string().min(1, "Location is required"),
  facilityType: z.enum(["command_post", "community_center", "pound", "vehicle", "equipment"]),
  missionType: z.enum(["animal_intervention", "fire_safety", "first_aid", "health_safety"]),
  standardsFramework: z.enum(["OHS", "PSC", "PAWS", "municipal_laws", "CSA"]),
});

const nonComplianceFormSchema = z.object({
  auditReportId: z.number(),
  itemNumber: z.string().min(1, "Item number is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["critical", "minor", "urgent"]),
  category: z.string().optional(),
  standardReference: z.string().optional(),
  correctiveAction: z.string().optional(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export default function BeaverAudit() {
  const [, setLocation] = useLocation();
  const [selectedSchedule, setSelectedSchedule] = useState<AuditSchedule | null>(null);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showNonComplianceDialog, setShowNonComplianceDialog] = useState(false);
  const { toast } = useToast();

  // Fetch data from APIs
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery<AuditSchedule[]>({
    queryKey: ["/api/audit-schedules"],
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<AuditTemplate[]>({
    queryKey: ["/api/audit-templates"],
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery<AuditReport[]>({
    queryKey: ["/api/audit-reports"],
  });

  const { data: nonCompliances = [], isLoading: nonCompliancesLoading } = useQuery<AuditNonCompliance[]>({
    queryKey: ["/api/audit-non-compliances"],
  });

  // Forms
  const scheduleForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      auditType: "one_time",
      facilityType: "command_post",
      missionType: "fire_safety",
      standardsFramework: "OHS",
      inspectorId: "",
      inspectorName: "",
      location: "",
      scheduledDate: "",
      frequency: "",
    },
  });

  const reportForm = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      scheduleId: 0,
      reportNumber: "",
      auditDate: "",
      inspectorId: "",
      inspectorName: "",
      location: "",
      facilityType: "command_post",
      missionType: "fire_safety",
      standardsFramework: "OHS",
    },
  });

  const nonComplianceForm = useForm<z.infer<typeof nonComplianceFormSchema>>({
    resolver: zodResolver(nonComplianceFormSchema),
    defaultValues: {
      auditReportId: 0,
      itemNumber: "",
      description: "",
      severity: "minor",
      category: "",
      standardReference: "",
      correctiveAction: "",
      assignedTo: "",
      assignedToName: "",
      dueDate: "",
      priority: "medium",
    },
  });

  // Mutations
  const createScheduleMutation = useMutation({
    mutationFn: async (data: InsertAuditSchedule) => {
      return apiRequest<AuditSchedule>("/api/audit-schedules", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-schedules"] });
      setShowScheduleDialog(false);
      scheduleForm.reset();
      toast({
        title: "Schedule Created",
        description: "Audit schedule has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create audit schedule.",
        variant: "destructive",
      });
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: InsertAuditReport) => {
      return apiRequest<AuditReport>("/api/audit-reports", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-reports"] });
      setShowReportDialog(false);
      reportForm.reset();
      toast({
        title: "Report Created",
        description: "Audit report has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create audit report.",
        variant: "destructive",
      });
    },
  });

  const createNonComplianceMutation = useMutation({
    mutationFn: async (data: InsertAuditNonCompliance) => {
      return apiRequest<AuditNonCompliance>("/api/audit-non-compliances", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-non-compliances"] });
      setShowNonComplianceDialog(false);
      nonComplianceForm.reset();
      toast({
        title: "Non-Compliance Created",
        description: "Non-compliance issue has been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create non-compliance record.",
        variant: "destructive",
      });
    },
  });

  const handleBackToDashboard = () => {
    setLocation("/");
  };

  const onScheduleSubmit = async (values: z.infer<typeof scheduleFormSchema>) => {
    const scheduleData: InsertAuditSchedule = {
      ...values,
      scheduledDate: new Date(values.scheduledDate),
      frequency: values.frequency || null,
    };
    createScheduleMutation.mutate(scheduleData);
  };

  const onReportSubmit = async (values: z.infer<typeof reportFormSchema>) => {
    const reportData: InsertAuditReport = {
      ...values,
      auditDate: new Date(values.auditDate),
      overallScore: 0,
      totalItems: 0,
      compliantItems: 0,
      nonCompliantItems: 0,
      criticalIssues: 0,
      responses: "{}",
      digitalSignature: null,
      signedAt: null,
      status: "draft",
    };
    createReportMutation.mutate(reportData);
  };

  const onNonComplianceSubmit = async (values: z.infer<typeof nonComplianceFormSchema>) => {
    const nonComplianceData: InsertAuditNonCompliance = {
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate) : null,
      resolvedAt: null,
      resolutionNotes: null,
      evidence: "[]",
    };
    createNonComplianceMutation.mutate(nonComplianceData);
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      minor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return colors[severity as keyof typeof colors] || colors.minor;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const filteredSchedules = schedules.filter(schedule =>
    schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.inspectorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(report =>
    report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.inspectorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate dashboard stats
  const totalSchedules = schedules.length;
  const activeSchedules = schedules.filter(s => s.status === "scheduled").length;
  const completedReports = reports.filter(r => r.status === "completed").length;
  const openNonCompliances = nonCompliances.filter(nc => nc.status === "open").length;
  const criticalIssues = nonCompliances.filter(nc => nc.severity === "critical").length;

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader
        serviceName="BeaverAudit"
        serviceIcon={ClipboardCheck}
        showBackButton={true}
        backButtonText="Back to Dashboard"
        backButtonAction={handleBackToDashboard}
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Public Safety Audit & Compliance</h1>
          <p className="text-muted-foreground">
            Plan and conduct audits, verify compliance with standards, report non-compliances, and track corrective actions.
          </p>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Schedules</p>
                  <p className="text-2xl font-bold text-foreground">{totalSchedules}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Schedules</p>
                  <p className="text-2xl font-bold text-foreground">{activeSchedules}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Reports</p>
                  <p className="text-2xl font-bold text-foreground">{completedReports}</p>
                </div>
                <FileCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold text-foreground">{openNonCompliances}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-foreground">{criticalIssues}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedules" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Audit Grids
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Evidence
            </TabsTrigger>
            <TabsTrigger value="non-compliance" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Non-Compliance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Audit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule New Audit</DialogTitle>
                    <DialogDescription>
                      Create a new audit schedule for facilities, vehicles, or equipment.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scheduleForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Audit title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleForm.control}
                          name="auditType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select audit type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="one_time">One-time</SelectItem>
                                  <SelectItem value="recurring">Recurring</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scheduleForm.control}
                          name="facilityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facility Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select facility type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="command_post">Command Post</SelectItem>
                                  <SelectItem value="community_center">Community Center</SelectItem>
                                  <SelectItem value="pound">Pound</SelectItem>
                                  <SelectItem value="vehicle">Vehicle</SelectItem>
                                  <SelectItem value="equipment">Equipment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleForm.control}
                          name="missionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mission Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select mission type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="animal_intervention">Animal Intervention</SelectItem>
                                  <SelectItem value="fire_safety">Fire Safety</SelectItem>
                                  <SelectItem value="first_aid">First Aid</SelectItem>
                                  <SelectItem value="health_safety">Health & Safety</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={scheduleForm.control}
                        name="standardsFramework"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standards Framework</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select standards framework" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="OHS">Occupational Health and Safety</SelectItem>
                                <SelectItem value="PSC">Public Safety Canada</SelectItem>
                                <SelectItem value="PAWS">PAWS Animal Welfare</SelectItem>
                                <SelectItem value="municipal_laws">Municipal Laws</SelectItem>
                                <SelectItem value="CSA">CSA Standards</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scheduleForm.control}
                          name="inspectorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inspector ID</FormLabel>
                              <FormControl>
                                <Input placeholder="INSP001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleForm.control}
                          name="inspectorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inspector Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Inspector name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={scheduleForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Location to be audited" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scheduleForm.control}
                          name="scheduledDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scheduled Date</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={scheduleForm.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency (if recurring)</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                  <SelectItem value="quarterly">Quarterly</SelectItem>
                                  <SelectItem value="annually">Annually</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createScheduleMutation.isPending}>
                          {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {schedulesLoading ? (
              <div className="flex justify-center p-8">
                <div className="text-muted-foreground">Loading schedules...</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{schedule.title}</h3>
                            <Badge className={getStatusBadge(schedule.status)}>
                              {schedule.status.replace('_', ' ')}
                            </Badge>
                            {schedule.auditType === "recurring" && (
                              <Badge variant="outline">Recurring</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {schedule.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {schedule.inspectorName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(schedule.scheduledDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {schedule.facilityType.replace('_', ' ')} - {schedule.missionType.replace('_', ' ')}
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm"><strong>Standards:</strong> {schedule.standardsFramework}</p>
                            {schedule.frequency && (
                              <p className="text-sm"><strong>Frequency:</strong> {schedule.frequency}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredSchedules.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No audit schedules found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? "No schedules match your search criteria." : "Create your first audit schedule to get started."}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowScheduleDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Schedule First Audit
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dynamic Audit Grids
                </CardTitle>
                <CardDescription>
                  Customizable audit templates based on facility type, mission type, and applicable standards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="text-muted-foreground">Loading templates...</div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <Card key={template.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{template.name}</h4>
                              <div className="text-sm text-muted-foreground mt-1">
                                <p><strong>Facility:</strong> {template.facilityType.replace('_', ' ')}</p>
                                <p><strong>Mission:</strong> {template.missionType.replace('_', ' ')}</p>
                                <p><strong>Standards:</strong> {template.standardsFramework}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                Use Template
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {templates.length === 0 && (
                      <div className="text-center p-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No audit templates available</h3>
                        <p className="text-muted-foreground">Templates will be loaded automatically based on your audit requirements.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Evidence and Documentation
                </CardTitle>
                <CardDescription>
                  Upload photos, videos, PDFs, and other evidence for audit findings with GPS coordinates and timestamps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Evidence Collection</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload and manage audit evidence with automatic timestamping and GPS coordinates.
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Evidence
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non-compliance" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Non-Compliance Tracking</h3>
              <Dialog open={showNonComplianceDialog} onOpenChange={setShowNonComplianceDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Report Non-Compliance Issue</DialogTitle>
                    <DialogDescription>
                      Record a non-compliance finding and assign corrective actions.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...nonComplianceForm}>
                    <form onSubmit={nonComplianceForm.handleSubmit(onNonComplianceSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={nonComplianceForm.control}
                          name="auditReportId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Audit Report</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select audit report" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {reports.map((report) => (
                                    <SelectItem key={report.id} value={report.id.toString()}>
                                      {report.reportNumber} - {report.location}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={nonComplianceForm.control}
                          name="itemNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Item #" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={nonComplianceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the non-compliance issue..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={nonComplianceForm.control}
                          name="severity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Severity</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="minor">Minor</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={nonComplianceForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={nonComplianceForm.control}
                        name="correctiveAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corrective Action</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the required corrective action..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={nonComplianceForm.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To (ID)</FormLabel>
                              <FormControl>
                                <Input placeholder="USER001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={nonComplianceForm.control}
                          name="assignedToName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To (Name)</FormLabel>
                              <FormControl>
                                <Input placeholder="Person responsible" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={nonComplianceForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowNonComplianceDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createNonComplianceMutation.isPending}>
                          {createNonComplianceMutation.isPending ? "Creating..." : "Report Issue"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {nonCompliancesLoading ? (
              <div className="flex justify-center p-8">
                <div className="text-muted-foreground">Loading non-compliance issues...</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {nonCompliances.map((nc) => (
                  <Card key={nc.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Item #{nc.itemNumber}</h4>
                            <Badge className={getSeverityBadge(nc.severity)}>
                              {nc.severity}
                            </Badge>
                            <Badge variant="outline">
                              {nc.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm mb-2">{nc.description}</p>
                          
                          {nc.correctiveAction && (
                            <div className="mb-2">
                              <p className="text-sm font-medium">Corrective Action:</p>
                              <p className="text-sm text-muted-foreground">{nc.correctiveAction}</p>
                            </div>
                          )}

                          <div className="flex gap-4 text-sm text-muted-foreground">
                            {nc.assignedToName && (
                              <div>
                                <strong>Assigned to:</strong> {nc.assignedToName}
                              </div>
                            )}
                            {nc.dueDate && (
                              <div>
                                <strong>Due:</strong> {new Date(nc.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {nonCompliances.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No non-compliance issues</h3>
                      <p className="text-muted-foreground">
                        All audits are currently compliant. Issues will appear here when reported.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Audit Reports & Dashboards</h3>
              <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Audit Report</DialogTitle>
                    <DialogDescription>
                      Generate a new audit report from a scheduled audit.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...reportForm}>
                    <form onSubmit={reportForm.handleSubmit(onReportSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={reportForm.control}
                          name="scheduleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Schedule</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select schedule" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {schedules.map((schedule) => (
                                    <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                      {schedule.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reportForm.control}
                          name="reportNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Report Number</FormLabel>
                              <FormControl>
                                <Input placeholder="AUD-2025-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={reportForm.control}
                          name="inspectorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inspector ID</FormLabel>
                              <FormControl>
                                <Input placeholder="INSP001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reportForm.control}
                          name="inspectorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inspector Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Inspector name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={reportForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Audit location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={reportForm.control}
                        name="auditDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audit Date</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowReportDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createReportMutation.isPending}>
                          {createReportMutation.isPending ? "Creating..." : "Create Report"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {reportsLoading ? (
              <div className="flex justify-center p-8">
                <div className="text-muted-foreground">Loading reports...</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{report.reportNumber}</h4>
                            <Badge className={getStatusBadge(report.status)}>
                              {report.status}
                            </Badge>
                            {report.overallScore && (
                              <Badge variant="outline">
                                {report.overallScore}% Compliance
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                            <div>
                              <strong>Location:</strong> {report.location}
                            </div>
                            <div>
                              <strong>Inspector:</strong> {report.inspectorName}
                            </div>
                            <div>
                              <strong>Date:</strong> {new Date(report.auditDate).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Standards:</strong> {report.standardsFramework}
                            </div>
                          </div>

                          {(report.totalItems > 0) && (
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <div>Total Items: {report.totalItems}</div>
                              <div className="text-green-600">Compliant: {report.compliantItems}</div>
                              <div className="text-red-600">Non-Compliant: {report.nonCompliantItems}</div>
                              {report.criticalIssues > 0 && (
                                <div className="text-red-800 font-medium">Critical: {report.criticalIssues}</div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredReports.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No audit reports found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ? "No reports match your search criteria." : "Create your first audit report to get started."}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setShowReportDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Report
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}