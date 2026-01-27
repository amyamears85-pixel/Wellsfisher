import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ChevronRight, Lock, Eye, AlertTriangle, CheckCircle2, Bell, Smartphone, Mail, Key, Fingerprint, AlertCircle, Phone, UserX, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { OfficialHeader } from "@/components/official-header";

const securityAlerts = [
  { id: 1, type: "info", title: "Security Update Available", message: "A new security update is available for the Wells Fargo Mobile app.", date: "Today", read: false },
  { id: 2, type: "success", title: "Password Changed Successfully", message: "Your online banking password was changed on January 25, 2026.", date: "Yesterday", read: true },
  { id: 3, type: "warning", title: "New Device Sign-In", message: "Your account was accessed from a new device in San Francisco, CA.", date: "Jan 20", read: true },
];

const securityFeatures = [
  { name: "Two-Factor Authentication", desc: "Extra security for sign-in", icon: Smartphone, enabled: true, recommended: true },
  { name: "Sign-In Notifications", desc: "Get alerts when you sign in", icon: Bell, enabled: true, recommended: true },
  { name: "Transaction Alerts", desc: "Notifications for account activity", icon: AlertCircle, enabled: true, recommended: true },
  { name: "Biometric Login", desc: "Use fingerprint or face recognition", icon: Fingerprint, enabled: false, recommended: true },
  { name: "Card Lock", desc: "Temporarily lock your debit card", icon: Lock, enabled: false, recommended: false },
];

const securityTips = [
  { title: "Use Strong Passwords", desc: "Create unique passwords with letters, numbers, and symbols. Never reuse passwords across sites." },
  { title: "Enable Two-Factor Authentication", desc: "Add an extra layer of security by requiring a code from your phone to sign in." },
  { title: "Monitor Your Accounts", desc: "Regularly check your accounts for unauthorized transactions and set up alerts." },
  { title: "Be Wary of Phishing", desc: "Wells Fargo will never ask for your password or PIN via email, text, or phone." },
  { title: "Keep Software Updated", desc: "Always update your devices and apps to protect against security vulnerabilities." },
  { title: "Use Secure Networks", desc: "Avoid accessing your bank accounts on public Wi-Fi. Use your mobile data instead." },
];

const fraudTypes = [
  { title: "Phishing Emails", desc: "Fake emails pretending to be from Wells Fargo asking for personal information.", icon: Mail },
  { title: "Phone Scams", desc: "Callers claiming to be bank employees requesting account details.", icon: Phone },
  { title: "Card Skimming", desc: "Devices placed on ATMs or card readers to steal card information.", icon: CreditCard },
  { title: "Identity Theft", desc: "Criminals using your personal information to open accounts.", icon: UserX },
];

export default function SecurityPage() {
  const { toast } = useToast();
  const [features, setFeatures] = useState(securityFeatures);

  const toggleFeature = (index: number) => {
    const updated = [...features];
    updated[index].enabled = !updated[index].enabled;
    setFeatures(updated);
    toast({
      title: updated[index].enabled ? "Feature Enabled" : "Feature Disabled",
      description: `${updated[index].name} has been ${updated[index].enabled ? "enabled" : "disabled"}.`,
    });
  };

  const securityScore = Math.round((features.filter(f => f.enabled).length / features.length) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <OfficialHeader variant="simple" />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Security Score */}
        <Card className="bg-gradient-to-r from-[#1a472a] to-[#2d6a4f] text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Your Security Score</h2>
                <p className="text-white/80 text-sm">Based on enabled security features</p>
              </div>
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="40" fill="none" stroke="#ffcd41" strokeWidth="8"
                    strokeDasharray={`${securityScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{securityScore}%</span>
                </div>
              </div>
            </div>
            {securityScore < 100 && (
              <div className="mt-4 flex items-center gap-2 text-[#ffcd41] text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Enable all features for maximum protection</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#cd1409]" />
              Recent Security Alerts
            </CardTitle>
            <Badge variant="outline">{securityAlerts.filter(a => !a.read).length} new</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {securityAlerts.map((alert, i) => (
              <div
                key={alert.id}
                className={`flex items-start gap-4 p-4 border-b last:border-0 ${!alert.read ? "bg-blue-50/50" : ""}`}
                data-testid={`alert-${alert.id}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  alert.type === "warning" ? "bg-yellow-100" : 
                  alert.type === "success" ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {alert.type === "warning" ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> :
                   alert.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                   <Bell className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    {!alert.read && <span className="w-2 h-2 bg-[#cd1409] rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#cd1409]" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {features.map((feature, i) => (
              <div
                key={feature.name}
                className="flex items-center justify-between p-4 border-b last:border-0"
                data-testid={`feature-${feature.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    feature.enabled ? "bg-green-100" : "bg-gray-100"
                  }`}>
                    <feature.icon className={`w-5 h-5 ${feature.enabled ? "text-green-600" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{feature.name}</p>
                      {feature.recommended && !feature.enabled && (
                        <Badge variant="outline" className="text-[#cd1409] border-[#cd1409] text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(i)}
                  data-testid={`switch-${feature.name.toLowerCase().replace(/\s+/g, "-")}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="hover-elevate cursor-pointer" data-testid="card-change-password">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#cd1409]/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-[#cd1409]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your sign-in credentials</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" data-testid="card-manage-devices">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#cd1409]/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-[#cd1409]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Manage Devices</p>
                <p className="text-sm text-gray-500">View and remove trusted devices</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        {/* Fraud Prevention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#cd1409]" />
              Recognize & Report Fraud
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {fraudTypes.map((fraud, i) => (
                <div 
                  key={fraud.title}
                  className={`p-4 ${i % 2 === 0 ? "md:border-r" : ""} ${i < 2 ? "border-b" : ""}`}
                  data-testid={`fraud-${fraud.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <fraud.icon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{fraud.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{fraud.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600 mb-3">
                If you suspect fraud on your account, contact us immediately.
              </p>
              <a href="tel:1-800-869-3557">
                <Button variant="outline" className="border-[#cd1409] text-[#cd1409]" data-testid="button-report-fraud">
                  <Phone className="w-4 h-4 mr-2" />
                  Report Fraud: 1-800-869-3557
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#cd1409]" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible>
              {securityTips.map((tip, i) => (
                <AccordionItem key={i} value={`tip-${i}`} className="border-b last:border-0">
                  <AccordionTrigger className="px-4 text-left text-sm font-medium" data-testid={`tip-${i}`}>
                    {tip.title}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-sm text-gray-600">
                    {tip.desc}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
