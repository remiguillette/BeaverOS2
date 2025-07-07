import { useState } from "react";
import { useLocation } from "wouter";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import beaverImage from "@assets/beaver_1751858605395.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(username, password);
    
    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome to BEAVERNET",
      });
      setLocation("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please use admin/admin123",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-beaver-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
      {/* Logo and Title Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w- h- bg-black rounded-xl mb-4">
          <img src={beaverImage} alt="Beaver" className="w-50 h-50 object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-beaver-orange mb-2">BEAVERNET</h1>
        <p className="text-gray-400"></p>
      </div>

      {/* Login Form */}
      <Card className="bg-beaver-surface border-beaver-surface-light">
        <CardHeader className="text-center pb-6">
          <h2 className="text-2xl font-semibold text-white"></h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-beaver-surface-light border-gray-700 text-white placeholder-gray-500 focus:border-beaver-orange focus:ring-beaver-orange focus:ring-opacity-20 pr-10"
                  required
                />
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-beaver-surface-light border-gray-700 text-white placeholder-gray-500 focus:border-beaver-orange focus:ring-beaver-orange focus:ring-opacity-20 pr-10"
                  required
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-beaver-orange hover:bg-orange-500 text-black font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-beaver-orange focus:ring-opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Default credentials: admin / admin123</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
