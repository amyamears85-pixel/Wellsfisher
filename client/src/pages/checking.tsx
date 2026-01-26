import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, Smartphone, ArrowRight, Shield, DollarSign, Zap, CreditCard, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const checkingAccounts = [
  {
    name: "Everyday Checking",
    monthlyFee: "$10",
    feeWaiver: "Waivable with $500 minimum daily balance or $500+ direct deposits",
    features: ["Online & Mobile Banking", "Bill Pay", "Debit Card", "Access to 12,000+ ATMs"],
    highlight: "Most Popular",
    bonus: "$300 bonus with qualifying direct deposits",
  },
  {
    name: "Prime Checking",
    monthlyFee: "$25",
    feeWaiver: "Waivable with $20,000 combined balances",
    features: ["All Everyday features", "No ATM fees worldwide", "Free checks", "Relationship discounts"],
    highlight: "Premium",
    bonus: null,
  },
  {
    name: "Clear Access Banking",
    monthlyFee: "$5",
    feeWaiver: "Not waivable",
    features: ["No overdraft fees", "Online & Mobile Banking", "Debit Card", "Early direct deposit"],
    highlight: "No Overdraft Fees",
    bonus: null,
  },
];

export default function CheckingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search Results",
        description: `Showing results for "${searchQuery}"`,
      });
    }
  };

  const handleOpenAccount = (accountName: string) => {
    setSelectedAccount(accountName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep === 1) {
      setApplicationStep(2);
    } else if (applicationStep === 2) {
      setApplicationStep(3);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedAccount} application is being processed. You'll receive a confirmation email shortly.`,
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        ssn: "",
        address: "",
        city: "",
        state: "",
        zip: "",
      });
      setApplicationStep(1);
    }
  };

  const handleCompareAccounts = () => {
    toast({
      title: "Compare Accounts",
      description: "View detailed comparison of all checking account features and benefits.",
    });
  };

  const handleLearnMore = () => {
    toast({
      title: "$300 Checking Bonus",
      description: "Open a new Everyday Checking account and set up qualifying direct deposits totaling $1,000 or more within 90 days to earn your bonus.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#d71e28]">Open {selectedAccount}</DialogTitle>
            <DialogDescription>
              Step {applicationStep} of 3: {applicationStep === 1 ? "Personal Information" : applicationStep === 2 ? "Contact Details" : "Review & Submit"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ssn">Social Security Number</Label>
                  <Input id="ssn" type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required />
                </div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP</Label>
                    <Input id="zip" value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} required />
                  </div>
                </div>
              </>
            )}
            {applicationStep === 3 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Review Your Information</h4>
                <p className="text-sm text-gray-600">Name: {formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-gray-600">Email: {formData.email}</p>
                <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
                <p className="text-sm text-gray-600">Address: {formData.address}, {formData.city}, {formData.state} {formData.zip}</p>
                <p className="text-xs text-gray-500 mt-4">By clicking Submit, you agree to our terms and conditions.</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              {applicationStep > 1 && (
                <Button type="button" variant="outline" onClick={() => setApplicationStep(applicationStep - 1)}>Back</Button>
              )}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]">
                {applicationStep === 3 ? "Submit Application" : "Continue"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Top utility bar */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Find Locations", description: "Over 4,700 branches and 12,000+ ATMs nationwide" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                <MapPin className="w-3.5 h-3.5" />
                <span>Find Locations</span>
              </button>
              <button onClick={() => toast({ title: "Customer Service", description: "Call 1-800-869-3557 for 24/7 support" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>1-800-869-3557</span>
              </button>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Idioma", description: "Sitio en español próximamente" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors">
                <Globe className="w-3.5 h-3.5" />
                <span>Español</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/">
              <span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif", fontWeight: 400 }}>
                WELLS FARGO
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Input 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 h-9 bg-white border-0 text-gray-800 placeholder:text-gray-500 text-sm rounded-sm pr-10" 
                />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-[#b91c23] hover:bg-[#a01820] transition-colors rounded-r-sm">
                  <Search className="w-4 h-4 text-white" />
                </button>
              </form>
              <button className="lg:hidden text-white p-2"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center overflow-x-auto">
              {[
                { name: "Personal", href: "/", active: true },
                { name: "Small Business", href: "#" },
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${item.active ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" : "hover:bg-[#b91c23] border-b-[3px] border-transparent"}`}>
                    {item.name}
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Sub navigation */}
        <div className="bg-[#a01820]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-8 py-2.5 overflow-x-auto">
              {[
                { name: "Checking", href: "/checking", active: true },
                { name: "Savings & CDs", href: "/savings" },
                { name: "Credit Cards", href: "/credit-cards" },
                { name: "Home Loans", href: "/home-loans" },
                { name: "Auto", href: "/auto" },
                { name: "Investing", href: "/investing" },
              ].map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`text-sm whitespace-nowrap transition-colors cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Yellow accent */}
      <div className="bg-[#ffcd41] h-2"></div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#d71e28] to-[#8a1419] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Checking Accounts</h1>
            <p className="text-xl text-white/90 mb-6">Find a checking account that fits your needs with features like mobile banking, bill pay, and access to thousands of ATMs.</p>
            <div className="flex gap-4">
              <Button onClick={() => handleOpenAccount("Everyday Checking")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">
                Open an Account
              </Button>
              <Button onClick={handleCompareAccounts} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">
                Compare Accounts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-[#fff8e6] border-b border-[#f0e4c8]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ffcd41] rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#d71e28]" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Earn a $300 checking bonus</p>
                <p className="text-sm text-gray-600">Open a new Everyday Checking account with qualifying direct deposits</p>
              </div>
            </div>
            <Button onClick={handleLearnMore} className="bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">
              Learn More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Account Cards */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Choose Your Checking Account</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {checkingAccounts.map((account) => (
              <Card key={account.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                {account.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-[#d71e28] text-white text-xs font-semibold py-1.5 text-center">
                    {account.highlight}
                  </div>
                )}
                <CardContent className={`p-6 ${account.highlight ? "pt-10" : ""}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{account.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#d71e28]">{account.monthlyFee}</span>
                    <span className="text-gray-500 text-sm"> /month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{account.feeWaiver}</p>
                  {account.bonus && (
                    <div className="bg-[#fff8e6] rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-[#b8860b]">{account.bonus}</p>
                    </div>
                  )}
                  <ul className="space-y-2 mb-6">
                    {account.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => handleOpenAccount(account.name)} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">
                    Open Account
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Wells Fargo Checking?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Smartphone, title: "Mobile Banking", desc: "Manage your money anytime with our top-rated app" },
              { icon: Shield, title: "Zero Liability", desc: "Protection against unauthorized transactions" },
              { icon: Zap, title: "Early Direct Deposit", desc: "Get paid up to 2 days early" },
              { icon: CreditCard, title: "Debit Card", desc: "Shop securely with contactless payments" },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toast({ title: feature.title, description: feature.desc })}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#fef3f3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-[#d71e28]" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy Policy", description: "View our privacy practices and data protection policies." })} className="hover:text-white">Privacy Policy</button>
            <span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms of Use", description: "Review the terms and conditions for using Wells Fargo services." })} className="hover:text-white">Terms of Use</button>
            <span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect your accounts and personal information." })} className="hover:text-white">Security</button>
            <span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Report Fraud", description: "Call 1-800-869-3557 immediately if you suspect fraud." })} className="hover:text-white">Report Fraud</button>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801</p>
        </div>
      </footer>
    </div>
  );
}
