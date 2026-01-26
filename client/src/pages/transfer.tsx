import { useState } from "react";
import { ArrowLeft, ArrowRight, Building, CreditCard, DollarSign, CheckCircle, Loader2, Bell, User, LogOut, Clock, Shield, MapPin, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { MobileMenu } from "@/components/mobile-menu";
import { OfficialFooter } from "@/components/official-footer";

export default function TransferPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    frequency: "one-time",
    date: new Date().toISOString().split('T')[0],
    memo: "",
  });

  const accounts = [
    { id: "checking", name: "EVERYDAY CHECKING ...4567", balance: 2543.78 },
    { id: "savings", name: "WAY2SAVE SAVINGS ...8901", balance: 15892.45 },
    { id: "credit", name: "ACTIVE CASH CARD ...2345", balance: -1234.56 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleSubmit = async () => {
    if (!formData.fromAccount || !formData.toAccount || !formData.amount) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setTransferComplete(true);
  };

  if (transferComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
        <header className="bg-[#d71e28] sticky top-0 z-20">
          <div className="h-1 bg-[#ffcd41]" />
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/">
                <span className="text-white text-xl font-bold cursor-pointer" style={{ fontFamily: "'Times New Roman', serif" }}>
                  WELLS FARGO
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white hover:bg-white/10 rounded-full">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Transfer Complete</h2>
              <p className="text-gray-600 mb-6">
                Your transfer of {formatCurrency(parseFloat(formData.amount))} has been submitted successfully.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border">
                <p className="text-sm text-gray-600">Confirmation Number</p>
                <p className="font-mono font-semibold text-gray-900 text-lg">WF{Date.now().toString().slice(-10)}</p>
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <p>Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p>Time: {new Date().toLocaleTimeString('en-US')}</p>
                </div>
              </div>
              <Button onClick={() => setLocation("/dashboard")} className="w-full bg-[#d71e28] hover:bg-[#b91c23] h-11">
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
      <header className="bg-[#d71e28] sticky top-0 z-20">
        <div className="h-1 bg-[#ffcd41]" />
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="text-white p-1 hover:bg-white/10 rounded" data-testid="button-back">
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
              <span className="text-white text-sm hidden md:inline">Transfer Money</span>
              <button className="p-2 text-white hover:bg-white/10 rounded-full">
                <Bell className="w-5 h-5" />
              </button>
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold text-gray-800">Transfer Money</h1>
          <p className="text-sm text-gray-500">Move funds between your Wells Fargo accounts</p>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-[#d71e28] text-white' : 'bg-gray-200'}`}>1</div>
          <div className={`flex-1 h-1 ${step >= 2 ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-[#d71e28] text-white' : 'bg-gray-200'}`}>2</div>
          <div className={`flex-1 h-1 ${step >= 3 ? 'bg-[#d71e28]' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-[#d71e28] text-white' : 'bg-gray-200'}`}>3</div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {step === 1 && "Select Accounts"}
              {step === 2 && "Enter Amount"}
              {step === 3 && "Review & Confirm"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>From Account</Label>
                  <Select value={formData.fromAccount} onValueChange={(v) => setFormData({ ...formData, fromAccount: v })}>
                    <SelectTrigger data-testid="select-from-account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.id !== formData.toAccount).map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex justify-between w-full">
                            <span>{account.name}</span>
                            <span className="text-gray-500 ml-4">{formatCurrency(account.balance)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-2">
                  <Label>To Account</Label>
                  <Select value={formData.toAccount} onValueChange={(v) => setFormData({ ...formData, toAccount: v })}>
                    <SelectTrigger data-testid="select-to-account">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(a => a.id !== formData.fromAccount).map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex justify-between w-full">
                            <span>{account.name}</span>
                            <span className="text-gray-500 ml-4">{formatCurrency(account.balance)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full bg-[#d71e28]"
                  disabled={!formData.fromAccount || !formData.toAccount}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="pl-10 text-lg h-12"
                      data-testid="input-amount"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Transfer Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    data-testid="input-date"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Memo (Optional)</Label>
                  <Input
                    placeholder="Add a note"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    data-testid="input-memo"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1 bg-[#d71e28]"
                    disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From</span>
                    <span className="font-medium">{accounts.find(a => a.id === formData.fromAccount)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To</span>
                    <span className="font-medium">{accounts.find(a => a.id === formData.toAccount)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-semibold text-lg">{formatCurrency(parseFloat(formData.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{new Date(formData.date).toLocaleDateString()}</span>
                  </div>
                  {formData.memo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Memo</span>
                      <span className="font-medium">{formData.memo}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  By clicking "Submit Transfer", you authorize Wells Fargo to transfer funds between your accounts as specified above.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={isProcessing}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-[#d71e28]" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit Transfer"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Transfer Information</p>
              <p className="text-blue-700">Transfers between Wells Fargo accounts are typically available immediately. External transfers may take 1-3 business days.</p>
            </div>
          </div>
        </div>
      </main>
      <OfficialFooter />
    </div>
  );
}