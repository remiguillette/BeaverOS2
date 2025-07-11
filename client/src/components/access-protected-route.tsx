import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { DispatcherAuthModal } from "./dispatcher-auth-modal";

interface AccessProtectedRouteProps {
  children: React.ReactNode;
  pageName: string;
}

interface AccessCheckResponse {
  hasAccess: boolean;
  userLevel?: string;
  requiredLevels?: string[];
  message: string;
}

export function AccessProtectedRoute({ children, pageName }: AccessProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [accessCheck, setAccessCheck] = useState<{
    isLoading: boolean;
    hasAccess: boolean;
    error?: string;
    message?: string;
  }>({
    isLoading: true,
    hasAccess: false,
  });
  const [showDispatcherAuth, setShowDispatcherAuth] = useState(false);
  const [dispatcherSession, setDispatcherSession] = useState<{
    sessionId: string;
    callTaker: { id: number; name: string };
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user) {
      return;
    }

    const checkAccess = async () => {
      try {
        const credentials = sessionStorage.getItem("beavernet-auth");
        if (!credentials) {
          setAccessCheck({
            isLoading: false,
            hasAccess: false,
            error: "No credentials found"
          });
          return;
        }

        const { username, password } = JSON.parse(credentials);
        const authHeader = btoa(`${username}:${password}`);

        const response = await fetch(`/api/auth/check-access/${pageName}`, {
          headers: {
            'Authorization': `Basic ${authHeader}`,
          },
        });

        if (response.ok) {
          const data: AccessCheckResponse = await response.json();
          setAccessCheck({
            isLoading: false,
            hasAccess: data.hasAccess,
            message: data.message
          });
          
          // Show dispatcher auth modal for 911 Dispatcher users on BeaverPatch
          if (data.hasAccess && user?.accessLevel === "911 Dispatcher" && pageName === "beaverpatch") {
            setShowDispatcherAuth(true);
          }
        } else {
          const errorData = await response.json();
          setAccessCheck({
            isLoading: false,
            hasAccess: false,
            error: errorData.message || "Access check failed"
          });
        }
      } catch (error) {
        console.error("Access check error:", error);
        setAccessCheck({
          isLoading: false,
          hasAccess: false,
          error: "Failed to check access permissions"
        });
      }
    };

    checkAccess();
  }, [isAuthenticated, isLoading, user, pageName]);

  // Show loading state while checking authentication
  if (isLoading || accessCheck.isLoading) {
    return (
      <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
        <div className="text-beaver-orange text-xl">Checking access...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Show access denied if user doesn't have permission
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            {accessCheck.error || accessCheck.message || "You don't have permission to access this page."}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Current Access Level: <span className="text-beaver-orange">{user?.accessLevel || "Unknown"}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-beaver-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show dispatcher authentication modal for 911 Dispatcher users
  if (user?.accessLevel === "911 Dispatcher" && pageName === "beaverpatch" && showDispatcherAuth) {
    return (
      <>
        <DispatcherAuthModal
          isOpen={showDispatcherAuth}
          onClose={() => setShowDispatcherAuth(false)}
          onSuccess={(sessionId, callTaker) => {
            setDispatcherSession({ sessionId, callTaker });
            setShowDispatcherAuth(false);
          }}
        />
        <div className="min-h-screen bg-beaver-dark flex items-center justify-center">
          <div className="text-center">
            <div className="text-beaver-orange text-xl mb-4">911 Dispatcher Authentication Required</div>
            <p className="text-gray-300">Please complete authentication to access BeaverPatch</p>
          </div>
        </div>
      </>
    );
  }

  // If dispatcher has authenticated, render children with session context
  return <>{children}</>;
}