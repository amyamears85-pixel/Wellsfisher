import { useState } from "react";
import { Menu, X, Home, CreditCard, Landmark, Car, TrendingUp, PiggyBank, User, LogIn, Search, MapPin, Phone, HelpCircle, Settings, ChevronRight, Shield, Building, Clock, Globe, FileText, Smartphone, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const productItems = [
  { name: "Checking", href: "/checking", icon: Landmark, desc: "Everyday banking" },
  { name: "Savings & CDs", href: "/savings", icon: PiggyBank, desc: "Grow your money" },
  { name: "Credit Cards", href: "/credit-cards", icon: CreditCard, desc: "Rewards & benefits" },
  { name: "Home Loans", href: "/home-loans", icon: Home, desc: "Mortgages & refinancing" },
  { name: "Auto", href: "/auto", icon: Car, desc: "Vehicle financing" },
  { name: "Investing", href: "/investing", icon: TrendingUp, desc: "Wealth management" },
];

const quickActions = [
  { name: "Find a Location", icon: MapPin, href: "/locations" },
  { name: "Contact Us", icon: Phone, href: "/contact" },
  { name: "Help & Support", icon: HelpCircle, href: "/help" },
  { name: "Security Center", icon: Shield, href: "/security" },
];

const searchableItems = [
  { name: "Checking Accounts", href: "/checking", category: "Products" },
  { name: "Savings Accounts", href: "/savings", category: "Products" },
  { name: "Credit Cards", href: "/credit-cards", category: "Products" },
  { name: "Home Loans & Mortgages", href: "/home-loans", category: "Products" },
  { name: "Auto Loans", href: "/auto", category: "Products" },
  { name: "Investing & Retirement", href: "/investing", category: "Products" },
  { name: "Find ATM or Branch", href: "/locations", category: "Locations" },
  { name: "Schedule Appointment", href: "/locations", category: "Locations" },
  { name: "Contact Customer Service", href: "/contact", category: "Support" },
  { name: "Report Fraud", href: "/security", category: "Security" },
  { name: "Reset Password", href: "/forgot-password", category: "Account" },
  { name: "Security Settings", href: "/security", category: "Security" },
  { name: "Account Settings", href: "/settings", category: "Account" },
  { name: "Direct Deposit", href: "/checking", category: "Services" },
  { name: "Transfer Money", href: "/transfer", category: "Services" },
  { name: "Bill Pay", href: "/bill-pay", category: "Services" },
  { name: "Mobile Deposit", href: "/help", category: "Services" },
  { name: "Zelle Payments", href: "/checking", category: "Services" },
  { name: "Apply for Credit Card", href: "/credit-cards", category: "Apply" },
  { name: "Apply for Home Loan", href: "/home-loans", category: "Apply" },
  { name: "Open Checking Account", href: "/checking", category: "Apply" },
  { name: "Open Savings Account", href: "/savings", category: "Apply" },
];

interface MobileMenuProps {
  currentPage?: string;
}

export function MobileMenu({ currentPage }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const searchResults = searchQuery.length > 1
    ? searchableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSearchSelect = (href: string) => {
    setSearchQuery("");
    setOpen(false);
    setLocation(href);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0].href);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          size="icon"
          variant="ghost"
          className="lg:hidden text-white"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[400px] p-0 border-0 overflow-y-auto [&>button]:hidden"
      >
        {/* Header */}
        <div className="bg-[#d71e28] sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <span 
              className="text-white text-xl tracking-wide" 
              style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
              data-testid="text-mobile-menu-title"
            >
              WELLS FARGO
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="text-white"
              onClick={() => setOpen(false)}
              data-testid="button-close-menu"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="Search Wells Fargo"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-white border-0 rounded-sm pl-10 text-sm"
                data-testid="input-mobile-search"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute left-4 right-4 mt-1 bg-white rounded-md shadow-lg border z-20 max-h-64 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.name}-${i}`}
                    onClick={() => handleSearchSelect(result.href)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 border-b last:border-0"
                    data-testid={`search-result-${i}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-500">{result.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sign On Section */}
        <div className="bg-[#f5f5f5] p-4 border-b border-gray-200">
          <div className="flex gap-3">
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
              <Button 
                className="w-full bg-[#d71e28] text-white border-[#d71e28] font-semibold"
                data-testid="button-mobile-sign-on"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign On
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-[#d71e28] text-[#d71e28] font-semibold"
                data-testid="button-mobile-enroll"
              >
                <User className="w-4 h-4 mr-2" />
                Enroll
              </Button>
            </Link>
          </div>
          
          {/* Quick Account Access */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "ATM/Branch", icon: MapPin, href: "/locations" },
              { label: "Contact", icon: Phone, href: "/contact" },
              { label: "Help", icon: HelpCircle, href: "/help" },
            ].map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white text-center cursor-pointer hover-elevate" data-testid={`quick-${item.label.toLowerCase()}`}>
                  <item.icon className="w-5 h-5 text-[#d71e28] mb-1" />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Products & Services */}
        <div className="bg-white">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
              data-testid="text-mobile-products-header"
            >
              Products & Services
            </h3>
          </div>
          <nav data-testid="nav-mobile-products">
            {productItems.map((item) => {
              const isActive = currentPage === item.name;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 hover-elevate cursor-pointer ${
                      isActive ? "bg-[#d71e28]/5 border-l-4 border-l-[#d71e28]" : ""
                    }`}
                    data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? "bg-[#d71e28]/10" : "bg-gray-100"
                      }`}>
                        <item.icon className={`w-5 h-5 ${isActive ? "text-[#d71e28]" : "text-gray-600"}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isActive ? "text-[#d71e28]" : "text-gray-900"}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${isActive ? "text-[#d71e28]" : "text-gray-400"}`} />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 
              className="text-xs font-bold text-gray-500 uppercase tracking-wider"
              data-testid="text-mobile-quick-actions-header"
            >
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-2" data-testid="nav-mobile-quick-actions">
            {quickActions.map((item, index) => (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <div
                  className={`flex flex-col items-center justify-center p-4 hover-elevate cursor-pointer ${
                    index % 2 === 0 ? "border-r border-gray-100" : ""
                  } ${index < 2 ? "border-b border-gray-100" : ""}`}
                  data-testid={`button-mobile-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#ffcd41]/20 flex items-center justify-center mb-2">
                    <item.icon className="w-5 h-5 text-[#d71e28]" />
                  </div>
                  <span className="text-xs text-gray-700 text-center">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Services */}
        <div className="bg-white mt-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              More Services
            </h3>
          </div>
          {[
            { name: "Mobile Banking", icon: Smartphone, desc: "Bank on the go", href: "/help" },
            { name: "Online Bill Pay", icon: FileText, desc: "Pay bills online", href: "/checking" },
            { name: "Fraud Protection", icon: Lock, desc: "Protect your accounts", href: "/security" },
          ].map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
              <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 hover-elevate cursor-pointer" data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Links */}
        <div className="bg-[#f5f5f5] mt-2 p-4">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setOpen(false)}>
              <div 
                className="flex items-center gap-3 text-sm text-gray-600 py-2.5 hover-elevate rounded px-2 cursor-pointer"
                data-testid="link-mobile-home"
              >
                <Building className="w-4 h-4" />
                Wells Fargo Home
              </div>
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)}>
              <div 
                className="flex items-center gap-3 text-sm text-gray-600 py-2.5 hover-elevate rounded px-2 cursor-pointer"
                data-testid="button-mobile-settings"
              >
                <Settings className="w-4 h-4" />
                Settings & Preferences
              </div>
            </Link>
            <button 
              onClick={() => {
                setOpen(false);
              }}
              className="flex items-center gap-3 text-sm text-gray-600 py-2.5 hover-elevate rounded px-2 cursor-pointer w-full text-left"
              data-testid="button-mobile-espanol"
            >
              <Globe className="w-4 h-4" />
              Español (Próximamente)
            </button>
          </div>
          
          {/* Contact Info */}
          <Separator className="my-3" />
          <div className="space-y-2">
            <a href="tel:1-800-869-3557" className="flex items-center gap-2 text-sm text-[#d71e28]" data-testid="link-phone-main">
              <Phone className="w-4 h-4" />
              1-800-869-3557
            </a>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Available 24/7
            </div>
          </div>
          
          {/* Legal Footer */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Investment and Insurance Products are: Not FDIC Insured • Not Bank Guaranteed • May Lose Value
            </p>
            <p className="text-[10px] text-gray-400 mt-2">
              © 2024 Wells Fargo. NMLSR ID 399801. All rights reserved.
            </p>
            <div className="flex gap-3 mt-2">
              <button className="text-[10px] text-[#d71e28]">Privacy Policy</button>
              <button className="text-[10px] text-[#d71e28]">Terms of Use</button>
              <button className="text-[10px] text-[#d71e28]">Security</button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
