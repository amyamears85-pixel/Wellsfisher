import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

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
      balance: "$2,543.78",
      available: "$2,543.78",
      icon: CreditCard,
    },
    {
      type: "Savings",
      name: "WAY2SAVE SAVINGS",
      number: "...8901",
      balance: "$15,892.45",
      available: "$15,892.45",
      icon: PiggyBank,
    },
    {
      type: "Credit Card",
      name: "ACTIVE CASH CARD",
      number: "...2345",
      balance: "-$1,234.56",
      available: "$8,765.44",
      icon: CreditCard,
    },
  ];

  const quickActions = [
    { icon: Send, label: "Transfer & Pay" },
    { icon: FileText, label: "Statements" },
    { icon: TrendingUp, label: "Investing" },
    { icon: Settings, label: "Settings" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#d71e28]" />
      </div>
    );
  }

  if (error || !authData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Red header bar */}
      <header className="bg-[#d71e28] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <span
              className="text-lg font-bold tracking-wide"
              data-testid="text-logo"
            >
              WELLS FARGO
            </span>

            <nav className="flex items-center gap-4">
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                data-testid="button-profile"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="bg-[#ffcd41] h-1"></div>

      {/* Main content */}
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Welcome section */}
          <div className="mb-6">
            <h1
              className="text-2xl font-semibold text-gray-800"
              data-testid="text-welcome"
            >
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Last signed on: January 26, 2026 at 12:30 PM ET
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#d71e28] hover:shadow-sm transition-all"
                data-testid={`button-action-${action.label.toLowerCase().replace(/ /g, "-")}`}
              >
                <div className="w-10 h-10 bg-[#d71e28]/10 rounded-full flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-[#d71e28]" />
                </div>
                <span className="text-xs text-gray-700 font-medium text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Accounts section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-semibold text-gray-800"
                data-testid="text-accounts-title"
              >
                Your Accounts
              </h2>
              <a
                href="#"
                className="text-[#d71e28] text-sm hover:underline flex items-center gap-1"
                data-testid="link-view-all"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-3">
              {accounts.map((account, index) => (
                <Card
                  key={index}
                  className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`card-account-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <account.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 uppercase">
                          {account.type}
                        </p>
                        <p className="font-medium text-gray-800">
                          {account.name}
                        </p>
                        <p className="text-xs text-gray-400">{account.number}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            account.balance.startsWith("-")
                              ? "text-red-600"
                              : "text-gray-800"
                          }`}
                        >
                          {account.balance}
                        </p>
                        <p className="text-xs text-gray-500">
                          Available: {account.available}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security reminder */}
          <Card className="border-[#ffcd41] bg-[#ffcd41]/10 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#ffcd41] rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-gray-800" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Security Reminder</p>
                  <p className="text-sm text-gray-600">
                    Wells Fargo will never ask for your password, PIN, or
                    one-time access code via email, text, or phone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign out button */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-full border-gray-300"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
            <a href="#" className="hover:underline" data-testid="link-security-center">
              Security Center
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline" data-testid="link-privacy-policy">
              Privacy Policy
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline" data-testid="link-terms">
              Terms of Use
            </a>
          </div>
          <p
            className="text-xs text-gray-500 text-center"
            data-testid="text-copyright"
          >
            © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801.
          </p>
        </div>
      </footer>
    </div>
  );
}
