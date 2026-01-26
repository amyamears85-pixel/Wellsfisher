import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, TrendingUp, PieChart, Target, Briefcase, BarChart3, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const investmentOptions = [
  { name: "Self-Directed Investing", desc: "Trade stocks, ETFs, and options online", minInvestment: "$0", features: ["$0 commission stock & ETF trades", "Real-time quotes & research", "Mobile trading app"] },
  { name: "Automated Investing", desc: "Let technology manage your portfolio", minInvestment: "$500", features: ["Professional portfolio management", "Automatic rebalancing", "Tax-loss harvesting"] },
  { name: "Financial Advisor", desc: "Work with a dedicated advisor", minInvestment: "$25,000", features: ["Personalized financial plan", "Ongoing advice & guidance", "Comprehensive wealth management"] },
];

export default function InvestingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showRetirementModal, setShowRetirementModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [accountStep, setAccountStep] = useState(1);
  const [retirementAge, setRetirementAge] = useState([65]);
  const [currentAge, setCurrentAge] = useState("30");
  const [monthlyContribution, setMonthlyContribution] = useState([500]);
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", income: "", investmentGoal: "", riskTolerance: ""
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
  }, [searchQuery, toast]);

  const retirementSavings = useMemo(() => {
    const years = retirementAge[0] - parseInt(currentAge);
    const monthlyRate = 0.07 / 12;
    const months = years * 12;
    const contribution = monthlyContribution[0];
    const starting = parseFloat(currentSavings) || 0;
    
    const futureValueContributions = contribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const futureValueStarting = starting * Math.pow(1 + monthlyRate, months);
    const total = futureValueContributions + futureValueStarting;
    
    return isNaN(total) ? 0 : Math.round(total);
  }, [retirementAge, currentAge, monthlyContribution, currentSavings]);

  const handleOpenAccount = (optionName: string) => {
    setSelectedOption(optionName);
    setAccountStep(1);
    setShowAccountModal(true);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountStep < 2) {
      setAccountStep(2);
    } else {
      setShowAccountModal(false);
      toast({
        title: "Account Application Submitted!",
        description: `Your ${selectedOption} account application is being processed. You'll receive confirmation within 1-2 business days.`,
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", income: "", investmentGoal: "", riskTolerance: "" });
      setAccountStep(1);
    }
  };

  const handleProductClick = (title: string) => {
    toast({
      title,
      description: `Learn more about our ${title.toLowerCase()} investment options and how they can help you reach your financial goals.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Account Modal */}
      <Dialog open={showAccountModal} onOpenChange={setShowAccountModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a4d3e]">Open {selectedOption}</DialogTitle>
            <DialogDescription>Step {accountStep} of 2: {accountStep === 1 ? "Personal Information" : "Investment Profile"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            {accountStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label>Phone</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
              </>
            )}
            {accountStep === 2 && (
              <>
                <div><Label>Annual Income</Label><Input type="number" placeholder="$0" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} required /></div>
                <div>
                  <Label>Investment Goal</Label>
                  <Select value={formData.investmentGoal} onValueChange={(v) => setFormData({...formData, investmentGoal: v})}>
                    <SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="growth">Long-term Growth</SelectItem>
                      <SelectItem value="income">Income Generation</SelectItem>
                      <SelectItem value="education">Education Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Tolerance</Label>
                  <Select value={formData.riskTolerance} onValueChange={(v) => setFormData({...formData, riskTolerance: v})}>
                    <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-end">
              {accountStep > 1 && <Button type="button" variant="outline" onClick={() => setAccountStep(1)}>Back</Button>}
              <Button type="submit" className="bg-[#1a4d3e] hover:bg-[#0d2e26]">{accountStep === 2 ? "Submit Application" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Retirement Calculator Modal */}
      <Dialog open={showRetirementModal} onOpenChange={setShowRetirementModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a4d3e]">Retirement Calculator</DialogTitle>
            <DialogDescription>Estimate your retirement savings</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Current Age</Label><Input type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} /></div>
              <div><Label>Current Savings ($)</Label><Input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} /></div>
            </div>
            <div>
              <Label className="flex justify-between"><span>Retirement Age</span><span className="font-semibold">{retirementAge[0]}</span></Label>
              <Slider value={retirementAge} onValueChange={setRetirementAge} min={50} max={80} step={1} className="mt-2" />
            </div>
            <div>
              <Label className="flex justify-between"><span>Monthly Contribution</span><span className="font-semibold">${monthlyContribution[0].toLocaleString()}</span></Label>
              <Slider value={monthlyContribution} onValueChange={setMonthlyContribution} min={100} max={5000} step={100} className="mt-2" />
            </div>
            <div className="bg-[#e8f5f0] p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Estimated Retirement Savings</p>
              <p className="text-3xl font-bold text-[#1a4d3e]">${retirementSavings.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Based on 7% average annual return</p>
            </div>
            <Button onClick={() => { setShowRetirementModal(false); handleOpenAccount("IRA Account"); }} className="w-full bg-[#d71e28] hover:bg-[#b91c23]">Open an IRA</Button>
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
                { name: "Savings & CDs", href: "/savings" },
                { name: "Credit Cards", href: "/credit-cards" },
                { name: "Home Loans", href: "/home-loans" },
                { name: "Auto", href: "/auto" },
                { name: "Investing", href: "/investing", active: true },
              ].map((item) => (
                <Link key={item.name} href={item.href}><span className={`text-sm whitespace-nowrap cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>{item.name}</span></Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-2"></div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#1a4d3e] to-[#0d2e26] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Investing & Wealth Management</h1>
            <p className="text-xl text-white/90 mb-6">Build your wealth with confidence. From self-directed trading to personalized advice, we have solutions for every investor.</p>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => handleOpenAccount("Brokerage Account")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Get Started</Button>
              <Button onClick={() => setShowRetirementModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"><Target className="w-4 h-4 mr-2" />Retirement Calculator</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Choose Your Investing Style</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {investmentOptions.map((option) => (
              <Card key={option.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-[#e8f5f0] rounded-full flex items-center justify-center mb-4"><TrendingUp className="w-7 h-7 text-[#1a4d3e]" /></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{option.name}</h3>
                  <p className="text-gray-600 mb-4">{option.desc}</p>
                  <p className="text-sm text-gray-500 mb-4">Minimum: {option.minInvestment}</p>
                  <ul className="space-y-2 mb-6">{option.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600" />{f}</li>)}</ul>
                  <Button onClick={() => handleOpenAccount(option.name)} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Learn More</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Investment Products</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: BarChart3, title: "Stocks & ETFs", desc: "Trade individual stocks and funds" },
              { icon: PieChart, title: "Mutual Funds", desc: "Diversified investment options" },
              { icon: Target, title: "Retirement", desc: "IRAs and 401(k) rollovers" },
              { icon: Briefcase, title: "Education", desc: "529 plans for college savings" },
            ].map((product) => (
              <Card key={product.title} onClick={() => product.title === "Retirement" ? setShowRetirementModal(true) : handleProductClick(product.title)} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-4"><product.icon className="w-7 h-7 text-[#1a4d3e]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{product.title}</h3>
                  <p className="text-sm text-gray-600">{product.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <Card className="bg-gray-100 border-0">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Investment and Insurance Products are:</h3>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-gray-600">
                <div className="flex items-start gap-2"><span className="text-[#d71e28] font-bold">•</span><span>Not Insured by the FDIC or Any Federal Government Agency</span></div>
                <div className="flex items-start gap-2"><span className="text-[#d71e28] font-bold">•</span><span>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank</span></div>
                <div className="flex items-start gap-2"><span className="text-[#d71e28] font-bold">•</span><span>Subject to Investment Risks, Including Possible Loss of Principal</span></div>
              </div>
            </CardContent>
          </Card>
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
