import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, User, Bell, Lock, Smartphone, Globe, Eye, CreditCard, Mail, Phone, MapPin, Shield, FileText, HelpCircle, LogOut, Palette, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OfficialHeader } from "@/components/official-header";

const notificationSettings = [
  { id: "email_alerts", label: "Email Alerts", desc: "Receive account alerts via email", enabled: true },
  { id: "sms_alerts", label: "Text Message Alerts", desc: "Receive alerts via SMS", enabled: true },
  { id: "push_notifications", label: "Push Notifications", desc: "Receive app notifications", enabled: true },
  { id: "marketing", label: "Marketing Communications", desc: "Offers and promotional messages", enabled: false },
  { id: "statement_ready", label: "Statement Ready Alerts", desc: "Notify when statements are available", enabled: true },
  { id: "low_balance", label: "Low Balance Alerts", desc: "Alert when balance drops below threshold", enabled: true },
];

const privacySettings = [
  { id: "share_info", label: "Share Information with Affiliates", desc: "Allow sharing with Wells Fargo affiliates", enabled: true },
  { id: "personalized_ads", label: "Personalized Advertising", desc: "Show relevant product recommendations", enabled: false },
  { id: "analytics", label: "Usage Analytics", desc: "Help improve our services", enabled: true },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(notificationSettings);
  const [privacy, setPrivacy] = useState(privacySettings);
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("system");
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState("100");

  const toggleNotification = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, enabled: !n.enabled } : n
    ));
    toast({ title: "Settings Updated", description: "Your notification preferences have been saved." });
  };

  const togglePrivacy = (id: string) => {
    setPrivacy(privacy.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
    toast({ title: "Settings Updated", description: "Your privacy preferences have been saved." });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <OfficialHeader variant="simple" />

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-[#cd1409]" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Profile Information", desc: "Name, email, phone number", icon: User },
              { label: "Contact Preferences", desc: "How we reach you", icon: Mail },
              { label: "Mailing Address", desc: "Update your address", icon: MapPin },
              { label: "Linked Accounts", desc: "Manage connected accounts", icon: CreditCard },
            ].map((item, i) => (
              <button
                key={item.label}
                onClick={() => toast({ title: item.label, description: "Please sign in to access this feature." })}
                className="w-full flex items-center justify-between p-4 hover-elevate text-left border-b last:border-0"
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#cd1409]" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Change Password", desc: "Update your sign-in password", icon: Lock, href: null },
              { label: "Two-Factor Authentication", desc: "Add extra security", icon: Smartphone, href: null },
              { label: "Manage Devices", desc: "View trusted devices", icon: Smartphone, href: null },
              { label: "Security Center", desc: "Security features & alerts", icon: Shield, href: "/security" },
            ].map((item) => 
              item.href ? (
                <Link key={item.label} href={item.href}>
                  <button
                    className="w-full flex items-center justify-between p-4 hover-elevate text-left border-b last:border-0"
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => toast({ title: item.label, description: "Please sign in to access this feature." })}
                  className="w-full flex items-center justify-between p-4 hover-elevate text-left border-b last:border-0"
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#cd1409]" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={setting.id} className="font-medium">{setting.label}</Label>
                  <p className="text-sm text-gray-500">{setting.desc}</p>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.enabled}
                  onCheckedChange={() => toggleNotification(setting.id)}
                  data-testid={`switch-${setting.id}`}
                />
              </div>
            ))}
            
            <Separator />
            
            <div>
              <Label htmlFor="low-balance" className="font-medium">Low Balance Threshold</Label>
              <p className="text-sm text-gray-500 mb-2">Alert when balance drops below</p>
              <Select value={lowBalanceThreshold} onValueChange={setLowBalanceThreshold}>
                <SelectTrigger className="w-full" data-testid="select-low-balance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">$25</SelectItem>
                  <SelectItem value="50">$50</SelectItem>
                  <SelectItem value="100">$100</SelectItem>
                  <SelectItem value="250">$250</SelectItem>
                  <SelectItem value="500">$500</SelectItem>
                  <SelectItem value="1000">$1,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#cd1409]" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="font-medium mb-3 block">Theme</Label>
            <RadioGroup value={theme} onValueChange={setTheme} className="space-y-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System Default", icon: Smartphone },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} data-testid={`radio-theme-${option.value}`} />
                  <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#cd1409]" />
              Language & Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="language" className="font-medium">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full mt-2" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="ko">한국어</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#cd1409]" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {privacy.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={setting.id} className="font-medium">{setting.label}</Label>
                  <p className="text-sm text-gray-500">{setting.desc}</p>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.enabled}
                  onCheckedChange={() => togglePrivacy(setting.id)}
                  data-testid={`switch-${setting.id}`}
                />
              </div>
            ))}
            
            <Separator />
            
            <button
              className="w-full flex items-center justify-between py-2 text-left"
              data-testid="link-privacy-policy"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-[#cd1409]">View Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#cd1409]" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { label: "Help Center", href: "/help", icon: HelpCircle },
              { label: "Contact Us", href: "/contact", icon: Phone },
              { label: "Find a Location", href: "/locations", icon: MapPin },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <button
                  className="w-full flex items-center justify-between p-4 hover-elevate text-left border-b last:border-0"
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card>
          <CardContent className="p-4">
            <Link href="/login">
              <Button variant="outline" className="w-full border-[#cd1409] text-[#cd1409]" data-testid="button-sign-out">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-gray-400 py-4">
          <p>Wells Fargo Mobile® v9.4.0</p>
          <p className="mt-1">© 2024 Wells Fargo. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
