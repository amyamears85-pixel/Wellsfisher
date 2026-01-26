import { useState } from "react";
import { Menu, Home, CreditCard, Landmark, Car, TrendingUp, PiggyBank, User, LogIn } from "lucide-react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { name: "Checking", href: "/checking", icon: Landmark },
  { name: "Savings & CDs", href: "/savings", icon: PiggyBank },
  { name: "Credit Cards", href: "/credit-cards", icon: CreditCard },
  { name: "Home Loans", href: "/home-loans", icon: Home },
  { name: "Auto", href: "/auto", icon: Car },
  { name: "Investing", href: "/investing", icon: TrendingUp },
];

interface MobileMenuProps {
  currentPage?: string;
}

export function MobileMenu({ currentPage }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

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
      <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-white p-0">
        <SheetHeader className="bg-[#d71e28] p-4">
          <SheetTitle 
            className="text-white text-left" 
            style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
            data-testid="text-mobile-menu-title"
          >
            WELLS FARGO
          </SheetTitle>
        </SheetHeader>
        
        <div className="p-4">
          <div className="flex flex-col gap-2 mb-4">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button 
                className="w-full bg-[#d71e28] text-white border-[#d71e28]"
                data-testid="button-mobile-sign-on"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign On
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button 
                variant="outline" 
                className="w-full border-[#d71e28] text-[#d71e28]"
                data-testid="button-mobile-enroll"
              >
                <User className="w-4 h-4 mr-2" />
                Enroll
              </Button>
            </Link>
          </div>

          <Separator className="my-4" />
          
          <nav className="flex flex-col gap-1" data-testid="nav-mobile-products">
            <p 
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              data-testid="text-mobile-products-header"
            >
              Products & Services
            </p>
            {navigationItems.map((item) => {
              const isActive = currentPage === item.name;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 ${
                      isActive 
                        ? "bg-[#d71e28]/10 text-[#d71e28] font-semibold" 
                        : "text-gray-700"
                    }`}
                    data-testid={`link-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className="flex flex-col gap-1" data-testid="nav-mobile-quick-links">
            <p 
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              data-testid="text-mobile-quick-links-header"
            >
              Quick Links
            </p>
            <Link href="/" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700"
                data-testid="link-mobile-home"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
