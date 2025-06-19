import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

interface AiChatProps {
  assessmentId?: number;
}

export default function AiChat({ assessmentId }: AiChatProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", assessmentId],
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      setIsTyping(true);
      const response = await apiRequest("POST", "/api/chat", {
        message: messageText,
        assessmentId,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Add initial welcome message if no messages exist
  const displayMessages = messages.length === 0 ? [
    {
      id: 0,
      message: "Hello! I'm your AI solar assistant. I can help you understand solar benefits, costs, financing options, and guide you through the process. What would you like to know?",
      isUser: false,
      timestamp: new Date().toISOString(),
      assessmentId: null,
    }
  ] : messages;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center">
          <Bot className="mr-2" size={20} />
          AI Solar Assistant
        </CardTitle>
        <p className="text-sm text-blue-100">Ask me anything about solar energy!</p>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages */}
        <ScrollArea className="h-64 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {displayMessages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-2">
                <div className={`p-2 rounded-full ${msg.isUser ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  {msg.isUser ? (
                    <User className="text-orange-600 text-xs" size={12} />
                  ) : (
                    <Bot className="text-blue-600 text-xs" size={12} />
                  )}
                </div>
                <div className="bg-gray-100 rounded-xl p-3 flex-1 max-w-[80%]">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Bot className="text-blue-600 text-xs" size={12} />
                </div>
                <div className="bg-gray-100 rounded-xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about solar benefits, costs..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
