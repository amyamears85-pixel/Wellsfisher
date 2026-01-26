import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Search, PiggyBank, TrendingUp, Clock, Shield, Calculator, ChevronRight, Lock, Percent, Target, Building, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { MobileMenu } from "@/components/mobile-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const savingsProducts = [
  {
    name: "Way2Save® Savings",
    apy: "0.15%",
    minBalance: "$25",
    monthlyFee: "$5",
    feeWaiver: "Link to checking with automatic transfers, maintain $300 balance, or be under 25",
    features: ["Save the Change® automatic transfers", "Mobile & online access", "Link to checking for overdraft protection"],
    highlight: "Starter",
    type: "savings",
  },
  {
    name: "Platinum Savings",
    apy: "4.25%",
    minBalance: "$25,000",
    monthlyFee: "$12",
    feeWaiver: "Maintain $3,500 daily balance",
    features: ["Higher rates for higher balances", "Relationship rate bonus available", "Easy access to funds", "FDIC insured"],
    highlight: "High Yield",
    type: "savings",
  },
  {
    name: "Prime Money Market",
    apy: "4.00%",
    minBalance: "$1,000",
    monthlyFee: "$15",
    feeWaiver: "Maintain $5,000 daily balance",
    features: ["Check-writing ability", "Debit card access", "Higher rates for higher balances", "FDIC insured"],
    highlight: "Flexible Access",
    type: "money-market",
  },
];

const cdRates = [
  { term: "3 months", rate: "4.00%", apy: "4.07%", min: "$2,500" },
  { term: "6 months", rate: "4.25%", apy: "4.33%", min: "$2,500" },
  { term: "9 months", rate: "4.35%", apy: "4.44%", min: "$2,500" },
  { term: "12 months", rate: "4.50%", apy: "4.60%", min: "$2,500" },
  { term: "18 months", rate: "4.25%", apy: "4.33%", min: "$2,500" },
  { term: "24 months", rate: "4.00%", apy: "4.07%", min: "$2,500" },
  { term: "36 months", rate: "3.75%", apy: "3.82%", min: "$2,500" },
  { term: "60 months", rate: "3.50%", apy: "3.56%", min: "$2,500" },
];

const faqs = [
  { q: "What's the difference between a savings account and a CD?", a: "A savings account offers flexibility to deposit and withdraw funds, while a CD (Certificate of Deposit) locks in your money for a fixed term in exchange for a guaranteed, often higher, interest rate. CDs have early withdrawal penalties if you access funds before maturity." },
  { q: "How is APY different from interest rate?", a: "APY (Annual Percentage Yield) includes the effect of compound interest, showing you the total amount you'll earn in a year. The interest rate is the base rate before compounding. APY gives you a more accurate picture of your earnings." },
  { q: "Are my deposits FDIC insured?", a: "Yes, deposits at Wells Fargo are insured by the FDIC up to $250,000 per depositor, per insured bank, for each account ownership category. Joint accounts are insured up to $250,000 per co-owner." },
  { q: "Can I access my money in a savings account?", a: "Yes, you can access your savings through ATMs, online transfers, mobile banking, and in-branch withdrawals. Federal regulations previously limited certain types of withdrawals to 6 per month, but these limits have been relaxed." },
  { q: "What happens when my CD matures?", a: "When your CD matures, you have a grace period (typically 10 days) to withdraw funds, add to your CD, or change terms. If you don't act, your CD will automatically renew at the current rate for the same term." },
];

export default function SavingsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showCDModal, setShowCDModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCDTerm, setSelectedCDTerm] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [calcDeposit, setCalcDeposit] = useState([10000]);
  const [calcTerm, setCalcTerm] = useState("12");
  const [calcRate, setCalcRate] = useState("4.50");
  const [savingsGoal, setSavingsGoal] = useState([50000]);
  const [monthlySavings, setMonthlySavings] = useState([500]);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    ssn: "", dateOfBirth: "", address: "", city: "", state: "", zip: "",
    initialDeposit: "", fundingSource: "transfer",
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

  const handleOpenCD = useCallback((term: string) => {
    setSelectedCDTerm(term);
    setShowCDModal(true);
  }, []);

  const interestCalc = useMemo(() => {
    const principal = calcDeposit[0];
    const rate = parseFloat(calcRate) / 100;
    const months = parseInt(calcTerm) || 12;
    const compoundInterest = principal * Math.pow(1 + rate/12, months) - principal;
    const total = principal + compoundInterest;
    return { interest: compoundInterest.toFixed(2), total: total.toFixed(2) };
  }, [calcDeposit, calcRate, calcTerm]);

  const goalCalc = useMemo(() => {
    const goal = savingsGoal[0];
    const monthly = monthlySavings[0];
    const rate = 0.0425 / 12;
    let months = 0;
    let balance = 0;
    while (balance < goal && months < 600) {
      balance = balance * (1 + rate) + monthly;
      months++;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return { months, years, remainingMonths, totalContributions: monthly * months };
  }, [savingsGoal, monthlySavings]);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep < 3) {
      setApplicationStep(applicationStep + 1);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedProduct} account application has been received. Confirmation #WF${Date.now().toString().slice(-8)}`,
      });
      setFormData({
        firstName: "", lastName: "", email: "", phone: "",
        ssn: "", dateOfBirth: "", address: "", city: "", state: "", zip: "",
        initialDeposit: "", fundingSource: "transfer",
      });
      setApplicationStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1a5f2a]">Open {selectedProduct}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 3: {applicationStep === 1 ? "Personal Information" : applicationStep === 2 ? "Address & Contact" : "Fund Your Account"}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1 mb-4">
            {[1,2,3].map(step => (
              <div key={step} className={`h-1 flex-1 rounded ${step <= applicationStep ? 'bg-[#1a5f2a]' : 'bg-gray-200'}`} />
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
                  <div><Label>Social Security Number *</Label><Input type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required /></div>
                </div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div><Label>Email Address *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label>Phone Number *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
                <div><Label>Street Address *</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>City *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required /></div>
                  <div><Label>State *</Label><Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required maxLength={2} /></div>
                  <div><Label>ZIP *</Label><Input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} required maxLength={5} /></div>
                </div>
              </>
            )}
            {applicationStep === 3 && (
              <>
                <div>
                  <Label>Initial Deposit Amount *</Label>
                  <Input type="number" min="25" placeholder="Minimum $25.00" value={formData.initialDeposit} onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})} required />
                </div>
                <div>
                  <Label>How would you like to fund your account?</Label>
                  <RadioGroup value={formData.fundingSource} onValueChange={(v) => setFormData({...formData, fundingSource: v})} className="mt-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="transfer" id="transfer" /><Label htmlFor="transfer">Transfer from another bank</Label></div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="wf-account" id="wf" /><Label htmlFor="wf">Transfer from Wells Fargo account</Label></div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg"><RadioGroupItem value="check" id="check" /><Label htmlFor="check">Mail a check</Label></div>
                  </RadioGroup>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">Your account will be opened and funded within 1-2 business days after verification.</p>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-between pt-4 border-t">
              {applicationStep > 1 ? <Button type="button" variant="outline" onClick={() => setApplicationStep(applicationStep - 1)}>Back</Button> : <div />}
              <Button type="submit" className="bg-[#1a5f2a] hover:bg-[#0d4a1a]">{applicationStep === 3 ? "Submit Application" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calculator Modal */}
      <Dialog open={showCalculatorModal} onOpenChange={setShowCalculatorModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a5f2a]">Savings Calculator</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="earnings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="earnings">Earnings Calculator</TabsTrigger>
              <TabsTrigger value="goal">Goal Calculator</TabsTrigger>
            </TabsList>
            <TabsContent value="earnings" className="space-y-4 pt-4">
              <div>
                <Label className="flex justify-between"><span>Initial Deposit</span><span className="font-semibold">${calcDeposit[0].toLocaleString()}</span></Label>
                <Slider value={calcDeposit} onValueChange={setCalcDeposit} min={100} max={100000} step={100} className="mt-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Time Period</Label>
                  <Select value={calcTerm} onValueChange={setCalcTerm}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>APY (%)</Label><Input type="number" step="0.01" value={calcRate} onChange={(e) => setCalcRate(e.target.value)} /></div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Interest Earned</p>
                <p className="text-3xl font-bold text-[#1a5f2a]">${interestCalc.interest}</p>
                <p className="text-sm text-gray-600 mt-2">Total Balance</p>
                <p className="text-xl font-semibold text-gray-800">${interestCalc.total}</p>
              </div>
            </TabsContent>
            <TabsContent value="goal" className="space-y-4 pt-4">
              <div>
                <Label className="flex justify-between"><span>Savings Goal</span><span className="font-semibold">${savingsGoal[0].toLocaleString()}</span></Label>
                <Slider value={savingsGoal} onValueChange={setSavingsGoal} min={1000} max={500000} step={1000} className="mt-2" />
              </div>
              <div>
                <Label className="flex justify-between"><span>Monthly Contribution</span><span className="font-semibold">${monthlySavings[0].toLocaleString()}</span></Label>
                <Slider value={monthlySavings} onValueChange={setMonthlySavings} min={50} max={5000} step={50} className="mt-2" />
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Time to Reach Goal</p>
                <p className="text-3xl font-bold text-[#1a5f2a]">{goalCalc.years} years {goalCalc.remainingMonths} months</p>
                <p className="text-sm text-gray-600 mt-2">Total Contributions</p>
                <p className="text-xl font-semibold text-gray-800">${goalCalc.totalContributions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Based on 4.25% APY</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* CD Modal */}
      <Dialog open={showCDModal} onOpenChange={setShowCDModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1a5f2a]">Open a {selectedCDTerm} CD</DialogTitle>
            <DialogDescription>Lock in a guaranteed rate for your savings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Current APY for {selectedCDTerm}</p>
              <p className="text-4xl font-bold text-[#1a5f2a]">{cdRates.find(r => r.term === selectedCDTerm)?.apy}</p>
              <p className="text-sm text-gray-500 mt-1">Minimum deposit: {cdRates.find(r => r.term === selectedCDTerm)?.min}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Early withdrawal penalty:</span><span className="font-medium">90-180 days interest</span></div>
              <div className="flex justify-between p-2"><span>Interest payment:</span><span className="font-medium">Monthly or at maturity</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>Renewal:</span><span className="font-medium">Automatic at current rate</span></div>
            </div>
            <Button onClick={() => { setShowCDModal(false); handleOpenAccount(`${selectedCDTerm} CD`); }} className="w-full bg-[#1a5f2a] hover:bg-[#0d4a1a]">Open This CD</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Find Locations", description: "Over 4,700 branches nationwide" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><MapPin className="w-3.5 h-3.5" /><span>Find Locations</span></button>
              <a href="tel:1-800-869-3557" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Phone className="w-3.5 h-3.5" /><span>1-800-869-3557</span></a>
              <a href="sms:93557" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><span>Text Us: 93557</span></a>
            </div>
            <button onClick={() => toast({ title: "Español", description: "Sitio en español próximamente" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white"><Globe className="w-3.5 h-3.5" /><span>Español</span></button>
          </div>
        </div>
      </div>

      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/"><span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>WELLS FARGO</span></Link>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-56 h-9 bg-white border-0 text-gray-800 text-sm rounded-sm pr-10" />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-[#b91c23]"><Search className="w-4 h-4 text-white" /></button>
              </form>
              <MobileMenu currentPage="Savings & CDs" />
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
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white/80 text-sm mb-2">SAVINGS & CDs</p>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Grow your savings with confidence</h1>
              <p className="text-xl text-white/90 mb-6">Earn competitive rates on savings accounts and CDs, all backed by FDIC insurance up to $250,000.</p>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => handleOpenAccount("Platinum Savings")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Open a Savings Account</Button>
                <Button onClick={() => setShowCalculatorModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8"><Calculator className="w-4 h-4 mr-2" />Calculate Savings</Button>
              </div>
            </div>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Featured CD Rate</h3>
                <p className="text-4xl font-bold mb-2">4.50% APY</p>
                <p className="text-white/90 mb-4">12-Month CD with $2,500 minimum deposit. Lock in your rate today.</p>
                <Button onClick={() => handleOpenCD("12 months")} className="w-full bg-white text-[#1a5f2a] hover:bg-gray-100 font-semibold">Open a CD</Button>
                <p className="text-xs text-white/60 mt-3">APY as of January 2026. Terms apply.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            {[
              { icon: Percent, label: "View All Rates", action: () => document.getElementById('rates')?.scrollIntoView({ behavior: 'smooth' }) },
              { icon: Calculator, label: "Savings Calculator", action: () => setShowCalculatorModal(true) },
              { icon: Building, label: "Find a Branch", action: () => toast({ title: "Branch Locator", description: "Find your nearest Wells Fargo branch." }) },
              { icon: HelpCircle, label: "FAQs", action: () => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((item) => (
              <button key={item.label} onClick={item.action} className="flex items-center gap-2 text-[#1a5f2a] hover:underline"><item.icon className="w-4 h-4" />{item.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Savings Accounts */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Savings Accounts</h2>
          <p className="text-gray-600 mb-8">Choose a savings account that fits your needs. All accounts are FDIC insured up to $250,000.</p>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {savingsProducts.map((product) => (
              <Card key={product.name} className="border-0 shadow-lg hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bg-[#1a5f2a] text-white text-xs font-semibold py-1.5 text-center">{product.highlight}</div>
                <CardContent className="p-6 pt-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#1a5f2a]">{product.apy}</span>
                    <span className="text-gray-500 text-sm"> APY</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>Monthly fee: {product.monthlyFee}</p>
                    <p className="text-xs">Fee waiver: {product.feeWaiver}</p>
                    <p>Minimum to open: {product.minBalance}</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />{feature}</li>
                    ))}
                  </ul>
                  <Button onClick={() => handleOpenAccount(product.name)} className="w-full bg-[#1a5f2a] hover:bg-[#0d4a1a] text-white rounded-full">Open Account</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CD Rates Table */}
          <div id="rates" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">CD Rates</h2>
            <p className="text-gray-600 mb-6">Lock in a guaranteed rate with a Certificate of Deposit. Rates effective as of January 26, 2026.</p>
            
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a5f2a] text-white">
                    <tr>
                      <th className="text-left p-4 font-semibold">Term</th>
                      <th className="text-center p-4 font-semibold">Interest Rate</th>
                      <th className="text-center p-4 font-semibold">APY</th>
                      <th className="text-center p-4 font-semibold">Minimum Deposit</th>
                      <th className="text-center p-4 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdRates.map((rate, i) => (
                      <tr key={rate.term} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4 font-medium">{rate.term}</td>
                        <td className="p-4 text-center">{rate.rate}</td>
                        <td className="p-4 text-center font-semibold text-[#1a5f2a]">{rate.apy}</td>
                        <td className="p-4 text-center">{rate.min}</td>
                        <td className="p-4 text-center">
                          <Button onClick={() => handleOpenCD(rate.term)} size="sm" className="bg-[#1a5f2a] hover:bg-[#0d4a1a] rounded-full">Open CD</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 text-xs text-gray-500">
                * Annual Percentage Yield (APY) is accurate as of the date shown. Interest rates may change at any time. Fees may reduce earnings. Penalty for early withdrawal.
              </div>
            </Card>
          </div>

          {/* Features */}
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Why Save with Wells Fargo?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Shield, title: "FDIC Insured", desc: "Your deposits are protected up to $250,000 per depositor" },
              { icon: TrendingUp, title: "Competitive Rates", desc: "Earn more with our high-yield savings and CD options" },
              { icon: Clock, title: "24/7 Access", desc: "Manage your savings anytime with our mobile app and online banking" },
              { icon: Lock, title: "Secure Banking", desc: "Advanced security features protect your accounts" },
            ].map((feature) => (
              <Card key={feature.title} onClick={() => toast({ title: feature.title, description: feature.desc })} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f5e9] rounded-full flex items-center justify-center mx-auto mb-4"><feature.icon className="w-7 h-7 text-[#1a5f2a]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQs */}
          <div id="faqs" className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </main>

      <footer className="bg-[#1a1a1a] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
            <button onClick={() => toast({ title: "Privacy Policy", description: "View our privacy practices." })} className="hover:text-white">Privacy Policy</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Terms of Use", description: "Review our terms and conditions." })} className="hover:text-white">Terms of Use</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect your accounts." })} className="hover:text-white">Security</button><span className="text-gray-700">|</span>
            <span>Member FDIC</span>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
