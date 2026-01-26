import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronDown, MapPin, Phone, Globe, Menu, Search, CreditCard, Plane, ShoppingBag, Percent } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

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
                { name: "Credit Cards", href: "/credit-cards", active: true },
                { name: "Home Loans", href: "/home-loans" },
                { name: "Auto", href: "/auto" },
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
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#0d1f33] text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Credit Cards</h1>
            <p className="text-xl text-white/90 mb-6">Find a card that rewards you for your everyday spending. Compare cash back, travel rewards, and low intro APR cards.</p>
            <Button className="bg-[#ffcd41] hover:bg-[#edc13b] text-gray-900 font-semibold rounded-full px-8">
              See All Cards
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Featured Credit Cards</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {creditCards.map((card) => (
              <Card key={card.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className={`${card.color} h-32 flex items-center justify-center`}>
                  <div className="w-48 h-28 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center">
                    <CreditCard className="w-16 h-16 text-white/80" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="bg-[#ffcd41] text-gray-900 text-xs font-semibold px-2 py-1 rounded">{card.highlight}</span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{card.name}</h3>
                  <p className="text-[#d71e28] font-semibold mb-2">{card.reward}</p>
                  <p className="text-sm text-gray-600 mb-1">Annual Fee: {card.annualFee}</p>
                  <p className="text-sm text-gray-600 mb-4">{card.intro}</p>
                  <ul className="space-y-2 mb-6">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600" />{feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-[#d71e28] hover:bg-[#b91c23] text-white rounded-full">Apply Now</Button>
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
              <Card key={category.title} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#e8f0f8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-7 h-7 text-[#1e3a5f]" />
                  </div>
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
