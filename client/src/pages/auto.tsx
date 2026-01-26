import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Search, Car, Calculator, RefreshCw, Shield } from "lucide-react";
import { Link } from "wouter";
import { MobileMenu } from "@/components/mobile-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const loanOptions = [
  { name: "New Car Loan", rate: "From 6.49%", term: "Up to 72 months", features: ["Competitive rates", "Flexible terms", "Quick approval process"] },
  { name: "Used Car Loan", rate: "From 7.24%", term: "Up to 72 months", features: ["Finance vehicles up to 7 years old", "No mileage restrictions", "Same-day decisions"] },
  { name: "Refinance", rate: "From 6.74%", term: "Varies by vehicle", features: ["Lower your monthly payment", "Reduce your rate", "Skip a payment option"] },
];

export default function AutoPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState([35000]);
  const [downPayment, setDownPayment] = useState([5000]);
  const [loanTerm, setLoanTerm] = useState("60");
  const [interestRate, setInterestRate] = useState("6.49");
  const [applicationStep, setApplicationStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", income: "", employment: "", vehicleInfo: ""
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
  }, [searchQuery, toast]);

  const monthlyPayment = useMemo(() => {
    const principal = vehiclePrice[0] - downPayment[0];
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm);
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    return isNaN(payment) ? "0.00" : payment.toFixed(2);
  }, [vehiclePrice, downPayment, interestRate, loanTerm]);

  const handleApply = (loanName: string) => {
    setSelectedLoan(loanName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep < 2) {
      setApplicationStep(2);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedLoan} application is being processed. You'll receive a decision within 24 hours.`,
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", income: "", employment: "", vehicleInfo: "" });
      setApplicationStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Calculator Modal */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a3d5c]">Auto Loan Calculator</DialogTitle>
            <DialogDescription>Estimate your monthly car payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="flex justify-between"><span>Vehicle Price</span><span className="font-semibold">${vehiclePrice[0].toLocaleString()}</span></Label>
              <Slider value={vehiclePrice} onValueChange={setVehiclePrice} min={10000} max={100000} step={1000} className="mt-2" />
            </div>
            <div>
              <Label className="flex justify-between"><span>Down Payment</span><span className="font-semibold">${downPayment[0].toLocaleString()}</span></Label>
              <Slider value={downPayment} onValueChange={setDownPayment} min={0} max={vehiclePrice[0] * 0.5} step={500} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loan Term (months)</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                    <SelectItem value="72">72 months</SelectItem>
                    <SelectItem value="84">84 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>APR (%)</Label><Input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} /></div>
            </div>
            <div className="bg-[#e8f4fc] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold text-[#1a3d5c]">${monthlyPayment}</p>
              <p className="text-xs text-gray-500 mt-2">Loan Amount: ${(vehiclePrice[0] - downPayment[0]).toLocaleString()}</p>
            </div>
            <Button onClick={() => { setShowCalculatorModal(false); handleApply("Auto Loan"); }} className="w-full bg-[#d71e28] hover:bg-[#b91c23]">Apply Now</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a3d5c]">Apply for {selectedLoan}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 2: {applicationStep === 1 ? "Personal Information" : "Vehicle & Income"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label>Phone</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div><Label>Annual Income</Label><Input type="number" placeholder="$0" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} required /></div>
                <div>
                  <Label>Employment Status</Label>
                  <Select value={formData.employment} onValueChange={(v) => setFormData({...formData, employment: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Vehicle Information (Year, Make, Model)</Label><Input placeholder="e.g., 2024 Toyota Camry" value={formData.vehicleInfo} onChange={(e) => setFormData({...formData, vehicleInfo: e.target.value})} /></div>
              </>
            )}
            <div className="flex gap-3 justify-end">
              {applicationStep > 1 && <Button type="button" variant="outline" onClick={() => setApplicationStep(1)}>Back</Button>}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]">{applicationStep === 2 ? "Submit" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Top utility bar */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Find Locations", description: "Over 4,700 branches and 12,000+ ATMs nationwide" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><MapPin className="w-3.5 h-3.5" /><span>Find Locations</span></button>
              <a href="tel:1-800-869-3557" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Phone className="w-3.5 h-3.5" /><span>1-800-869-3557</span></a>
              <a href="sms:93557" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><span>Text Us: 93557</span></a>
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
              <MobileMenu currentPage="Auto" />
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
                { name: "Savings & CDs", href: "/savings" },
                { name: "Credit Cards", href: "/credit-cards" },
                { name: "Home Loans", href: "/home-loans" },
                { name: "Auto", href: "/auto", active: true },
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
      <section className="bg-gradient-to-r from-[#1a3d5c] to-[#0d2840] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Auto Loans</h1>
            <p className="text-xl text-white/90 mb-6">Finance your next vehicle with competitive rates and flexible terms. Apply online in minutes.</p>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => handleApply("New Car Loan")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Apply Now</Button>
              <Button onClick={() => setShowCalculatorModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"><Calculator className="w-4 h-4 mr-2" />Payment Calculator</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Auto Financing Options</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {loanOptions.map((loan) => (
              <Card key={loan.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[#e8f4fc] rounded-full flex items-center justify-center mb-4"><Car className="w-7 h-7 text-[#1a3d5c]" /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{loan.name}</h3>
                  <div className="mb-4"><span className="text-2xl font-bold text-[#1a3d5c]">{loan.rate}</span><span className="text-gray-500 text-sm"> APR*</span></div>
                  <p className="text-sm text-gray-600 mb-4">Terms: {loan.term}</p>
                  <ul className="space-y-2 mb-6">{loan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600" />{f}</li>)}</ul>
                  <Button onClick={() => handleApply(loan.name)} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Get Started</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Finance with Wells Fargo?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Calculator, title: "Easy Calculator", desc: "Estimate your monthly payment instantly" },
              { icon: RefreshCw, title: "Quick Process", desc: "Get a decision in minutes" },
              { icon: Shield, title: "GAP Protection", desc: "Optional coverage for added peace of mind" },
              { icon: Car, title: "Dealer Network", desc: "Use at thousands of dealerships" },
            ].map((feature) => (
              <Card key={feature.title} onClick={() => feature.title === "Easy Calculator" ? setShowCalculatorModal(true) : toast({ title: feature.title, description: feature.desc })} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f4fc] rounded-full flex items-center justify-center mx-auto mb-4"><feature.icon className="w-7 h-7 text-[#1a3d5c]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-8">*Rates shown are the lowest available and may vary based on creditworthiness, loan term, and other factors.</p>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy Policy", description: "View our privacy practices." })} className="hover:text-white">Privacy Policy</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms of Use", description: "Review our terms." })} className="hover:text-white">Terms of Use</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect you." })} className="hover:text-white">Security</button>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
