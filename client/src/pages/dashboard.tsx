import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Send,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  User,
  Loader2,
  Eye,
  EyeOff,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  Smartphone,
  Building,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Receipt,
  Wallet,
  Home,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MobileMenu } from "@/components/mobile-menu";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(0);

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (error) {
      setLocation("/");
    }
  }, [error, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      setLocation("/");
    },
  });

  const accounts = [
    {
      type: "Checking",
      name: "EVERYDAY CHECKING",
      number: "...4567",
      routingNumber: "121000248",
      balance: 2543.78,
      available: 2543.78,
      pending: 0,
      icon: Wallet,
      color: "#1e40af",
    },
    {
      type: "Savings",
      name: "WAY2SAVE SAVINGS",
      number: "...8901",
      routingNumber: "121000248",
      balance: 15892.45,
      available: 15892.45,
      pending: 0,
      icon: PiggyBank,
      color: "#059669",
    },
    {
      type: "Credit Card",
      name: "ACTIVE CASH CARD",
      number: "...2345",
      routingNumber: "",
      balance: -1234.56,
      available: 8765.44,
      creditLimit: 10000,
      pending: -45.99,
      icon: CreditCard,
      color: "#d71e28",
    },
    {
      type: "Home Mortgage",
      name: "HOME MORTGAGE",
      number: "...7890",
      routingNumber: "",
      balance: -287543.21,
      available: 0,
      icon: Home,
      color: "#7c3aed",
    },
  ];

  const recentTransactions = [
    { id: 1, name: "AMAZON.COM", amount: -127.45, date: "Jan 26", type: "debit", category: "Shopping", pending: false },
    { id: 2, name: "DIRECT DEPOSIT - EMPLOYER", amount: 2847.32, date: "Jan 25", type: "credit", category: "Income", pending: false },
    { id: 3, name: "NETFLIX.COM", amount: -15.99, date: "Jan 24", type: "debit", category: "Entertainment", pending: false },
    { id: 4, name: "STARBUCKS", amount: -6.45, date: "Jan 24", type: "debit", category: "Food & Drink", pending: true },
    { id: 5, name: "TRANSFER TO SAVINGS", amount: -500.00, date: "Jan 23", type: "transfer", category: "Transfer", pending: false },
    { id: 6, name: "WHOLE FOODS", amount: -89.23, date: "Jan 22", type: "debit", category: "Groceries", pending: false },
    { id: 7, name: "GAS STATION", amount: -45.67, date: "Jan 21", type: "debit", category: "Auto", pending: false },
  ];

  const quickActions = [
    { icon: Send, label: "Transfer", desc: "Move money", href: null },
    { icon: Receipt, label: "Pay Bills", desc: "Manage payments", href: null },
    { icon: Smartphone, label: "Zelle", desc: "Send & receive", href: null },
    { icon: DollarSign, label: "Deposit", desc: "Mobile deposit", href: null },
  ];

  const alerts = [
    { type: "info", message: "Your statement is ready to view", action: "View Statement" },
    { type: "security", message: "Set up two-factor authentication for added security", action: "Set Up" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount));
  };

  const getLastLogin = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#d71e28] mx-auto mb-4" />
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  if (error || !authData) {
    return null;
  }

  const selectedAccountData = accounts[selectedAccount];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-[#d71e28] text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span
                className="text-xl font-bold tracking-wide cursor-pointer"
                style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
                data-testid="text-logo"
              >
                WELLS FARGO
              </span>
            </Link>

            <nav className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
                data-testid="button-notifications"
                onClick={() => toast({ title: "Notifications", description: "You have 2 unread notifications" })}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffcd41] rounded-full"></span>
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                data-testid="button-profile"
                onClick={() => setLocation("/settings")}
              >
                <User className="w-5 h-5" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <MobileMenu />
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-1"></div>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {["Accounts", "Transfer & Pay", "Plan & Learn", "Security", "Messages"].map((item, i) => (
              <button
                key={item}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  i === 0 ? "text-[#d71e28] border-b-2 border-[#d71e28]" : "text-gray-600 hover:text-[#d71e28]"
                }`}
                data-testid={`nav-${item.toLowerCase().replace(/ & /g, "-")}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900" data-testid="text-welcome">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last sign on: {getLastLogin()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalances(!showBalances)}
                  className="text-gray-600"
                  data-testid="button-toggle-balances"
                >
                  {showBalances ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showBalances ? "Hide" : "Show"} Balances
                </Button>
              </div>

              {alerts.length > 0 && (
                <div className="space-y-2 mb-4">
                  {alerts.map((alert, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        alert.type === "security" ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {alert.type === "security" ? (
                          <Shield className="w-4 h-4 text-blue-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-700">{alert.message}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#d71e28] text-xs">
                        {alert.action}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => toast({ title: action.label, description: `${action.desc} - Feature coming soon` })}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#d71e28] hover:shadow-sm transition-all"
                    data-testid={`button-action-${action.label.toLowerCase()}`}
                  >
                    <div className="w-10 h-10 bg-[#d71e28]/10 rounded-full flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-[#d71e28]" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-800 block">{action.label}</span>
                      <span className="text-xs text-gray-500">{action.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Card className="mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Your Accounts</CardTitle>
                    <button className="text-[#d71e28] text-sm font-medium hover:underline flex items-center gap-1">
                      Open new account
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {accounts.map((account, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAccount(index)}
                      className={`w-full flex items-center gap-4 p-4 text-left border-b last:border-0 transition-colors ${
                        selectedAccount === index ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                      data-testid={`account-${index}`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}15` }}
                      >
                        <account.icon className="w-6 h-6" style={{ color: account.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{account.name}</p>
                        <p className="text-xs text-gray-500">{account.type} {account.number}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${account.balance < 0 ? "text-red-600" : "text-gray-900"}`}>
                          {showBalances ? (account.balance < 0 ? "-" : "") + formatCurrency(account.balance) : "••••••"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.type === "Credit Card" ? "Current Balance" : "Available"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-[#d71e28] text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <button className="text-[#d71e28] text-sm font-medium hover:underline flex items-center gap-1">
                        See all
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                      data-testid={`transaction-${tx.id}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "credit" ? "bg-green-100" : tx.type === "transfer" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : tx.type === "transfer" ? (
                          <Send className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm truncate">{tx.name}</p>
                          {tx.pending && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{tx.date} • {tx.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.amount > 0 ? "text-green-600" : "text-gray-900"}`}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:w-80 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Account Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account</span>
                      <span className="font-medium">{selectedAccountData.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Number</span>
                      <span className="font-medium">{selectedAccountData.number}</span>
                    </div>
                    {selectedAccountData.routingNumber && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Routing Number</span>
                        <span className="font-medium">{selectedAccountData.routingNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Balance</span>
                      <span className={`font-semibold ${selectedAccountData.balance < 0 ? "text-red-600" : ""}`}>
                        {showBalances ? (selectedAccountData.balance < 0 ? "-" : "") + formatCurrency(selectedAccountData.balance) : "••••••"}
                      </span>
                    </div>
                    {selectedAccountData.type === "Credit Card" && selectedAccountData.creditLimit && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available Credit</span>
                          <span className="font-medium">{showBalances ? formatCurrency(selectedAccountData.available) : "••••••"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Credit Limit</span>
                          <span className="font-medium">{formatCurrency(selectedAccountData.creditLimit)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { icon: FileText, label: "Statements & Documents", href: null },
                    { icon: Settings, label: "Account Settings", href: "/settings" },
                    { icon: Shield, label: "Security Center", href: "/security" },
                    { icon: MapPin, label: "Find ATM/Branch", href: "/locations" },
                    { icon: Phone, label: "Contact Us", href: "/contact" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href || "#"}>
                      <button
                        onClick={() => !link.href && toast({ title: link.label, description: "Feature coming soon" })}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 border-b last:border-0"
                        data-testid={`link-${link.label.toLowerCase().replace(/ /g, "-")}`}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#d71e28] text-white">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-8 h-8 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Mobile Banking</p>
                      <p className="text-sm text-white/80 mb-3">
                        Manage your accounts on the go with our mobile app
                      </p>
                      <Button variant="secondary" size="sm" className="bg-white text-[#d71e28] hover:bg-gray-100">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/security" className="hover:text-[#d71e28]">Security</Link>
              <Link href="/help" className="hover:text-[#d71e28]">Privacy</Link>
              <Link href="/contact" className="hover:text-[#d71e28]">Contact</Link>
              <span>Sitemap</span>
            </div>
            <p className="text-xs text-gray-400">
              © 2024 Wells Fargo. All rights reserved. Member FDIC. NMLSR ID 399801
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}