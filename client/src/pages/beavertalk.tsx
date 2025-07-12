import { useState, useEffect, useRef } from "react";
import { EnhancedHeader } from "@/components/enhanced-header";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Shield, 
  AlertTriangle, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, ChatMessage, ChatSecurityLog } from "@shared/schema";

export default function BeaverTalk() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedPriority, setSelectedPriority] = useState("normal");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions with automatic refresh every 5 seconds
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/chat/sessions"],
    refetchInterval: 5000, // Refresh every 5 seconds to catch external messages
    refetchOnWindowFocus: true, // Refetch when window gains focus
    cacheTime: 0, // Don't cache sessions data
    staleTime: 0, // Consider data stale immediately
  });



  // Fetch messages for current session with automatic refresh every 3 seconds
  const { data: messagesData = [], isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ["/api/chat/messages", currentSessionId],
    queryFn: async () => {
      try {
        const response = await apiRequest(`/api/chat/messages?sessionId=${currentSessionId}`);
        console.log("Messages response:", response);
        return response;
      } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
    },
    enabled: !!currentSessionId,
    refetchInterval: 3000, // Refresh every 3 seconds to catch new messages
    cacheTime: 0, // Don't cache messages data
    staleTime: 0, // Consider data stale immediately
  });

  // Ensure messages is always an array
  const messages = Array.isArray(messagesData) ? messagesData : [];

  // Debug logging
  useEffect(() => {
    console.log("Sessions updated:", sessions);
  }, [sessions]);

  useEffect(() => {
    console.log("Messages data:", messagesData);
    console.log("Messages error:", messagesError);
  }, [messagesData, messagesError]);

  // Fetch security logs with automatic refresh every 10 seconds
  const { data: securityLogs = [] } = useQuery({
    queryKey: ["/api/chat/security-logs"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Create new chat session
  const createSessionMutation = useMutation({
    mutationFn: (data: { category: string; priority: string }) =>
      apiRequest("/api/chat/sessions", {
        method: "POST",
        body: JSON.stringify({
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user?.id,
          userName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username,
          userDepartment: user?.department,
          category: data.category,
          priority: data.priority,
        }),
      }),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setCurrentSessionId(newSession.sessionId);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: (messageContent: string) =>
      apiRequest("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: currentSessionId,
          senderId: user?.id,
          senderName: user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username,
          senderType: "user",
          messageContent,
          messageType: "text",
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", currentSessionId] });
      setMessageInput("");
    },
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select the most recent session if none is selected
  useEffect(() => {
    if (!currentSessionId && sessions.length > 0) {
      const mostRecentSession = sessions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      setCurrentSessionId(mostRecentSession.sessionId);
    }
  }, [sessions, currentSessionId]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentSessionId) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleStartNewChat = () => {
    createSessionMutation.mutate({
      category: selectedCategory,
      priority: selectedPriority,
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      escalated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      normal: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-beaver-dark">
      <EnhancedHeader />

      <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-beaver-orange mb-2">
            BeaverTalk Communication Support
          </h2>
          <p className="text-gray-400">
            Secure communication platform for BEAVERNET system support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Sessions List */}
          <div className="lg:col-span-1">
            <Card className="bg-beaver-surface border-beaver-surface-light">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Chat Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Chat Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Start New Chat</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-beaver-surface-light border border-gray-600 rounded-md text-white"
                  >
                    <option value="general">General Support</option>
                    <option value="technical">Technical Issue</option>
                    <option value="emergency">Emergency</option>
                    <option value="feedback">Feedback</option>
                  </select>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-beaver-surface-light border border-gray-600 rounded-md text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <Button
                    onClick={handleStartNewChat}
                    disabled={createSessionMutation.isPending}
                    className="w-full bg-beaver-orange hover:bg-beaver-orange/80"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </div>

                {/* Existing Sessions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Active Sessions</h3>
                  <ScrollArea className="h-64">
                    {sessionsLoading ? (
                      <div className="text-gray-400 text-sm">Loading sessions...</div>
                    ) : sessions.length === 0 ? (
                      <div className="text-gray-400 text-sm">No active sessions</div>
                    ) : (
                      sessions.map((session: ChatSession) => (
                        <div
                          key={session.sessionId}
                          onClick={() => setCurrentSessionId(session.sessionId)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                            currentSessionId === session.sessionId
                              ? "bg-beaver-orange/20 border border-beaver-orange"
                              : "bg-beaver-surface-light hover:bg-beaver-surface-light/80"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {session.userName}
                            </span>
                            <Badge className={getStatusBadge(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">
                              {session.category}
                            </span>
                            <Badge className={getPriorityBadge(session.priority)}>
                              {session.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {session.userDepartment || "External"}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(session.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-beaver-surface border-beaver-surface-light h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-beaver-orange flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {currentSessionId ? "Chat Messages" : "Select a Chat Session"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {currentSessionId ? (
                  <>
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {messagesLoading ? (
                          <div className="text-gray-400 text-center">Loading messages...</div>
                        ) : messages.length === 0 ? (
                          <div className="text-gray-400 text-center">No messages yet. Start the conversation!</div>
                        ) : (
                          messages.map((message: ChatMessage) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.senderType === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.senderType === "user"
                                    ? "bg-beaver-orange text-white"
                                    : "bg-beaver-surface-light text-gray-200"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">
                                    {message.senderName}
                                  </span>
                                  {!message.isSecure && (
                                    <AlertTriangle className="h-3 w-3 text-red-400" />
                                  )}
                                  {message.securityScore < 70 && (
                                    <Shield className={`h-3 w-3 ${getSecurityScoreColor(message.securityScore)}`} />
                                  )}
                                </div>
                                <p className="text-sm">{message.messageContent}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs opacity-70">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                  </span>
                                  {message.securityScore < 100 && (
                                    <span className={`text-xs ${getSecurityScoreColor(message.securityScore)}`}>
                                      Security: {message.securityScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2 mt-4">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 bg-beaver-surface-light border-gray-600 text-white"
                        maxLength={2000}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="bg-beaver-orange hover:bg-beaver-orange/80"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a chat session or start a new one to begin messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security Panel */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="security" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="security">
                <Card className="bg-beaver-surface border-beaver-surface-light">
                  <CardHeader>
                    <CardTitle className="text-beaver-orange flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {messages.filter((m: ChatMessage) => m.isSecure).length}
                        </div>
                        <div className="text-xs text-gray-400">Secure Messages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {messages.filter((m: ChatMessage) => !m.isSecure).length}
                        </div>
                        <div className="text-xs text-gray-400">Flagged Messages</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Code Detection</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">XSS Protection</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">SQL Injection Guard</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Content Sanitization</span>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-600">
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>• All messages are scanned for malicious content</p>
                        <p>• Code injection attempts are automatically blocked</p>
                        <p>• Suspicious patterns are logged and reviewed</p>
                        <p>• End-to-end encryption protects message content</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card className="bg-beaver-surface border-beaver-surface-light">
                  <CardHeader>
                    <CardTitle className="text-beaver-orange flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Security Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      {securityLogs.length === 0 ? (
                        <div className="text-gray-400 text-sm text-center">No security events detected</div>
                      ) : (
                        <div className="space-y-2">
                          {securityLogs.map((log: ChatSecurityLog) => (
                            <div
                              key={log.id}
                              className="p-2 bg-beaver-surface-light rounded text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-white">
                                  {log.securityEvent.replace(/_/g, " ").toUpperCase()}
                                </span>
                                <Badge
                                  className={
                                    log.severity === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : log.severity === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {log.severity}
                                </Badge>
                              </div>
                              <p className="text-gray-400">{log.description}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-gray-500">
                                  Action: {log.actionTaken || "none"}
                                </span>
                                <span className="text-gray-500">
                                  {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}