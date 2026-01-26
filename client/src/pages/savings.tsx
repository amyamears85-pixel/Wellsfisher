import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, PiggyBank, TrendingUp, Clock, Shield, Calculator } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const savingsProducts = [
  {
    name: "Way2Save Savings",
    apy: "0.15%",
    minBalance: "$25",
    features: ["Automatic savings transfers", "No monthly fee with $300 balance", "Mobile & Online access"],
    highlight: "Starter",
  },
  {
    name: "Platinum Savings",
    apy: "4.25%",
    minBalance: "$25,000",
    features: ["Relationship rate bonus", "Easy access to funds", "FDIC insured"],
    highlight: "High Yield",
  },
  {
    name: "12-Month CD",
    apy: "4.50%",
    minBalance: "$2,500",
    features: ["Guaranteed rate", "FDIC insured up to $250,000", "Auto-renewal option"],
    highlight: "Best Rate",
  },
];

export default function SavingsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [calcDeposit, setCalcDeposit] = useState("10000");
  const [calcTerm, setCalcTerm] = useState("12");
  const [calcRate, setCalcRate] = useState("4.50");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ssn: "",
    initialDeposit: "",
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
    }
  }, [searchQuery, toast]);

  const handleOpenAccount = useCallback((productName: string) => {
    setSelectedProduct(productName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  }, []);

  const interestCalc = useMemo(() => {
    const principal = parseFloat(calcDeposit) || 0;
    const rate = parseFloat(calcRate) / 100;
    const months = parseInt(calcTerm) || 12;
    const interest = principal * rate * (months / 12);
    const total = principal + interest;
    return { interest: interest.toFixed(2), total: total.toFixed(2) };
  }, [calcDeposit, calcRate, calcTerm]);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep === 1) {
      setApplicationStep(2);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedProduct} application is being processed. You'll receive a confirmation email shortly.`,
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", ssn: "", initialDeposit: "" });
      setApplicationStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a5f2a]">Open {selectedProduct}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 2: {applicationStep === 1 ? "Personal Information" : "Account Setup"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label htmlFor="ssn">Social Security Number</Label><Input id="ssn" type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required /></div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div><Label htmlFor="initialDeposit">Initial Deposit Amount</Label><Input id="initialDeposit" type="number" placeholder="$0.00" value={formData.initialDeposit} onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})} required /></div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">Your account will be funded via electronic transfer from your linked account.</p>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-end">
              {applicationStep > 1 && <Button type="button" variant="outline" onClick={() => setApplicationStep(1)}>Back</Button>}
              <Button type="submit" className="bg-[#1a5f2a] hover:bg-[#0d4a1a]">{applicationStep === 2 ? "Submit Application" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calculator Modal */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a5f2a]">Savings Calculator</DialogTitle>
            <DialogDescription>Calculate your potential earnings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="deposit">Initial Deposit ($)</Label><Input id="deposit" type="number" value={calcDeposit} onChange={(e) => setCalcDeposit(e.target.value)} /></div>
            <div>
              <Label htmlFor="term">Term (months)</Label>
              <Select value={calcTerm} onValueChange={setCalcTerm}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                  <SelectItem value="60">60 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="rate">APY (%)</Label><Input id="rate" type="number" step="0.01" value={calcRate} onChange={(e) => setCalcRate(e.target.value)} /></div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Interest Earned</p>
              <p className="text-2xl font-bold text-[#1a5f2a]">${interestCalc.interest}</p>
              <p className="text-sm text-gray-600 mt-2">Total Balance</p>
              <p className="text-xl font-semibold text-gray-800">${interestCalc.total}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top utility bar */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Find Locations", description: "Over 4,700 branches and 12,000+ ATMs nationwide" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><MapPin className="w-3.5 h-3.5" /><span>Find Locations</span></button>
              <button onClick={() => toast({ title: "Customer Service", description: "Call 1-800-869-3557 for 24/7 support" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Phone className="w-3.5 h-3.5" /><span>1-800-869-3557</span></button>
            </div>
            <button onClick={() => toast({ title: "Idioma", description: "Sitio en español próximamente" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Globe className="w-3.5 h-3.5" /><span>Español</span></button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/"><span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>WELLS FARGO</span></Link>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-56 h-9 bg-white border-0 text-gray-800 text-sm rounded-sm pr-10" />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-[#b91c23]"><Search className="w-4 h-4 text-white" /></button>
              </form>
              <button className="lg:hidden text-white p-2"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center overflow-x-auto">
              {[{ name: "Personal", href: "/", active: true }, { name: "Small Business", href: "#" }].map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${item.active ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" : "hover:bg-[#b91c23] border-b-[3px] border-transparent"}`}>{item.name}<ChevronDown className="w-3 h-3 opacity-70" /></span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="bg-[#a01820]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-8 py-2.5 overflow-x-auto">
              {[
                { name: "Checking", href: "/checking" },
                { name: "Savings & CDs", href: "/savings", active: true },
                { name: "Credit Cards", href: "/credit-cards" },
                { name: "Home Loans", href: "/home-loans" },
                { name: "Auto", href: "/auto" },
                { name: "Investing", href: "/investing" },
              ].map((item) => (
                <Link key={item.name} href={item.href}><span className={`text-sm whitespace-nowrap cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>{item.name}</span></Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-2"></div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a5f2a] to-[#0d4a1a] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Savings Accounts & CDs</h1>
            <p className="text-xl text-white/90 mb-6">Grow your savings with competitive rates. Choose from savings accounts and CDs to meet your goals.</p>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => handleOpenAccount("Way2Save Savings")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Open a Savings Account</Button>
              <Button onClick={() => setShowCalculatorModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"><Calculator className="w-4 h-4 mr-2" />Savings Calculator</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Savings & CD Options</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {savingsProducts.map((product) => (
              <Card key={product.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
                {product.highlight && <div className="absolute top-0 left-0 right-0 bg-[#1a5f2a] text-white text-xs font-semibold py-1.5 text-center">{product.highlight}</div>}
                <CardContent className="p-6 pt-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <div className="mb-4"><span className="text-3xl font-bold text-[#1a5f2a]">{product.apy}</span><span className="text-gray-500 text-sm"> APY</span></div>
                  <p className="text-sm text-gray-600 mb-4">Minimum: {product.minBalance}</p>
                  <ul className="space-y-2 mb-6">{product.features.map((feature, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600" />{feature}</li>))}</ul>
                  <Button onClick={() => handleOpenAccount(product.name)} className="w-full bg-[#1a5f2a] hover:bg-[#0d4a1a] text-white rounded-full">Open Account</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Save with Wells Fargo?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: PiggyBank, title: "FDIC Insured", desc: "Your deposits are protected up to $250,000" },
              { icon: TrendingUp, title: "Competitive Rates", desc: "Earn more with our high-yield options" },
              { icon: Clock, title: "24/7 Access", desc: "Manage your savings anytime, anywhere" },
              { icon: Shield, title: "Secure Banking", desc: "Advanced security to protect your money" },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => toast({ title: feature.title, description: feature.desc })}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4"><feature.icon className="w-7 h-7 text-[#1a5f2a]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy Policy", description: "View our privacy practices and data protection policies." })} className="hover:text-white">Privacy Policy</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms of Use", description: "Review the terms and conditions for using Wells Fargo services." })} className="hover:text-white">Terms of Use</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect your accounts." })} className="hover:text-white">Security</button>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
