import { Link } from "wouter";
import { WellsFargoIcon } from "@/components/wells-fargo-logo";
import { Globe, Lock, Search, MapPin, Phone, MessageCircle, ChevronDown, Smartphone, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface OfficialHeaderProps {
  variant?: "full" | "simple";
  showNav?: boolean;
}

export function OfficialHeader({ variant = "simple", showNav = false }: OfficialHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (variant === "full") {
    return (
      <>
        {/* Top utility bar */}
        <div className="bg-[#1a1a1a] text-white text-[13px]">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="flex items-center justify-between py-[10px]">
              <div className="flex items-center gap-6">
                <a href="#" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>Locations</span>
                </a>
                <a href="tel:1-800-869-3557" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>1-800-TO-WELLS</span>
                </a>
                <a href="sms:93557" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors hidden md:flex">
                  <MessageCircle className="w-4 h-4" />
                  <span>Text HELP to 93557</span>
                </a>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:underline flex items-center gap-1.5 text-[#d4d4d4] hover:text-white transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>En Español</span>
                </a>
                <a href="#" className="hover:underline text-[#d4d4d4] hover:text-white transition-colors hidden md:inline">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <header className="bg-[#cd1409]">
          <div className="max-w-[1280px] mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                  <WellsFargoIcon className="w-10 h-10" />
                  <span 
                    className="text-white text-[26px] tracking-[0.02em]"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    WELLS FARGO
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                <div className="relative hidden lg:block">
                  <Input
                    placeholder="Search wellsfargo.com"
                    className="w-64 h-10 bg-white border-0 text-gray-800 placeholder:text-gray-500 text-sm rounded pr-12"
                  />
                  <button className="absolute right-0 top-0 h-full px-4 bg-[#a81106] hover:bg-[#8a0e05] transition-colors rounded-r">
                    <Search className="w-4 h-4 text-white" />
                  </button>
                </div>
                <button className="lg:hidden text-white p-2 hover:bg-white/10 rounded">
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  className="lg:hidden text-white p-2 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {showNav && (
            <>
              {/* Primary Navigation */}
              <nav className="bg-[#b81208] border-t border-[#a81106] hidden lg:block">
                <div className="max-w-[1280px] mx-auto px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[
                        { name: "Personal", active: true },
                        { name: "Small Business" },
                        { name: "Commercial Banking" },
                        { name: "Corporate & Investment Banking" },
                      ].map((item) => (
                        <button
                          key={item.name}
                          className={`px-5 py-4 text-[14px] text-white whitespace-nowrap flex items-center gap-1.5 transition-colors font-medium ${
                            item.active 
                              ? "bg-[#9a0f06] border-b-[3px] border-[#ffcd41]" 
                              : "hover:bg-[#a81106] border-b-[3px] border-transparent"
                          }`}
                        >
                          {item.name}
                          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 pr-2">
                      <a href="#" className="text-white/90 text-sm hover:text-white flex items-center gap-2 transition-colors">
                        <Smartphone className="w-4 h-4" />
                        Get the App
                      </a>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Secondary Navigation */}
              <div className="bg-[#9a0f06] hidden lg:block">
                <div className="max-w-[1280px] mx-auto px-4">
                  <div className="flex items-center gap-8 py-3 overflow-x-auto">
                    {[
                      "Checking",
                      "Savings & CDs", 
                      "Credit Cards",
                      "Home Loans",
                      "Personal Loans",
                      "Auto",
                      "Invest",
                      "Rewards"
                    ].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="text-white/85 hover:text-white text-[13px] whitespace-nowrap transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Yellow accent bar */}
        <div className="bg-gradient-to-r from-[#ffcd41] via-[#ffd44f] to-[#ffcd41] h-[6px]"></div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg z-50 border-t">
            <nav className="p-4 space-y-3">
              <a href="#" className="block py-2 text-gray-700 border-b">Personal</a>
              <a href="#" className="block py-2 text-gray-700 border-b">Small Business</a>
              <a href="#" className="block py-2 text-gray-700 border-b">Wealth Management</a>
              <a href="#" className="block py-2 text-gray-700">Commercial</a>
            </nav>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <header className="bg-[#cd1409]">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <WellsFargoIcon className="w-9 h-9" />
                <span
                  className="text-white text-xl tracking-wide"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  WELLS FARGO
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-sm text-white/90">
              <a href="#" className="hover:text-white hidden sm:inline transition-colors">
                Help
              </a>
              <a href="#" className="hover:text-white hidden sm:flex items-center gap-1 transition-colors">
                <Globe className="w-4 h-4" />
                Español
              </a>
              <div className="flex items-center gap-2 text-white/80">
                <Lock className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Secure</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div className="bg-gradient-to-r from-[#ffcd41] via-[#ffd44f] to-[#ffcd41] h-[6px]"></div>
    </>
  );
}
