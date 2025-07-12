import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Shield, 
  AlertTriangle,
  Users,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, ChatMessage } from "@shared/schema";

interface ChatOverlayProps {
  isVisible?: boolean;
}

export function ChatOverlay({ isVisible = true }: ChatOverlayProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [selectedPriority, setSelectedPriority] = useState("normal");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch active session or create new one
  const { data: sessions = [] } = useQuery({
    queryKey: ["/api/chat/sessions"],
    enabled: isOpen,
  });

  // Get the most recent active session for this user
  const activeSession = sessions.find((session: ChatSession) => 
    session.userId === user?.id && session.status === "active"
  );

  // Set current session when overlay opens
  useEffect(() => {
    if (isOpen && activeSession && !currentSessionId) {
      setCurrentSessionId(activeSession.sessionId);
    }
  }, [isOpen, activeSession, currentSessionId]);

  // Fetch messages for current session
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages", currentSessionId],
    enabled: !!currentSessionId,
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

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (!currentSessionId) {
      // Create new session first
      createSessionMutation.mutate({
        category: selectedCategory,
        priority: selectedPriority,
      });
      // Message will be sent after session is created
      return;
    }
    
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleStartNewChat = () => {
    createSessionMutation.mutate({
      category: selectedCategory,
      priority: selectedPriority,
    });
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-beaver-orange hover:bg-beaver-orange/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Open BeaverTalk Support Chat"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
          {/* Notification badge if there are unread messages */}
          {activeSession && messages.length > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{messages.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] flex flex-col">
          <Card className="bg-beaver-surface border-beaver-surface-light shadow-2xl h-full flex flex-col">
            {/* Header */}
            <CardHeader className="bg-beaver-orange text-white rounded-t-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  BeaverTalk Support
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {activeSession && (
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Badge className="bg-white/20 text-white">
                    {activeSession.category}
                  </Badge>
                  <Badge className="bg-white/20 text-white">
                    {activeSession.priority}
                  </Badge>
                </div>
              )}
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {currentSessionId ? (
                  <>
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-gray-400 text-center py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Welcome to BeaverTalk Support!</p>
                            <p className="text-sm">Start the conversation below.</p>
                          </div>
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
                                      {message.securityScore}%
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
                    <div className="p-4 border-t border-beaver-surface-light">
                      <div className="flex gap-2">
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
                    </div>
                  </>
                ) : (
                  /* New Chat Setup */
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="text-center mb-6">
                      <Users className="h-12 w-12 mx-auto mb-4 text-beaver-orange" />
                      <h3 className="text-lg font-medium text-white mb-2">Start Support Chat</h3>
                      <p className="text-gray-400 text-sm">
                        Get help with BEAVERNET system features and technical support
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Category
                        </label>
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
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Priority
                        </label>
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
                      </div>

                      <Button
                        onClick={handleStartNewChat}
                        disabled={createSessionMutation.isPending}
                        className="w-full bg-beaver-orange hover:bg-beaver-orange/80"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat Session
                      </Button>
                    </div>

                    <div className="mt-6 p-3 bg-beaver-surface-light rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-white">Security Features</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>• Automatic content filtering and analysis</p>
                        <p>• Real-time threat detection and blocking</p>
                        <p>• End-to-end message encryption</p>
                        <p>• Complete audit logging for compliance</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}