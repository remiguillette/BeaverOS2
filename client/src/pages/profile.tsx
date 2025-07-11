import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Building, UserCheck, ArrowLeft, Save } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

interface UserProfile {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  department?: string | null;
  position?: string | null;
  phone?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      department: "",
      position: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        department: profile.department || "",
        position: profile.position || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // Convert empty strings to null
      const cleanData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
      );
      return apiRequest("/api/user/profile", {
        method: "PATCH",
        body: cleanData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  const userProfile = profile as UserProfile;
  const displayName = userProfile?.firstName && userProfile?.lastName 
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.firstName || userProfile?.lastName || userProfile?.username || "User";

  const initials = userProfile?.firstName && userProfile?.lastName 
    ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
    : userProfile?.firstName?.[0] || userProfile?.lastName?.[0] || userProfile?.username?.[0] || "U";

  return (
    <div className="min-h-screen bg-beaver-dark">
      {/* Header */}
      <header className="bg-beaver-surface border-b border-beaver-surface-light">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-beaver-orange">User Profile</h1>
            </div>
            <Button
              onClick={() => setLocation("/dashboard")}
              variant="ghost"
              className="bg-beaver-surface-light hover:bg-gray-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-3 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader>
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile?.avatar || undefined} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-beaver-orange text-black">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <p className="text-gray-400">@{userProfile?.username}</p>
                  {userProfile?.department && (
                    <p className="text-gray-300 flex items-center mt-1">
                      <Building className="w-4 h-4 mr-1" />
                      {userProfile.department}
                    </p>
                  )}
                  {userProfile?.position && (
                    <p className="text-gray-300 flex items-center mt-1">
                      <UserCheck className="w-4 h-4 mr-1" />
                      {userProfile.position}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Form */}
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader>
              <CardTitle className="text-white">Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-beaver-surface-light" />

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...form.register("phone")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-beaver-surface-light" />

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department" className="text-white">Department</Label>
                      <Input
                        id="department"
                        {...form.register("department")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your department"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position" className="text-white">Position</Label>
                      <Input
                        id="position"
                        {...form.register("position")}
                        className="bg-beaver-surface-light border-beaver-surface-light text-white"
                        placeholder="Enter your position"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-beaver-orange hover:bg-orange-600 text-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}