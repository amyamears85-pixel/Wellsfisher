import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, TrendingUp, PieChart, Target, Users, Briefcase, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

const investmentOptions = [
  {
    name: "Self-Directed Investing",
    desc: "Trade stocks, ETFs, and options online",
    minInvestment: "$0",
    features: ["$0 commission stock & ETF trades", "Real-time quotes & research", "Mobile trading app"],
  },
  {
    name: "Automated Investing",
    desc: "Let technology manage your portfolio",
    minInvestment: "$500",
    features: ["Professional portfolio management", "Automatic rebalancing", "Tax-loss harvesting"],
  },
  {
    name: "Financial Advisor",
    desc: "Work with a dedicated advisor",
    minInvestment: "$25,000",
    features: ["Personalized financial plan", "Ongoing advice & guidance", "Comprehensive wealth management"],
  },
];

export default function InvestingPage() {
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
                { name: "Auto", href: "/auto" },
                { name: "Investing", href: "/investing", active: true },
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
      <section className="bg-gradient-to-r from-[#1a4d3e] to-[#0d2e26] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Investing & Wealth Management</h1>
            <p className="text-xl text-white/90 mb-6">Build your wealth with confidence. From self-directed trading to personalized advice, we have solutions for every investor.</p>
            <div className="flex gap-4 flex-wrap">
              <Button className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">Get Started</Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8">Explore Options</Button>
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
                  <div className="w-14 h-14 bg-[#e8f5f0] rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7 text-[#1a4d3e]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{option.name}</h3>
                  <p className="text-gray-600 mb-4">{option.desc}</p>
                  <p className="text-sm text-gray-500 mb-4">Minimum: {option.minInvestment}</p>
                  <ul className="space-y-2 mb-6">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />{feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Learn More</Button>
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
              <Card key={product.title} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <product.icon className="w-7 h-7 text-[#1a4d3e]" />
                  </div>
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
