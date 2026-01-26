import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Mail, Clock, ArrowLeft, ChevronRight, Headphones, FileText, CreditCard, Home, Car, Shield, HelpCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const phoneNumbers = [
  { name: "General Banking", number: "1-800-869-3557", hours: "24/7", icon: Headphones },
  { name: "Credit Card Services", number: "1-800-642-4720", hours: "24/7", icon: CreditCard },
  { name: "Home Mortgage", number: "1-800-357-6675", hours: "Mon-Fri 7am-7pm CT", icon: Home },
  { name: "Auto Loans", number: "1-800-289-8004", hours: "Mon-Fri 7am-9pm CT", icon: Car },
  { name: "Report Fraud", number: "1-800-869-3557", hours: "24/7", icon: Shield },
  { name: "Lost/Stolen Cards", number: "1-800-869-3557", hours: "24/7", icon: CreditCard },
];

const topics = [
  "Account Information",
  "Debit/ATM Card",
  "Credit Card",
  "Online & Mobile Banking",
  "Transfers & Payments",
  "Loans & Lines of Credit",
  "Mortgages",
  "Investments",
  "Fraud & Security",
  "Other",
];

export default function ContactPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"call" | "message" | "email">("call");
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    message: "",
    name: "",
    email: "",
    phone: "",
    preferredContact: "email",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll respond within 1-2 business days.",
    });
    setFormData({ topic: "", subject: "", message: "", name: "", email: "", phone: "", preferredContact: "email" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-[#d71e28] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-4">
            <Link href="/">
              <Button size="icon" variant="ghost" className="text-white" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-white text-lg font-semibold">Contact Us</h1>
          </div>
        </div>
      </header>

      {/* Contact Options Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            {[
              { id: "call", label: "Call Us", icon: Phone },
              { id: "message", label: "Secure Message", icon: MessageCircle },
              { id: "email", label: "Email", icon: Mail },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#d71e28] text-[#d71e28] bg-red-50/50"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === "call" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#d71e28]" />
                  Customer Service Numbers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {phoneNumbers.map((item, index) => (
                  <a
                    key={item.name}
                    href={`tel:${item.number.replace(/-/g, "")}`}
                    className={`flex items-center justify-between p-4 hover-elevate ${
                      index < phoneNumbers.length - 1 ? "border-b" : ""
                    }`}
                    data-testid={`link-call-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#d71e28]/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-[#d71e28]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-[#d71e28]">{item.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {item.hours}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-1 ml-auto" />
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">International Callers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  If you're calling from outside the United States, please use our international number.
                </p>
                <a href="tel:1-925-942-3000" className="flex items-center gap-2 text-[#d71e28] font-medium" data-testid="link-international">
                  <Phone className="w-4 h-4" />
                  1-925-942-3000
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">TTY/TDD Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  For customers who are deaf, hard of hearing, or speech-impaired.
                </p>
                <a href="tel:1-800-877-4833" className="flex items-center gap-2 text-[#d71e28] font-medium" data-testid="link-tty">
                  <Phone className="w-4 h-4" />
                  1-800-877-4833
                </a>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "message" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secure Message Center</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Send a secure message through your online banking account.
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-[#fff8e6] border border-[#ffcd41] rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> You must be signed in to your Wells Fargo Online® account to send a secure message.
                  </p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-[#d71e28] text-white" data-testid="button-sign-on-message">
                    Sign On to Send Message
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Use Secure Messaging?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Encrypted communication for your privacy",
                    "Track your message history",
                    "Receive responses directly in your account",
                    "Attach documents securely",
                    "Available 24/7",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-[#d71e28] rounded-full mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "email" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Us a Message</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  We typically respond within 1-2 business days.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic *</Label>
                    <Select value={formData.topic} onValueChange={(v) => setFormData({ ...formData, topic: v })}>
                      <SelectTrigger data-testid="select-topic">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your inquiry"
                      required
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your question or concern in detail"
                      rows={5}
                      required
                      data-testid="input-message"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 555-5555"
                      data-testid="input-phone"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500">
                    <p>
                      <strong>Important:</strong> Please do not include sensitive account information such as 
                      account numbers, Social Security numbers, or passwords in your message. For account-specific 
                      inquiries, please sign in and use the Secure Message Center.
                    </p>
                  </div>

                  <Button type="submit" className="w-full bg-[#d71e28] text-white" data-testid="button-submit-email">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Common Questions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#d71e28]" />
              Common Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible>
              {[
                { q: "How do I reset my online banking password?", a: "You can reset your password by clicking 'Forgot Password' on the sign-on page. You'll need to verify your identity using your SSN and account information." },
                { q: "How do I report a lost or stolen card?", a: "Call us immediately at 1-800-869-3557 (24/7). You can also sign in to your account and go to 'Manage Cards' to report and request a replacement." },
                { q: "How do I dispute a transaction?", a: "Sign in to your account, find the transaction, and select 'Dispute this transaction.' You can also call our customer service line for assistance." },
                { q: "What are your customer service hours?", a: "Our general banking line is available 24/7. Specific departments may have different hours - see the phone directory above for details." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-0">
                  <AccordionTrigger className="px-4 text-left text-sm" data-testid={`accordion-faq-${i}`}>
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-sm text-gray-600">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
