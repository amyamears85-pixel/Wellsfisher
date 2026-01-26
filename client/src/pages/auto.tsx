import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, Car, Calculator, RefreshCw, Shield } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

const loanOptions = [
  {
    name: "New Car Loan",
    rate: "From 6.49%",
    term: "Up to 72 months",
    features: ["Competitive rates", "Flexible terms", "Quick approval process"],
  },
  {
    name: "Used Car Loan",
    rate: "From 7.24%",
    term: "Up to 72 months",
    features: ["Finance vehicles up to 7 years old", "No mileage restrictions", "Same-day decisions"],
  },
  {
    name: "Refinance",
    rate: "From 6.74%",
    term: "Varies by vehicle",
    features: ["Lower your monthly payment", "Reduce your rate", "Skip a payment option"],
  },
];

export default function AutoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Top utility bar */}
      <div className="bg-[#2c2c2c] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-5">
              <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white">
                <MapPin className="w-3.5 h-3.5" /><span>Find Locations</span>
              </a>
              <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white">
                <Phone className="w-3.5 h-3.5" /><span>1-800-869-3557</span>
              </a>
            </div>
            <a href="#" className="hover:underline flex items-center gap-1.5 text-gray-300 hover:text-white">
              <Globe className="w-3.5 h-3.5" /><span>Español</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/"><span className="text-white text-2xl sm:text-3xl tracking-wide cursor-pointer" style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}>WELLS FARGO</span></Link>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Input placeholder="Search" className="w-56 h-9 bg-white border-0 text-gray-800 text-sm rounded-sm pr-10" />
                <button className="absolute right-0 top-0 h-full px-3 bg-[#b91c23]"><Search className="w-4 h-4 text-white" /></button>
              </div>
              <button className="lg:hidden text-white p-2"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <nav className="bg-[#c41e24] border-t border-[#b91c23]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center overflow-x-auto">
              {[{ name: "Personal", href: "/", active: true }, { name: "Small Business", href: "#" }].map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`px-5 py-3.5 text-sm text-white whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${item.active ? "bg-[#a01820] border-b-[3px] border-[#ffcd41]" : "hover:bg-[#b91c23] border-b-[3px] border-transparent"}`}>
                    {item.name}<ChevronDown className="w-3 h-3 opacity-70" />
                  </span>
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
                <Link key={item.name} href={item.href}>
                  <span className={`text-sm whitespace-nowrap cursor-pointer ${item.active ? "text-white font-semibold" : "text-white/80 hover:text-white"}`}>{item.name}</span>
                </Link>
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
              <Button className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Apply Now</Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">Check Rates</Button>
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
                  <div className="w-14 h-14 bg-[#e8f4fc] rounded-full flex items-center justify-center mb-4">
                    <Car className="w-7 h-7 text-[#1a3d5c]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{loan.name}</h3>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[#1a3d5c]">{loan.rate}</span>
                    <span className="text-gray-500 text-sm"> APR*</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Terms: {loan.term}</p>
                  <ul className="space-y-2 mb-6">
                    {loan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />{feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Get Started</Button>
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
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f4fc] rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-[#1a3d5c]" />
                  </div>
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
            <a href="#" className="hover:text-white">Privacy Policy</a><span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white">Terms of Use</a><span className="text-gray-700">|</span>
            <a href="#" className="hover:text-white">Security</a>
          </div>
          <p className="text-xs text-gray-500 text-center">© 1999 - 2026 Wells Fargo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
