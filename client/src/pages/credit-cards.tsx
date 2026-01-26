import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, CreditCard, Plane, ShoppingBag, Percent, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const creditCards = [
  {
    name: "Active Cash® Card",
    reward: "Unlimited 2% cash rewards",
    annualFee: "$0",
    intro: "0% intro APR for 15 months",
    features: ["2% cash rewards on purchases", "No category restrictions", "Cell phone protection"],
    highlight: "Best Cash Back",
    color: "bg-blue-600",
  },
  {
    name: "Autograph℠ Card",
    reward: "3X points on travel, dining & more",
    annualFee: "$0",
    intro: "Earn 20,000 bonus points",
    features: ["3X on restaurants, travel, gas & more", "No foreign transaction fees", "No expiration on points"],
    highlight: "Best for Travel",
    color: "bg-purple-700",
  },
  {
    name: "Reflect® Card",
    reward: "Up to 21 months 0% APR",
    annualFee: "$0",
    intro: "Longest intro APR period",
    features: ["0% intro APR up to 21 months", "Cell phone protection", "Zero liability protection"],
    highlight: "Best for Balance Transfer",
    color: "bg-gray-700",
  },
];

export default function CreditCardsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ssn: "",
    income: "",
    employment: "",
    housingPayment: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({ title: "Search Results", description: `Showing results for "${searchQuery}"` });
    }
  };

  const handleApply = (cardName: string) => {
    setSelectedCard(cardName);
    setApplicationStep(1);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicationStep < 3) {
      setApplicationStep(applicationStep + 1);
    } else {
      setShowApplicationModal(false);
      toast({
        title: "Application Submitted!",
        description: `Your ${selectedCard} application is being reviewed. You'll receive a decision within 7-10 business days.`,
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", ssn: "", income: "", employment: "", housingPayment: "" });
      setApplicationStep(1);
    }
  };

  const handleCategoryClick = (category: string) => {
    toast({
      title: category,
      description: `Explore our best ${category.toLowerCase()} credit cards and find the right one for you.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">Apply for {selectedCard}</DialogTitle>
            <DialogDescription>Step {applicationStep} of 3: {applicationStep === 1 ? "Personal Information" : applicationStep === 2 ? "Financial Information" : "Review & Submit"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplicationSubmit} className="space-y-4">
            {applicationStep === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required /></div>
                  <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required /></div>
                </div>
                <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
                <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required /></div>
                <div><Label htmlFor="ssn">Social Security Number</Label><Input id="ssn" type="password" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={(e) => setFormData({...formData, ssn: e.target.value})} required /></div>
              </>
            )}
            {applicationStep === 2 && (
              <>
                <div><Label htmlFor="income">Annual Income</Label><Input id="income" type="number" placeholder="$0" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} required /></div>
                <div>
                  <Label htmlFor="employment">Employment Status</Label>
                  <Select value={formData.employment} onValueChange={(value) => setFormData({...formData, employment: value})}>
                    <SelectTrigger><SelectValue placeholder="Select employment status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label htmlFor="housingPayment">Monthly Housing Payment</Label><Input id="housingPayment" type="number" placeholder="$0" value={formData.housingPayment} onChange={(e) => setFormData({...formData, housingPayment: e.target.value})} required /></div>
              </>
            )}
            {applicationStep === 3 && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold">Review Your Application</h4>
                <p className="text-sm text-gray-600">Name: {formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-gray-600">Email: {formData.email}</p>
                <p className="text-sm text-gray-600">Annual Income: ${formData.income}</p>
                <p className="text-sm text-gray-600">Employment: {formData.employment}</p>
                <p className="text-xs text-gray-500 mt-4">By clicking Submit, you authorize us to check your credit and agree to our terms.</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              {applicationStep > 1 && <Button type="button" variant="outline" onClick={() => setApplicationStep(applicationStep - 1)}>Back</Button>}
              <Button type="submit" className="bg-[#d71e28] hover:bg-[#b91c23]">{applicationStep === 3 ? "Submit Application" : "Continue"}</Button>
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
                { name: "Credit Cards", href: "/credit-cards", active: true },
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
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#0d1f33] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Credit Cards</h1>
            <p className="text-xl text-white/90 mb-6">Find a card that rewards you for your everyday spending. Compare cash back, travel rewards, and low intro APR cards.</p>
            <Button onClick={() => toast({ title: "All Credit Cards", description: "Viewing all available Wells Fargo credit card options." })} className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">See All Cards</Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Featured Credit Cards</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {creditCards.map((card) => (
              <Card key={card.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
                <div className={`${card.color} h-32 flex items-center justify-center relative`}>
                  <div className="w-48 h-28 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                    <CreditCard className="w-16 h-16 text-white/80" />
                  </div>
                  <span className="absolute top-2 right-2 bg-[#ffcd41] text-gray-900 text-xs font-semibold px-2 py-1 rounded">{card.highlight}</span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{card.name}</h3>
                  <p className="text-[#d71e28] font-semibold mb-2">{card.reward}</p>
                  <p className="text-sm text-gray-600 mb-1">Annual Fee: {card.annualFee}</p>
                  <p className="text-sm text-gray-600 mb-4">{card.intro}</p>
                  <ul className="space-y-2 mb-6">{card.features.map((feature, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-600" />{feature}</li>))}</ul>
                  <Button onClick={() => handleApply(card.name)} className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-8">Find the Right Card for You</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Percent, title: "Cash Back", desc: "Earn unlimited cash rewards on every purchase" },
              { icon: Plane, title: "Travel Rewards", desc: "Earn points for flights, hotels, and more" },
              { icon: ShoppingBag, title: "Shopping", desc: "Extra rewards at your favorite stores" },
              { icon: CreditCard, title: "Balance Transfer", desc: "0% intro APR to pay down debt faster" },
            ].map((category) => (
              <Card key={category.title} onClick={() => handleCategoryClick(category.title)} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f0f8] rounded-full flex items-center justify-center mx-auto mb-4"><category.icon className="w-7 h-7 text-[#1e3a5f]" /></div>
                  <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.desc}</p>
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
            <button onClick={() => toast({ title: "Terms of Use", description: "Review our terms and conditions." })} className="hover:text-white">Terms of Use</button><span className="text-gray-700">|</span>
            <button onClick={() => toast({ title: "Security Center", description: "Learn how we protect your accounts." })} className="hover:text-white">Security</button>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
