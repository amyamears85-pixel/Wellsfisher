import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Shield, Lock, User, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function CredentialUpdate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateType, setUpdateType] = useState<"password" | "username" | "both" | null>(null);
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const handleSkip = () => {
    toast({
      title: "Reminder Set",
      description: "We'll remind you to update your credentials next time you sign in."
    });
    setLocation("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms to continue.",
        variant: "destructive"
      });
      return;
    }

    if (updateType === "password" || updateType === "both") {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "Please make sure your new passwords match.",
          variant: "destructive"
        });
        return;
      }
      if (formData.newPassword.length < 8) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 8 characters.",
          variant: "destructive"
        });
        return;
      }
    }

    if (updateType === "username" || updateType === "both") {
      if (formData.newUsername.length < 6) {
        toast({
          title: "Username Too Short",
          description: "Username must be at least 6 characters.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Credentials Updated",
      description: "Your security information has been updated successfully."
    });
    
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-[#d71e28] sticky top-0 z-20">
        <div className="h-1 bg-[#ffcd41]" />
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <button 
              onClick={() => setLocation("/dashboard")}
              className="text-white p-1"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-lg font-semibold">Security Update Required</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Card className="mb-6 border-l-4 border-l-[#ffcd41]">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[#ffcd41] flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">Important Security Notice</h2>
                <p className="text-sm text-gray-600">
                  To protect your account, we recommend updating your sign-in credentials periodically. 
                  This helps ensure your account remains secure and protected against unauthorized access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!updateType ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d71e28]" />
                What would you like to update?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => setUpdateType("password")}
                className="w-full flex items-center gap-4 p-4 border rounded-md hover-elevate text-left"
                data-testid="button-update-password"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#d71e28]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Update Password Only</p>
                  <p className="text-sm text-gray-500">Change your sign-in password</p>
                </div>
              </button>

              <button
                onClick={() => setUpdateType("username")}
                className="w-full flex items-center gap-4 p-4 border rounded-md hover-elevate text-left"
                data-testid="button-update-username"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#d71e28]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Update Username Only</p>
                  <p className="text-sm text-gray-500">Change your sign-in username</p>
                </div>
              </button>

              <button
                onClick={() => setUpdateType("both")}
                className="w-full flex items-center gap-4 p-4 border rounded-md hover-elevate text-left"
                data-testid="button-update-both"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#d71e28]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Update Both</p>
                  <p className="text-sm text-gray-500">Change username and password together</p>
                </div>
              </button>

              <div className="pt-4 border-t mt-4">
                <button
                  onClick={handleSkip}
                  className="w-full text-center text-sm text-[#d71e28] font-medium py-2"
                  data-testid="button-skip-update"
                >
                  Remind me later
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d71e28]" />
                {updateType === "password" && "Update Your Password"}
                {updateType === "username" && "Update Your Username"}
                {updateType === "both" && "Update Your Credentials"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                      data-testid="input-current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      data-testid="button-toggle-current-password"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {(updateType === "username" || updateType === "both") && (
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">New Username</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      value={formData.newUsername}
                      onChange={(e) => setFormData({ ...formData, newUsername: e.target.value })}
                      placeholder="Enter new username (min 6 characters)"
                      required
                      data-testid="input-new-username"
                    />
                    <p className="text-xs text-gray-500">Username must be at least 6 characters</p>
                  </div>
                )}

                {(updateType === "password" || updateType === "both") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          placeholder="Enter new password (min 8 characters)"
                          required
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          data-testid="button-toggle-new-password"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Re-enter new password"
                          required
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${formData.newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}`} />
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${/[A-Z]/.test(formData.newPassword) ? "text-green-600" : "text-gray-400"}`} />
                          One uppercase letter
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${/[0-9]/.test(formData.newPassword) ? "text-green-600" : "text-gray-400"}`} />
                          One number
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${/[!@#$%^&*]/.test(formData.newPassword) ? "text-green-600" : "text-gray-400"}`} />
                          One special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    data-testid="checkbox-agree-terms"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-snug">
                    I agree to the Wells Fargo Online Access Agreement and understand that this change will take effect immediately.
                  </Label>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#d71e28] hover:bg-[#b91c23]"
                    disabled={isSubmitting}
                    data-testid="button-submit-update"
                  >
                    {isSubmitting ? "Updating..." : "Update Credentials"}
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setUpdateType(null)}
                      data-testid="button-back-options"
                    >
                      Back
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="flex-1 text-[#d71e28]"
                      onClick={handleSkip}
                      data-testid="button-skip"
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Why update your credentials?</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Regularly changing passwords helps protect against unauthorized access</li>
                <li>• Strong, unique passwords keep your financial information secure</li>
                <li>• Updated usernames can prevent targeted phishing attempts</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            Wells Fargo Bank, N.A. Member FDIC. Equal Housing Lender.
          </p>
        </div>
      </footer>
    </div>
  );
}