import { useState } from "react";
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
  Phone,
  MapPin,
  ChevronRight,
  Menu,
  Search,
  X,
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  saveUsername: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

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
    onSuccess: () => {
      toast({
        title: "Sign On Successful",
        description: "Welcome back to your account.",
      });
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              data-testid="link-atm-locations"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">ATMs/Locations</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              data-testid="link-contact"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Contact Us</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              data-testid="link-help"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </a>
            <button
              className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-12 h-12 bg-primary rounded-md flex items-center justify-center"
                data-testid="img-logo"
              >
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground tracking-tight">
                  SecureBank
                </span>
                <span className="text-xs text-muted-foreground">
                  Online Banking
                </span>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {[
                "Personal",
                "Small Business",
                "Commercial",
                "Corporate",
                "Investing",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-foreground font-medium hover:text-primary transition-colors"
                  data-testid={`link-nav-${item.toLowerCase().replace(" ", "-")}`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t border-border pt-4 flex flex-col gap-3">
              {[
                "Personal",
                "Small Business",
                "Commercial",
                "Corporate",
                "Investing",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-foreground font-medium hover:text-primary transition-colors py-2"
                  data-testid={`link-mobile-nav-${item.toLowerCase().replace(" ", "-")}`}
                >
                  {item}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Sign On Card */}
            <Card className="shadow-lg border-border" data-testid="card-login">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <h1
                    className="text-2xl font-bold text-foreground"
                    data-testid="text-login-title"
                  >
                    Sign On
                  </h1>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your username"
                              className="h-11"
                              data-testid="input-username"
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
                          <FormLabel className="text-foreground font-medium">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="h-11 pr-10"
                                data-testid="input-password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
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
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-save-username"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-muted-foreground font-normal cursor-pointer !mt-0">
                            Save Username
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold"
                      disabled={loginMutation.isPending}
                      data-testid="button-sign-on"
                    >
                      {loginMutation.isPending ? "Signing On..." : "Sign On"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <a
                    href="#"
                    className="flex items-center text-primary hover:underline text-sm font-medium"
                    data-testid="link-forgot-password"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Forgot Password?
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-primary hover:underline text-sm font-medium"
                    data-testid="link-forgot-username"
                  >
                    <ChevronRight className="w-4 h-4" />
                    Forgot Username?
                  </a>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-md">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p
                        className="text-sm font-medium text-foreground"
                        data-testid="text-security-title"
                      >
                        Security Center
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your security is our priority. Learn how we protect
                        your accounts and what you can do to stay safe online.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right side content */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-6 lg:p-8 border border-secondary/30">
                <h2
                  className="text-xl font-bold text-foreground mb-3"
                  data-testid="text-enroll-title"
                >
                  New to Online Banking?
                </h2>
                <p className="text-muted-foreground mb-4">
                  Enroll now to access your accounts anytime, anywhere. It only
                  takes a few minutes.
                </p>
                <Button variant="outline" data-testid="button-enroll">
                  Enroll Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4" data-testid="text-quick-links">
                    Quick Links
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Open an Account",
                      "Credit Card Offers",
                      "Mortgage Rates",
                      "Auto Loans",
                      "Personal Loans",
                    ].map((link) => (
                      <a
                        key={link}
                        href="#"
                        className="flex items-center text-primary hover:underline text-sm"
                        data-testid={`link-quick-${link.toLowerCase().replace(/ /g, "-")}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                        {link}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-8 h-8 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1" data-testid="text-need-help">
                        Need Help?
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Our support team is available 24/7
                      </p>
                      <p className="text-lg font-bold text-primary">
                        1-800-555-BANK
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm" data-testid="text-footer-products">
                Products
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-checking">
                    Checking
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-savings">
                    Savings
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-credit-cards">
                    Credit Cards
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-loans">
                    Loans
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm" data-testid="text-footer-resources">
                Resources
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-faqs">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-security-center">
                    Security Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-privacy-policy">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-terms">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm" data-testid="text-footer-about">
                About Us
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-company-info">
                    Company Info
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-careers">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-investors">
                    Investor Relations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-newsroom">
                    Newsroom
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm" data-testid="text-footer-contact">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-customer-service">
                    Customer Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-find-branch">
                    Find a Branch
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-schedule">
                    Schedule Appointment
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground" data-testid="link-footer-feedback">
                    Feedback
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <p data-testid="text-copyright">
                &copy; 2024 SecureBank. All rights reserved. Member FDIC. Equal
                Housing Lender.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground" data-testid="link-accessibility">
                  Accessibility
                </a>
                <a href="#" className="hover:text-foreground" data-testid="link-privacy">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground" data-testid="link-security">
                  Security
                </a>
                <a href="#" className="hover:text-foreground" data-testid="link-sitemap">
                  Sitemap
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
