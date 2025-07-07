import { ArrowLeft, Shield, Users, FileText, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import beaverImage from "@assets/beaver_1751858605395.png";

export default function BeaverPatch() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleBackToServices = () => {
    setLocation("/dashboard");
  };

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
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-beaver-orange/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-beaver-orange" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-beaver-orange">BeaverPatch</h1>
              <p className="text-gray-400">Computer-Aided Dispatch System</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-400 border-green-400">
            <Activity className="w-3 h-3 mr-1" />
            System Online
          </Badge>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Active Incidents */}
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white">3</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">High Priority</span>
                    <span className="text-red-400 font-medium">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Medium Priority</span>
                    <span className="text-yellow-400 font-medium">2</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Low Priority</span>
                    <span className="text-green-400 font-medium">0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Units Status */}
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Units Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">On Duty</span>
                    <span className="text-green-400 font-medium">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">En Route</span>
                    <span className="text-yellow-400 font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Off Duty</span>
                    <span className="text-gray-400 font-medium">1</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card className="bg-beaver-surface border-beaver-surface-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-beaver-orange flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Reports Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white">27</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Completed</span>
                    <span className="text-green-400 font-medium">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-yellow-400 font-medium">3</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Overdue</span>
                    <span className="text-red-400 font-medium">0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-beaver-surface border-beaver-surface-light">
          <CardHeader>
            <CardTitle className="text-lg text-beaver-orange">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-beaver-surface-light rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Emergency Call - Code 3</p>
                    <span className="text-xs text-gray-400">2 min ago</span>
                  </div>
                  <p className="text-sm text-gray-400">Unit 205 dispatched to 123 Main St</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-beaver-surface-light rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Traffic Stop</p>
                    <span className="text-xs text-gray-400">5 min ago</span>
                  </div>
                  <p className="text-sm text-gray-400">Unit 103 - Routine traffic violation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-beaver-surface-light rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Report Submitted</p>
                    <span className="text-xs text-gray-400">8 min ago</span>
                  </div>
                  <p className="text-sm text-gray-400">Unit 207 - Incident report filed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}