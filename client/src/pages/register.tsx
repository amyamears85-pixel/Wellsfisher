import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";
import { OfficialHeader } from "@/components/official-header";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().length(4, "Please enter the last 4 digits of your SSN"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", {
        username: data.username,
        password: data.password,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. Redirecting...",
      });
      setTimeout(() => {
        setLocation("/verify");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <OfficialHeader variant="simple" />

      {/* Main content */}
      <main
        className="flex-1 relative"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      >
        <div className="max-w-lg mx-auto px-4 py-8">
          <Card
            className="shadow-lg border-0 bg-white"
            data-testid="card-register"
          >
            <CardContent className="p-6 sm:p-8">
              <Link href="/">
                <button
                  className="flex items-center gap-2 text-[#cd1409] text-sm mb-4 hover:underline"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign On
                </button>
              </Link>

              <h1
                className="text-2xl text-gray-800 mb-2 font-semibold"
                data-testid="text-title"
              >
                Enroll in Online Banking
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                Create your account to access your finances online.
              </p>

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
                        <FormLabel className="text-gray-700">Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choose a username"
                            className="h-12 border-gray-300"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="h-12 border-gray-300"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(555) 555-5555"
                            className="h-12 border-gray-300"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-12 border-gray-300"
                            data-testid="input-dob"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ssn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Last 4 digits of SSN</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="XXXX"
                            maxLength={4}
                            className="h-12 border-gray-300"
                            data-testid="input-ssn"
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
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="h-12 border-gray-300 pr-10"
                              data-testid="input-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="h-12 border-gray-300"
                            data-testid="input-confirm-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-700 font-medium mb-2">Password requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        At least 6 characters
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#cd1409] hover:bg-[#b81208] rounded-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/"
                    className="text-[#cd1409] hover:underline"
                    data-testid="link-sign-on"
                  >
                    Sign On
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
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
