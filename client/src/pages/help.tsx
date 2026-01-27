import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, HelpCircle, CreditCard, Smartphone, Lock, DollarSign, FileText, Building, TrendingUp, MessageCircle, Phone, BookOpen, Video, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OfficialHeader } from "@/components/official-header";

const helpCategories = [
  { name: "Online & Mobile Banking", icon: Smartphone, topics: 45, href: "#online" },
  { name: "Account Management", icon: FileText, topics: 32, href: "#accounts" },
  { name: "Cards & Payments", icon: CreditCard, topics: 28, href: "#cards" },
  { name: "Security & Privacy", icon: Lock, topics: 24, href: "#security" },
  { name: "Transfers & Deposits", icon: DollarSign, topics: 21, href: "#transfers" },
  { name: "Loans & Credit", icon: TrendingUp, topics: 36, href: "#loans" },
];

const popularTopics = [
  { title: "How to reset your password", category: "Security", views: "125K" },
  { title: "Setting up direct deposit", category: "Accounts", views: "98K" },
  { title: "Mobile check deposit limits", category: "Mobile Banking", views: "87K" },
  { title: "Disputing a transaction", category: "Cards", views: "76K" },
  { title: "Zelle® transfer limits and fees", category: "Transfers", views: "72K" },
  { title: "Ordering new checks", category: "Accounts", views: "65K" },
];

const faqs = [
  {
    category: "Online Banking",
    questions: [
      { q: "How do I enroll in Wells Fargo Online?", a: "Visit wellsfargo.com and click 'Enroll Now'. You'll need your Social Security number, account number, and email address. Follow the prompts to create your username and password." },
      { q: "How do I add an account to my online profile?", a: "Sign in to Wells Fargo Online, go to 'Account Services' then 'Link Accounts'. Enter the account number and follow the verification steps." },
      { q: "Why can't I sign in to my account?", a: "Common issues include incorrect username/password, account locked after too many attempts, or browser issues. Try resetting your password or clearing your browser cache." },
    ]
  },
  {
    category: "Mobile App",
    questions: [
      { q: "How do I deposit a check using my phone?", a: "Open the Wells Fargo Mobile app, select 'Deposit Checks', choose the account, enter the amount, and take photos of the front and back of your endorsed check." },
      { q: "What is the mobile deposit limit?", a: "Limits vary by account and customer relationship. Most customers can deposit up to $2,500 per day. Check your app for your specific limits." },
      { q: "How do I set up Face ID or Touch ID?", a: "In the app, go to Settings > Security & Sign On > Face ID/Touch ID and follow the prompts to enable biometric login." },
    ]
  },
  {
    category: "Cards & Payments",
    questions: [
      { q: "How do I activate my new debit/credit card?", a: "You can activate your card by calling the number on the sticker, through the Wells Fargo Mobile app, or at any Wells Fargo ATM using your PIN." },
      { q: "How do I report a lost or stolen card?", a: "Call 1-800-869-3557 immediately, available 24/7. You can also report through the mobile app under 'Card Management'." },
      { q: "How do I set up card alerts?", a: "Sign in to Wells Fargo Online or the mobile app, go to 'Alert Preferences', and customize the alerts you want to receive for purchases, balance changes, and more." },
    ]
  },
  {
    category: "Transfers & Payments",
    questions: [
      { q: "What is Zelle® and how does it work?", a: "Zelle is a fast way to send money to friends, family, and others you trust using just their email or phone number. Money is typically available within minutes." },
      { q: "How long do transfers take?", a: "Internal transfers between Wells Fargo accounts are immediate. External transfers typically take 1-3 business days. Wire transfers are usually same-day." },
      { q: "What are the transfer limits?", a: "Limits vary by transfer type and account. Online transfers between accounts are typically up to $50,000/day. Zelle limits are usually $2,500/day." },
    ]
  },
];

const resources = [
  { title: "Video Tutorials", desc: "Step-by-step visual guides", icon: Video, count: 50 },
  { title: "How-To Articles", desc: "Detailed written instructions", icon: BookOpen, count: 200 },
  { title: "Financial Tips", desc: "Money management advice", icon: Lightbulb, count: 75 },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof popularTopics>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const results = popularTopics.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <OfficialHeader variant="simple" />

      {/* Search Hero */}
      <div className="bg-[#cd1409] pb-8 pt-4">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-white text-2xl font-bold text-center mb-2">How can we help you?</h2>
          <p className="text-white/80 text-center mb-6">Search our knowledge base or browse topics below</p>
          <div className="relative">
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-lg text-base"
              data-testid="input-help-search"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          
          {searchResults.length > 0 && (
            <Card className="mt-2 absolute left-4 right-4 max-w-2xl mx-auto z-10">
              <CardContent className="p-0">
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 text-left hover-elevate border-b last:border-0"
                    data-testid={`search-result-${i}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{result.title}</p>
                      <p className="text-xs text-gray-500">{result.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Link href="/contact">
            <Button variant="outline" className="flex-shrink-0" data-testid="button-contact-us">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" className="flex-shrink-0" data-testid="button-call-us">
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </Button>
          </Link>
          <Link href="/locations">
            <Button variant="outline" className="flex-shrink-0" data-testid="button-find-location">
              <Building className="w-4 h-4 mr-2" />
              Find Location
            </Button>
          </Link>
        </div>

        {/* Help Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Topic</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {helpCategories.map((cat) => (
              <Card key={cat.name} className="hover-elevate cursor-pointer" data-testid={`card-category-${cat.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#cd1409]/10 flex items-center justify-center mb-3">
                    <cat.icon className="w-6 h-6 text-[#cd1409]" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{cat.name}</h4>
                  <p className="text-xs text-gray-500">{cat.topics} topics</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#cd1409]" />
              Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {popularTopics.map((topic, i) => (
              <button
                key={i}
                className="w-full flex items-center justify-between p-4 text-left hover-elevate border-b last:border-0"
                data-testid={`link-topic-${i}`}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{topic.title}</p>
                  <p className="text-xs text-gray-500">{topic.category} • {topic.views} views</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* FAQs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          {faqs.map((section) => (
            <Card key={section.category} className="mb-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-base text-[#cd1409]">{section.category}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Accordion type="single" collapsible>
                  {section.questions.map((faq, i) => (
                    <AccordionItem key={i} value={`${section.category}-${i}`} className="border-b last:border-0">
                      <AccordionTrigger className="px-4 text-left text-sm font-medium" data-testid={`faq-${section.category}-${i}`}>
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
          ))}
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Resources</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {resources.map((resource) => (
              <Card key={resource.title} className="hover-elevate cursor-pointer" data-testid={`card-resource-${resource.title.toLowerCase().replace(/\s+/g, "-")}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffcd41]/20 flex items-center justify-center">
                      <resource.icon className="w-5 h-5 text-[#cd1409]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-xs text-gray-500">{resource.count}+ available</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{resource.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="bg-[#cd1409] text-white">
          <CardContent className="p-6 text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">Still Need Help?</h3>
            <p className="text-white/80 mb-4">Our customer service team is available 24/7</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="secondary" className="bg-white text-[#cd1409]" data-testid="button-contact-support">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <a href="tel:1-800-869-3557">
                <Button variant="outline" className="border-white text-white" data-testid="button-call-support">
                  <Phone className="w-4 h-4 mr-2" />
                  1-800-869-3557
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
