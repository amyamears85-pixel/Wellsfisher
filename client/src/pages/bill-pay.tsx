import { useState } from "react";
import { ArrowLeft, Plus, Building, DollarSign, Calendar, CheckCircle, Loader2, Trash2, Edit, Bell, User, LogOut, Clock, Shield, MapPin, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { MobileMenu } from "@/components/mobile-menu";
import { OfficialFooter } from "@/components/official-footer";

const savedPayees = [
  { id: 1, name: "Electric Company", accountNumber: "...4521", lastPayment: "Jan 15, 2026", amount: 145.00 },
  { id: 2, name: "Internet Provider", accountNumber: "...8834", lastPayment: "Jan 10, 2026", amount: 79.99 },
  { id: 3, name: "Credit Card Company", accountNumber: "...2345", lastPayment: "Jan 5, 2026", amount: 500.00 },
  { id: 4, name: "Phone Service", accountNumber: "...9012", lastPayment: "Jan 20, 2026", amount: 85.00 },
];

export default function BillPayPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPayee, setSelectedPayee] = useState<typeof savedPayees[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handlePayment = async () => {
    if (!selectedPayee || !amount) {
      toast({ title: "Missing Information", description: "Please select a payee and enter amount.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setPaymentComplete(true);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <header className="bg-[#cd1409] sticky top-0 z-[9999]">
          <div className="h-1 bg-[#ffcd41]" />
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <Link href="/">
                <span className="text-white text-xl font-bold cursor-pointer" style={{ fontFamily: "'Times New Roman', serif" }}>
                  WELLS FARGO
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white rounded-full hover-elevate" data-testid="button-notifications">
                  <Bell className="w-5 h-5" />
                </button>
                <MobileMenu />
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center shadow-lg">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Scheduled</h2>
              <p className="text-gray-600 mb-6">
                Your payment of {formatCurrency(parseFloat(amount))} to {selectedPayee?.name} has been scheduled.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border">
                <p className="text-sm text-gray-600">Confirmation Number</p>
                <p className="font-mono font-semibold text-gray-900 text-lg">BP{Date.now().toString().slice(-10)}</p>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <p>Payee: {selectedPayee?.name}</p>
                  <p>Scheduled Date: {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <Button onClick={() => setLocation("/dashboard")} className="w-full bg-[#cd1409]" data-testid="button-return-accounts">
                Return to Accounts
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
          </Card>
        </main>
        <OfficialFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <header className="bg-[#cd1409] sticky top-0 z-[9999]">
        <div className="h-1 bg-[#ffcd41]" />
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="text-white p-1 rounded hover-elevate" data-testid="button-back">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </Link>
              <Link href="/">
                <span className="text-white text-xl font-bold cursor-pointer hidden sm:inline" style={{ fontFamily: "'Times New Roman', serif" }}>
                  WELLS FARGO
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm hidden md:inline">Pay Bills</span>
              <button className="p-2 text-white rounded-full hover-elevate" data-testid="button-notifications-header">
                <Bell className="w-5 h-5" />
              </button>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-800">Pay Bills</h1>
          <p className="text-sm text-gray-500">Manage and schedule payments to your payees</p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-lg">Your Payees</CardTitle>
              <Button variant="ghost" size="sm" className="text-[#cd1409]" data-testid="button-add-payee">
                <Plus className="w-4 h-4 mr-1" />
                Add Payee
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {savedPayees.map((payee) => (
              <button
                key={payee.id}
                onClick={() => {
                  setSelectedPayee(payee);
                  setAmount(payee.amount.toString());
                }}
                className={`w-full flex items-center gap-4 p-4 text-left border-b last:border-0 transition-colors hover-elevate ${
                  selectedPayee?.id === payee.id ? "bg-red-50" : ""
                }`}
                data-testid={`payee-${payee.id}`}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{payee.name}</p>
                  <p className="text-xs text-gray-500">Account {payee.accountNumber} • Last paid {payee.lastPayment}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(payee.amount)}</p>
                  <p className="text-xs text-gray-500">Last amount</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedPayee && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Building className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="font-medium">{selectedPayee.name}</p>
                  <p className="text-sm text-gray-500">Account {selectedPayee.accountNumber}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-lg"
                    data-testid="input-amount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>

              <div className="space-y-2">
                <Label>Pay From</Label>
                <Select defaultValue="checking">
                  <SelectTrigger data-testid="select-pay-from">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">EVERYDAY CHECKING ...4567 ($2,543.78)</SelectItem>
                    <SelectItem value="savings">WAY2SAVE SAVINGS ...8901 ($15,892.45)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handlePayment} className="w-full bg-[#cd1409]" disabled={isProcessing} data-testid="button-submit-payment">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(parseFloat(amount) || 0)}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Bill Pay Information</p>
              <p className="text-blue-700">Payments are typically processed within 1-2 business days. Schedule payments at least 5 days before the due date to ensure on-time delivery.</p>
            </div>
          </div>
        </div>
      </main>
      <OfficialFooter />
    </div>
  );
}