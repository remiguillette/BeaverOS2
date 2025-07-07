import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Phone, Clock } from "lucide-react";
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

  return (
    <Card className="w-full max-w-2xl bg-beaver-surface border-beaver-surface-light">
      <CardHeader>
        <CardTitle className="text-beaver-orange flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Incident
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidentNumber" className="text-white">Incident Number</Label>
              <Input
                id="incidentNumber"
                {...form.register("incidentNumber")}
                className="bg-beaver-surface-light border-gray-600 text-white"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">Incident Type</Label>
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
          </div>

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
            <Label htmlFor="address" className="text-white flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Address
            </Label>
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

          <div className="space-y-2">
            <Label htmlFor="complainant" className="text-white flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Complainant/Caller
            </Label>
            <Input
              id="complainant"
              {...form.register("complainant")}
              placeholder="Name of caller (optional)"
              className="bg-beaver-surface-light border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Detailed description of the incident..."
              className="bg-beaver-surface-light border-gray-600 text-white min-h-[100px]"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-beaver-orange hover:bg-orange-600 text-black flex-1"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Incident
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}