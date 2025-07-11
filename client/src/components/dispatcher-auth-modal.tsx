import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, KeyRound, User, Shield, CheckCircle2, AlertCircle, Scan } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface DispatcherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string, callTaker: { id: number; name: string }) => void;
  incidentId?: number;
}

export function DispatcherAuthModal({ isOpen, onClose, onSuccess, incidentId }: DispatcherAuthModalProps) {
  const [pin, setPin] = useState("");
  const [chipCardId, setChipCardId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 4-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const credentials = sessionStorage.getItem("beavernet-auth");
      if (!credentials) {
        throw new Error("No authentication credentials found");
      }

      const { username, password } = JSON.parse(credentials);
      const authHeader = btoa(`${username}:${password}`);

      const response = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          pin,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Log the call entry
        await logCallEntry(data.sessionId, "pin");
        
        toast({
          title: "PIN Verified",
          description: "Access granted to 911 Call Entry",
        });
        
        onSuccess(data.sessionId, {
          id: user!.id,
          name: user!.name,
        });
        
        setPin("");
        onClose();
      } else {
        toast({
          title: "PIN Verification Failed",
          description: data.message || "Invalid PIN entered",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChipCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chipCardId.trim()) {
      toast({
        title: "Invalid Card ID",
        description: "Please enter a chip card ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const credentials = sessionStorage.getItem("beavernet-auth");
      if (!credentials) {
        throw new Error("No authentication credentials found");
      }

      const { username, password } = JSON.parse(credentials);
      const authHeader = btoa(`${username}:${password}`);

      const response = await fetch("/api/auth/verify-chip-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          chipCardId: chipCardId.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Log the call entry
        await logCallEntry(data.sessionId, "chip_card");
        
        toast({
          title: "Chip Card Verified",
          description: `Welcome ${data.user.name}`,
        });
        
        onSuccess(data.sessionId, {
          id: data.user.id,
          name: data.user.name,
        });
        
        setChipCardId("");
        onClose();
      } else {
        toast({
          title: "Card Verification Failed",
          description: data.message || "Invalid chip card",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Chip card verification error:", error);
      toast({
        title: "Verification Error",
        description: "Failed to verify chip card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const simulateCardScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Simulate successful scan with sample card ID
      setChipCardId("CARD-002-SJ");
      setIsScanning(false);
      toast({
        title: "Card Scanned",
        description: "Chip card detected successfully",
      });
    }, 2000);
  };

  const logCallEntry = async (sessionId: string, authMethod: string) => {
    try {
      const credentials = sessionStorage.getItem("beavernet-auth");
      if (!credentials) return;

      const { username, password } = JSON.parse(credentials);
      const authHeader = btoa(`${username}:${password}`);

      await fetch("/api/call-entry-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          incidentId: incidentId || null,
          callTakerId: user?.id,
          callTakerName: user?.name,
          authMethod,
          sessionId,
          ipAddress: "127.0.0.1", // In a real app, this would be the actual IP
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error("Failed to log call entry:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            911 Dispatcher Authentication
          </DialogTitle>
          <DialogDescription>
            Please verify your identity to access 911 Call Entry system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Current User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Access Level:</span>
                <Badge variant={user?.accessLevel === "911 Dispatcher" ? "default" : "secondary"}>
                  {user?.accessLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="text-sm">{user?.department}</span>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Methods */}
          <Tabs defaultValue="pin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pin" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                Employee PIN
              </TabsTrigger>
              <TabsTrigger value="chip" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Chip Card
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pin" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Enter 4-Digit PIN</CardTitle>
                  <CardDescription>
                    Enter your personal 4-digit employee PIN number
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePinSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">Employee PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="Enter 4-digit PIN"
                        maxLength={4}
                        className="text-center text-lg tracking-widest"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isVerifying || pin.length !== 4}
                    >
                      {isVerifying ? (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify PIN
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chip" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chip Card Scanner</CardTitle>
                  <CardDescription>
                    Scan your employee chip card or enter the card ID manually
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChipCardSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chipCard">Chip Card ID</Label>
                      <div className="flex gap-2">
                        <Input
                          id="chipCard"
                          type="text"
                          value={chipCardId}
                          onChange={(e) => setChipCardId(e.target.value)}
                          placeholder="Scan card or enter ID"
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={simulateCardScan}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <Scan className="mr-2 h-4 w-4 animate-pulse" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Scan className="mr-2 h-4 w-4" />
                              Scan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isVerifying || !chipCardId.trim()}
                    >
                      {isVerifying ? (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Verify Card
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Info Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Notice</p>
                <p>All authentication attempts are logged for security and audit purposes.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}