import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Users,
  Send,
  Webhook,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  MessageSquare,
  Shield,
  User,
  Hash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BotStatusData {
  connected: boolean;
  bot: {
    username: string;
    firstName: string;
    id: number;
  } | null;
  chatId: string | null;
  subscriberCount: number;
  subscribers: Array<{
    id: string;
    chatId: string;
    username: string | null;
    firstName: string | null;
    isActive: string;
  }>;
}

interface WebhookResult {
  success?: boolean;
  message?: string;
  webhookUrl?: string;
  error?: string;
}

export default function BotNotificationsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery<BotStatusData>({
    queryKey: ["/api/telegram/status", adminKey],
    queryFn: async () => {
      const response = await fetch(`/api/telegram/status?key=${encodeURIComponent(adminKey)}`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Invalid admin key");
        }
        throw new Error("Failed to fetch bot status");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/telegram/test?key=${encodeURIComponent(adminKey)}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to send test");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Test notification sent successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to send test notification", variant: "destructive" });
    },
  });

  const webhookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/telegram/setup-webhook`);
      if (!response.ok) throw new Error("Failed to set webhook");
      return response.json() as Promise<WebhookResult>;
    },
    onSuccess: (result: WebhookResult) => {
      if (result.success) {
        toast({ title: "Webhook configured successfully!", description: result.webhookUrl });
        queryClient.invalidateQueries({ queryKey: ["/api/telegram/status"] });
      } else {
        toast({ title: "Webhook setup failed", description: result.error, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Failed to configure webhook", variant: "destructive" });
    },
  });

  const handleAuthenticate = () => {
    if (!adminKey.trim()) {
      setError("Please enter the admin key");
      return;
    }
    setError("");
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Bot Notifications</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Enter admin key to access the bot panel</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                className="bg-gray-800 border-gray-700 text-white pr-10"
                data-testid="input-admin-key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleAuthenticate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-authenticate"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bot Notifications</h1>
              <p className="text-gray-400 text-xs">Telegram integration panel</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-900 rounded-xl animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${data?.connected ? "bg-green-900" : "bg-red-900"}`}>
                      {data?.connected ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Bot Status</p>
                      <p className={`text-lg font-bold ${data?.connected ? "text-green-400" : "text-red-400"}`}>
                        {data?.connected ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Bot Name</p>
                      <p className="text-lg font-bold text-white">
                        {data?.bot ? `@${data.bot.username}` : "—"}
                      </p>
                      {data?.bot && (
                        <p className="text-gray-400 text-xs">{data.bot.firstName}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-900 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Subscribers</p>
                      <p className="text-lg font-bold text-white">{data?.subscriberCount ?? 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-blue-400" />
                    Webhook Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Set up the webhook so Telegram sends messages directly to this server for real-time processing.
                  </p>
                  {data?.chatId && (
                    <div className="bg-gray-800 rounded-lg p-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-gray-400 text-xs">Chat ID</p>
                        <p className="text-white text-sm font-mono">{data.chatId}</p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => webhookMutation.mutate()}
                    disabled={webhookMutation.isPending || !data?.connected}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-setup-webhook"
                  >
                    <Webhook className="w-4 h-4 mr-2" />
                    {webhookMutation.isPending ? "Setting up..." : "Setup Webhook"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-yellow-400" />
                    Test Notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Send a test message to verify the bot is correctly configured and delivering notifications.
                  </p>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Will send to</p>
                    <p className="text-white text-sm">
                      {(data?.subscriberCount ?? 0) > 0
                        ? `${data?.subscriberCount} subscriber(s) + main chat`
                        : data?.chatId
                        ? "Main chat ID"
                        : "No recipients configured"}
                    </p>
                  </div>
                  <Button
                    onClick={() => testMutation.mutate()}
                    disabled={testMutation.isPending || !data?.connected}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-test-notification"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {testMutation.isPending ? "Sending..." : "Send Test Notification"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Active Subscribers
                  <Badge className="ml-1 bg-purple-900 text-purple-300 text-xs">
                    {data?.subscriberCount ?? 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!data?.subscribers || data.subscribers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No subscribers yet</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Users can subscribe by sending /start to your bot
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.subscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
                        data-testid={`subscriber-row-${sub.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-300" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {sub.firstName || sub.username || "Unknown"}
                            </p>
                            {sub.username && (
                              <p className="text-gray-400 text-xs">@{sub.username}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs font-mono">{sub.chatId}</p>
                          <Badge className="mt-1 bg-green-900 text-green-400 text-xs">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
