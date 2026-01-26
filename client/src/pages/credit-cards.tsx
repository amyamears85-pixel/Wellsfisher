import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, CreditCard, Percent, Gift, ShoppingBag, Plane, DollarSign, Shield, Star, Clock, HelpCircle, X } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const creditCards = [
  {
    name: "Active Cash® Card",
    category: "Cash Back",
    rewardRate: "2%",
    rewardDesc: "unlimited cash rewards on purchases",
    annualFee: "$0",
    apr: "20.24%, 25.24%, or 29.99% variable APR",
    welcomeBonus: "$200 cash rewards bonus after spending $500 in the first 3 months",
    features: ["No rotating categories to track", "No annual fee", "0% intro APR for 15 months on purchases", "Cell phone protection"],
    highlight: "Top Pick",
    icon: DollarSign,
  },
  {
    name: "Autograph℠ Card",
    category: "Travel & Dining",
    rewardRate: "3X",
    rewardDesc: "points on restaurants, travel, gas, transit & streaming",
    annualFee: "$0",
    apr: "20.24%, 25.24%, or 29.99% variable APR",
    welcomeBonus: "20,000 bonus points after spending $1,000 in the first 3 months",
    features: ["No foreign transaction fees", "Auto rental collision damage waiver", "24/7 concierge service", "Trip cancellation protection"],
    highlight: "Best for Travel",
    icon: Plane,
  },
  {
    name: "Reflect® Card",
    category: "Balance Transfer",
    rewardRate: "0%",
    rewardDesc: "intro APR for up to 21 months",
    annualFee: "$0",
    apr: "18.24%, 24.74%, or 29.99% variable APR after intro",
    welcomeBonus: "0% intro APR on purchases and balance transfers for up to 21 months",
    features: ["Up to 21 months 0% intro APR", "No annual fee", "My Wells Fargo Deals for savings", "Cell phone protection"],
    highlight: "Best for Balance Transfer",
    icon: Percent,
  },
  {
    name: "Bilt Mastercard®",
    category: "Rent Rewards",
    rewardRate: "1X",
    rewardDesc: "points on rent with no fees, up to 100,000 points/year",
    annualFee: "$0",
    apr: "22.49%, 27.49%, or 30.99% variable APR",
    welcomeBonus: "Earn points on rent payments with no transaction fees",
    features: ["Earn points on rent", "Transfer to 16+ airline & hotel partners", "1% back on rent, 2X on travel, 3X on dining", "Rent Day promotions"],
    highlight: "Unique",
    icon: Gift,
  },
];

const faqs = [
  { q: "How do I apply for a Wells Fargo credit card?", a: "You can apply online in minutes, by phone at 1-800-932-6736, or at any Wells Fargo branch. You'll need your personal information, income details, and housing expenses. Most applicants receive a decision within minutes." },
  { q: "What credit score do I need for a Wells Fargo credit card?", a: "Most Wells Fargo credit cards require good to excellent credit (typically 670+). However, we offer options for those building credit. Your actual rate and terms depend on your creditworthiness and other factors." },
  { q: "How do I earn and redeem rewards?", a: "Rewards are earned automatically on eligible purchases. You can redeem through Wells Fargo Online, the mobile app, or by calling. Options include statement credits, direct deposits, gift cards, travel, and merchandise." },
  { q: "What is the 0% intro APR offer?", a: "Select cards offer 0% intro APR on purchases and/or balance transfers for a promotional period. After the intro period ends, the standard variable APR applies to remaining balances and new purchases." },
  { q: "Are there foreign transaction fees?", a: "Some Wells Fargo cards charge a 3% foreign transaction fee for purchases made outside the U.S. Our Autograph and Autograph Journey cards have no foreign transaction fees." },
];

export default function CreditCardsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showRewardsCalcModal, setShowRewardsCalcModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [compareCards, setCompareCards] = useState<string[]>([]);
  const [monthlySpend, setMonthlySpend] = useState([1500]);
  const [diningSpend, setDiningSpend] = useState([300]);
  const [travelSpend, setTravelSpend] = useState([200]);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", ssn: "", dateOfBirth: "",
    address: "", city: "", state: "", zip: "", housingType: "", monthlyPayment: "",
    employmentStatus: "", annualIncome: "", incomeSource: "",
    agreeTerms: false,
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
    }
  }, [searchQuery, toast]);

  const handleApply = useCallback((cardName: string) => {
    setSelectedCard(cardName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  }, []);

  const toggleCompare = useCallback((cardName: string) => {
    setCompareCards(prev => 
      prev.includes(cardName) 
        ? prev.filter(c => c !== cardName)
        : prev.length < 3 ? [...prev, cardName] : prev
    );
  }, []);

  const rewardsEstimate = useMemo(() => {
    const monthly = monthlySpend[0];
    const dining = diningSpend[0];
    const travel = travelSpend[0];
    const other = monthly - dining - travel;
    const activeCash = monthly * 0.02 * 12;
    const autograph = (dining * 3 + travel * 3 + other * 1) / 100 * 12;
    return {
      activeCash: activeCash.toFixed(0),
      autograph: autograph.toFixed(0),
      autographValue: (autograph * 0.01).toFixed(0),
    };
  }, [monthlySpend, diningSpend, travelSpend]);

  const filteredCards = selectedCategory === "all" 
    ? creditCards 
    : creditCards.filter(c => c.category.toLowerCase().includes(selectedCategory));

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep < 4) {
      setApplicationStep(applicationStep + 1);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedCard} application is being reviewed. Reference #CC${Date.now().toString().slice(-8)}`,
      });
      setFormData({
        firstName: "", lastName: "", email: "", phone: "", ssn: "", dateOfBirth: "",
        address: "", city: "", state: "", zip: "", housingType: "", monthlyPayment: "",
        employmentStatus: "", annualIncome: "", incomeSource: "", agreeTerms: false,
      });
      setApplicationStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#d71e28]">Apply for {selectedCard}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 4</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4].map(step => (
              <div key={step} className={`h-1 flex-1 rounded ${step <= applicationStep ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name *</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name *</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date of Birth *</Label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} required /></div>
                  <div><Label>SSN *</Label><Input type="password" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required /></div>
                </div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label>Phone *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
                <div><Label>Address *</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>City *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required /></div>
                  <div><Label>State *</Label><Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required /></div>
                  <div><Label>ZIP *</Label><Input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} required /></div>
                </div>
              </>
            )}
            {applicationStep === 3 && (
              <>
                <div>
                  <Label>Employment Status *</Label>
                  <Select value={formData.employmentStatus} onValueChange={(v) => setFormData({...formData, employmentStatus: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Annual Income *</Label><Input type="number" value={formData.annualIncome} onChange={(e) => setFormData({...formData, annualIncome: e.target.value})} required /></div>
              </>
            )}
            {applicationStep === 4 && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1">
                  <p><strong>Card:</strong> {selectedCard}</p>
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Income:</strong> ${parseInt(formData.annualIncome || "0").toLocaleString()}</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})} />
                  <Label htmlFor="terms" className="text-xs">I agree to the Terms & Conditions</Label>
                </div>
              </>
            )}
            <div className="flex justify-between pt-4 border-t">
              {applicationStep > 1 ? <Button type="button" variant="outline" onClick={() => setApplicationStep(applicationStep - 1)}>Back</Button> : <div />}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]" disabled={applicationStep === 4 && !formData.agreeTerms}>{applicationStep === 4 ? "Submit" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Compare Credit Cards</DialogTitle></DialogHeader>
          {compareCards.length < 2 ? (
            <div className="text-center py-8 text-gray-500">Select at least 2 cards to compare</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-3 bg-gray-50">Feature</th>{compareCards.map(name => <th key={name} className="text-center p-3 bg-gray-50 font-bold text-[#d71e28]">{name}</th>)}</tr></thead>
              <tbody>
                <tr className="border-b"><td className="p-3 font-medium">Annual Fee</td>{compareCards.map(name => <td key={name} className="text-center p-3">{creditCards.find(c => c.name === name)?.annualFee}</td>)}</tr>
                <tr className="border-b"><td className="p-3 font-medium">Rewards</td>{compareCards.map(name => <td key={name} className="text-center p-3">{creditCards.find(c => c.name === name)?.rewardRate} {creditCards.find(c => c.name === name)?.rewardDesc}</td>)}</tr>
                <tr className="border-b"><td className="p-3 font-medium">Welcome Bonus</td>{compareCards.map(name => <td key={name} className="text-center p-3 text-xs">{creditCards.find(c => c.name === name)?.welcomeBonus}</td>)}</tr>
                <tr><td className="p-3"></td>{compareCards.map(name => <td key={name} className="text-center p-3"><Button onClick={() => { setShowCompareModal(false); handleApply(name); }} className="bg-[#d71e28] hover:bg-[#b91c23] text-sm">Apply</Button></td>)}</tr>
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>

      {/* Rewards Calculator */}
      <Dialog open={showRewardsCalcModal} onOpenChange={setShowRewardsCalcModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#d71e28]">Rewards Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div><Label className="flex justify-between"><span>Monthly Spending</span><span className="font-semibold">${monthlySpend[0].toLocaleString()}</span></Label><Slider value={monthlySpend} onValueChange={setMonthlySpend} min={500} max={10000} step={100} className="mt-2" /></div>
            <div><Label className="flex justify-between"><span>Dining</span><span className="font-semibold">${diningSpend[0]}</span></Label><Slider value={diningSpend} onValueChange={setDiningSpend} min={0} max={2000} step={50} className="mt-2" /></div>
            <div><Label className="flex justify-between"><span>Travel</span><span className="font-semibold">${travelSpend[0]}</span></Label><Slider value={travelSpend} onValueChange={setTravelSpend} min={0} max={2000} step={50} className="mt-2" /></div>
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold">Annual Rewards Estimate</h4>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span>Active Cash® Card</span><span className="font-bold text-[#d71e28]">${rewardsEstimate.activeCash}</span></div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg"><span>Autograph℠ Card</span><span className="font-bold text-[#d71e28]">{rewardsEstimate.autograph} pts</span></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => toast({ title: "Find Locations", description: "4,700+ branches nationwide" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><MapPin className="w-3.5 h-3.5" />Find Locations</button>
            <button onClick={() => toast({ title: "Credit Cards Support", description: "1-800-932-6736" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Phone className="w-3.5 h-3.5" />1-800-932-6736</button>
          </div>
          <button onClick={() => toast({ title: "Español", description: "Sitio en español" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Globe className="w-3.5 h-3.5" />Español</button>
        </div>
      </div>

      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>WELLS FARGO</span></Link>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-56 h-9 bg-white border-0 text-gray-800 text-sm rounded-sm pr-10" />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-[#b91c23]"><Search className="w-4 h-4 text-white" /></button>
            </form>
            <button className="lg:hidden text-white p-2"><Menu className="w-5 h-5" /></button>
          </div>
        </div>
        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto">
            {[{ name: "Personal", href: "/", active: true }, { name: "Small Business", href: "#" }].map((item) => (
              <Link key={item.name} href={item.href}><span className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${item.active ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" : "hover:bg-[#b91c23] border-b-[3px] border-transparent"}`}>{item.name}<ChevronDown className="w-3 h-3 opacity-70" /></span></Link>
            ))}
          </div>
        </nav>
        <div className="bg-[#a01820]">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-8 overflow-x-auto">
            {[{ name: "Checking", href: "/checking" }, { name: "Savings & CDs", href: "/savings" }, { name: "Credit Cards", href: "/credit-cards", active: true }, { name: "Home Loans", href: "/home-loans" }, { name: "Auto", href: "/auto" }, { name: "Investing", href: "/investing" }].map((item) => (
              <Link key={item.name} href={item.href}><span className={`text-sm whitespace-nowrap cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>{item.name}</span></Link>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-2"></div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#d71e28] to-[#8a1419] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-white/80 text-sm mb-2">CREDIT CARDS</p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Find the right card for the way you spend</h1>
            <p className="text-xl text-white/90 mb-6">Earn rewards on everyday purchases with no annual fee.</p>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => setShowRewardsCalcModal(true)} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Calculate Rewards</Button>
              <Button onClick={() => setShowCompareModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">Compare Cards</Button>
            </div>
          </div>
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5" /> Featured Card</h3>
              <p className="text-3xl font-bold mb-1">Active Cash® Card</p>
              <p className="text-white/90 mb-4">Earn unlimited 2% cash rewards. Plus, $200 bonus.</p>
              <Button onClick={() => handleApply("Active Cash® Card")} className="w-full bg-white text-[#d71e28] hover:bg-gray-100 font-semibold">Apply Now</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-8 flex-wrap text-sm">
          {[{ icon: CreditCard, label: "Manage Card", action: () => toast({ title: "Sign In", description: "Sign in to manage your card." }) }, { icon: DollarSign, label: "Rewards Calculator", action: () => setShowRewardsCalcModal(true) }, { icon: Shield, label: "Card Benefits", action: () => toast({ title: "Benefits", description: "Explore card benefits." }) }, { icon: HelpCircle, label: "FAQs", action: () => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' }) }].map((item) => (
            <button key={item.label} onClick={item.action} className="flex items-center gap-2 text-[#d71e28] hover:underline"><item.icon className="w-4 h-4" />{item.label}</button>
          ))}
        </div>
      </section>

      {/* Main */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Filter */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div><h2 className="text-2xl font-bold text-gray-800">Our Credit Cards</h2><p className="text-gray-600">Choose from cash back, travel, and balance transfer options</p></div>
            <div className="flex gap-2">
              {["all", "cash", "travel", "balance"].map((cat) => (
                <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className={selectedCategory === cat ? "bg-[#d71e28] hover:bg-[#b91c23]" : ""}>
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {compareCards.length > 0 && (
            <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
              <span>{compareCards.length} card{compareCards.length > 1 ? 's' : ''} selected</span>
              <div className="flex gap-2">
                <Button onClick={() => setCompareCards([])} variant="outline" size="sm" className="text-white border-white hover:bg-white/10">Clear</Button>
                <Button onClick={() => setShowCompareModal(true)} size="sm" className="bg-[#ffcd41] text-gray-900 hover:bg-[#edc13b]" disabled={compareCards.length < 2}>Compare</Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {filteredCards.map((card) => (
              <Card key={card.name} className="border-0 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-[#d71e28] text-white text-xs font-semibold py-1.5 text-center">{card.highlight}</div>
                <CardContent className="p-6 pt-10">
                  <div className="flex items-start justify-between mb-4">
                    <div><p className="text-xs text-gray-500 uppercase">{card.category}</p><h3 className="text-xl font-bold text-gray-800">{card.name}</h3></div>
                    <div className="w-12 h-12 bg-[#d71e28]/10 rounded-lg flex items-center justify-center"><card.icon className="w-6 h-6 text-[#d71e28]" /></div>
                  </div>
                  <div className="mb-4"><span className="text-3xl font-bold text-[#d71e28]">{card.rewardRate}</span><span className="text-gray-600 text-sm ml-1">{card.rewardDesc}</span></div>
                  <div className="mb-4 p-3 bg-[#fff8e6] rounded-lg border border-[#ffcd41]"><p className="text-sm font-medium text-[#8b6914]">{card.welcomeBonus}</p></div>
                  <ul className="space-y-2 mb-6">{card.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />{f}</li>)}</ul>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApply(card.name)} className="flex-1 bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Apply Now</Button>
                    <Button variant="outline" onClick={() => toggleCompare(card.name)} className={compareCards.includes(card.name) ? "bg-gray-100" : ""}>{compareCards.includes(card.name) ? <X className="w-4 h-4" /> : "Compare"}</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Annual Fee: {card.annualFee}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="rewards" className="w-full mb-12">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>
            <TabsContent value="rewards">
              <Card className="border-0 shadow-md"><CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {[{ icon: Gift, title: "Welcome Bonuses", desc: "Earn bonus rewards after qualifying purchases" }, { icon: ShoppingBag, title: "Everyday Rewards", desc: "Earn on purchases you make every day" }, { icon: Plane, title: "Travel Perks", desc: "No foreign fees, travel insurance, concierge" }].map((item) => (
                    <div key={item.title} className="text-center"><item.icon className="w-10 h-10 text-[#d71e28] mx-auto mb-3" /><h4 className="font-semibold mb-2">{item.title}</h4><p className="text-sm text-gray-600">{item.desc}</p></div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="security">
              <Card className="border-0 shadow-md"><CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[{ title: "Zero Liability", desc: "Not responsible for unauthorized transactions" }, { title: "Fraud Monitoring", desc: "24/7 detection of suspicious activity" }, { title: "Card Lock", desc: "Lock your card from the app" }, { title: "Virtual Numbers", desc: "Temporary numbers for online shopping" }].map((item) => (
                    <div key={item.title} className="p-4 bg-gray-50 rounded-lg"><h4 className="font-semibold mb-1">{item.title}</h4><p className="text-sm text-gray-600">{item.desc}</p></div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="management">
              <Card className="border-0 shadow-md"><CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {[{ title: "Mobile Payments", desc: "Apple Pay, Google Pay, Samsung Pay" }, { title: "Autopay", desc: "Never miss a payment" }, { title: "Spending Insights", desc: "Track your spending" }, { title: "Paperless Statements", desc: "Access statements online" }].map((item) => (
                    <div key={item.title} className="p-4 bg-gray-50 rounded-lg"><h4 className="font-semibold mb-1">{item.title}</h4><p className="text-sm text-gray-600">{item.desc}</p></div>
                  ))}
                </div>
              </CardContent></Card>
            </TabsContent>
          </Tabs>

          {/* FAQs */}
          <div id="faqs" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => <AccordionItem key={i} value={`item-${i}`}><AccordionTrigger className="text-left">{faq.q}</AccordionTrigger><AccordionContent className="text-gray-600">{faq.a}</AccordionContent></AccordionItem>)}
            </Accordion>
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy", description: "View privacy practices." })} className="hover:text-white">Privacy</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms", description: "Card terms & conditions." })} className="hover:text-white">Terms</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security", description: "Security information." })} className="hover:text-white">Security</button>
          </div>
          <p className="text-xs text-gray-500 text-center max-w-3xl mx-auto mb-4">All credit cards subject to credit approval. APRs are variable. See terms for details.</p>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
