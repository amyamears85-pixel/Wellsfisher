import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, Home, Calculator, FileText, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const loanTypes = [
  { name: "Purchase a Home", desc: "Find the right mortgage for your new home", features: ["Fixed & adjustable rates", "FHA, VA, and USDA loans", "Down payment as low as 3%"], cta: "Get Started" },
  { name: "Refinance", desc: "Lower your rate or access your home equity", features: ["Rate & Term refinance", "Cash-out refinance", "Streamline options available"], cta: "Check Rates" },
  { name: "Home Equity", desc: "Borrow against your home's value", features: ["Home Equity Line of Credit", "Fixed-rate home equity loan", "Flexible payment options"], cta: "Learn More" },
];

const currentRates = [
  { term: "30-Year Fixed", rate: "6.875%", apr: "7.012%" },
  { term: "15-Year Fixed", rate: "6.125%", apr: "6.342%" },
  { term: "5/1 ARM", rate: "6.250%", apr: "7.156%" },
];

export default function HomeLoansPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showPrequalModal, setShowPrequalModal] = useState(false);
  const [homePrice, setHomePrice] = useState([350000]);
  const [downPayment, setDownPayment] = useState([70000]);
  const [loanTerm, setLoanTerm] = useState("30");
  const [interestRate, setInterestRate] = useState("6.875");
  const [prequalStep, setPrequalStep] = useState(1);
  const [prequalData, setPrequalData] = useState({
    firstName: "", lastName: "", email: "", phone: "", income: "", employment: "", creditScore: ""
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
  }, [searchQuery, toast]);

  const monthlyPayment = useMemo(() => {
    const principal = homePrice[0] - downPayment[0];
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const numPayments = parseInt(loanTerm) * 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    return isNaN(payment) ? "0.00" : payment.toFixed(2);
  }, [homePrice, downPayment, interestRate, loanTerm]);

  const handlePrequalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prequalStep < 2) {
      setPrequalStep(2);
    } else {
      setShowPrequalModal(false);
      toast({
        title: "Pre-Qualification Complete!",
        description: "Based on your information, you may qualify for a loan up to $" + (parseInt(prequalData.income) * 4).toLocaleString() + ". A loan officer will contact you shortly.",
      });
      setPrequalData({ firstName: "", lastName: "", email: "", phone: "", income: "", employment: "", creditScore: "" });
      setPrequalStep(1);
    }
  };

  const handleToolClick = (title: string, desc: string) => {
    if (title === "Mortgage Calculator") setShowCalculatorModal(true);
    else if (title === "Get Pre-Qualified") setShowPrequalModal(true);
    else toast({ title, description: desc });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Calculator Modal */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#4a3728]">Mortgage Calculator</DialogTitle>
            <DialogDescription>Estimate your monthly mortgage payment</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="flex justify-between"><span>Home Price</span><span className="font-semibold">${homePrice[0].toLocaleString()}</span></Label>
              <Slider value={homePrice} onValueChange={setHomePrice} min={100000} max={2000000} step={10000} className="mt-2" />
            </div>
            <div>
              <Label className="flex justify-between"><span>Down Payment</span><span className="font-semibold">${downPayment[0].toLocaleString()} ({((downPayment[0]/homePrice[0])*100).toFixed(0)}%)</span></Label>
              <Slider value={downPayment} onValueChange={setDownPayment} min={0} max={homePrice[0] * 0.5} step={5000} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loan Term</Label>
                <Select value={loanTerm} onValueChange={setLoanTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interest Rate (%)</Label>
                <Input type="number" step="0.125" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
              </div>
            </div>
            <div className="bg-[#f5f0eb] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold text-[#4a3728]">${monthlyPayment}</p>
              <p className="text-xs text-gray-500 mt-2">Principal & Interest only. Does not include taxes, insurance, or PMI.</p>
            </div>
            <Button onClick={() => { setShowCalculatorModal(false); setShowPrequalModal(true); }} className="w-full bg-[#d71e28] hover:bg-[#b91c23]">Get Pre-Qualified</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pre-Qualification Modal */}
      <Dialog open={showPrequalModal} onOpenChange={setShowPrequalModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#4a3728]">Get Pre-Qualified</DialogTitle>
            <DialogDescription>Step {prequalStep} of 2: {prequalStep === 1 ? "Personal Information" : "Financial Details"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePrequalSubmit} className="space-y-4">
            {prequalStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={prequalData.firstName} onChange={(e) => setPrequalData({...prequalData, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name</Label><Input value={prequalData.lastName} onChange={(e) => setPrequalData({...prequalData, lastName: e.target.value})} required /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={prequalData.email} onChange={(e) => setPrequalData({...prequalData, email: e.target.value})} required /></div>
                <div><Label>Phone</Label><Input type="tel" value={prequalData.phone} onChange={(e) => setPrequalData({...prequalData, phone: e.target.value})} required /></div>
              </>
            )}
            {prequalStep === 2 && (
              <>
                <div><Label>Annual Household Income</Label><Input type="number" placeholder="$0" value={prequalData.income} onChange={(e) => setPrequalData({...prequalData, income: e.target.value})} required /></div>
                <div>
                  <Label>Employment Status</Label>
                  <Select value={prequalData.employment} onValueChange={(v) => setPrequalData({...prequalData, employment: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Credit Score</Label>
                  <Select value={prequalData.creditScore} onValueChange={(v) => setPrequalData({...prequalData, creditScore: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (740+)</SelectItem>
                      <SelectItem value="good">Good (700-739)</SelectItem>
                      <SelectItem value="fair">Fair (650-699)</SelectItem>
                      <SelectItem value="poor">Poor (Below 650)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-end">
              {prequalStep > 1 && <Button type="button" variant="outline" onClick={() => setPrequalStep(1)}>Back</Button>}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]">{prequalStep === 2 ? "Submit" : "Continue"}</Button>
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
                { name: "Savings & CDs", href: "/savings" },
                { name: "Credit Cards", href: "/credit-cards" },
                { name: "Home Loans", href: "/home-loans", active: true },
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
      <section className="bg-gradient-to-r from-[#4a3728] to-[#2d1f17] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Home Loans & Mortgages</h1>
              <p className="text-xl text-white/90 mb-6">Whether you're buying your first home or refinancing, we have options to fit your needs.</p>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => setShowPrequalModal(true)} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Get Pre-Qualified</Button>
                <Button onClick={() => toast({ title: "Today's Rates", description: "View current mortgage rates and compare options." })} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">Check Rates</Button>
              </div>
            </div>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Rates</h3>
                <div className="space-y-3">
                  {currentRates.map((rate) => (
                    <div key={rate.term} className="flex justify-between items-center py-2 border-b border-white/20 last:border-0">
                      <span className="text-white/90">{rate.term}</span>
                      <div className="text-right"><span className="font-bold text-lg">{rate.rate}</span><span className="text-white/70 text-sm ml-2">APR {rate.apr}</span></div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/60 mt-4">Rates as of today. Your rate may vary.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">How Can We Help You?</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {loanTypes.map((loan) => (
              <Card key={loan.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[#f5f0eb] rounded-full flex items-center justify-center mb-4"><Home className="w-7 h-7 text-[#4a3728]" /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{loan.name}</h3>
                  <p className="text-gray-600 mb-4">{loan.desc}</p>
                  <ul className="space-y-2 mb-6">{loan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600" />{f}</li>)}</ul>
                  <Button onClick={() => loan.name === "Purchase a Home" ? setShowPrequalModal(true) : loan.name === "Refinance" ? toast({ title: "Refinance Options", description: "Compare refinance rates and save on your mortgage." }) : toast({ title: "Home Equity", description: "Access up to 80% of your home's value." })} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">{loan.cta}</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Helpful Tools & Resources</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Calculator, title: "Mortgage Calculator", desc: "Estimate your monthly payment" },
              { icon: FileText, title: "Get Pre-Qualified", desc: "Start your application today" },
              { icon: DollarSign, title: "Affordability", desc: "See how much house you can afford" },
              { icon: Users, title: "Talk to an Expert", desc: "Connect with a home lending advisor" },
            ].map((tool) => (
              <Card key={tool.title} onClick={() => handleToolClick(tool.title, tool.desc)} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#f5f0eb] rounded-full flex items-center justify-center mx-auto mb-4"><tool.icon className="w-7 h-7 text-[#4a3728]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600">{tool.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy Policy", description: "View our privacy practices." })} className="hover:text-white">Privacy Policy</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms of Use", description: "Review our terms." })} className="hover:text-white">Terms of Use</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect you." })} className="hover:text-white">Security</button>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801</p>
        </div>
      </footer>
    </div>
  );
}
