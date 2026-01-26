import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Navigation, Search, Filter, ChevronDown, ArrowLeft, Landmark, CreditCard, Building2, Accessibility, Car, Globe } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sampleLocations = [
  {
    id: 1,
    type: "branch",
    name: "Wells Fargo Bank - Downtown Financial Center",
    address: "100 Main Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "(415) 555-0100",
    distance: "0.3 mi",
    hours: { weekday: "9:00 AM - 5:00 PM", saturday: "9:00 AM - 1:00 PM", sunday: "Closed" },
    services: ["Full Service Banking", "Safe Deposit Boxes", "Notary", "Mortgage Consultant", "Financial Advisor"],
    features: ["Drive-Thru", "Wheelchair Accessible", "24-Hour ATM", "Spanish Speaking Staff"],
    atms: 4,
  },
  {
    id: 2,
    type: "branch",
    name: "Wells Fargo Bank - Market Street",
    address: "555 Market Street",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    phone: "(415) 555-0200",
    distance: "0.7 mi",
    hours: { weekday: "9:00 AM - 6:00 PM", saturday: "9:00 AM - 2:00 PM", sunday: "Closed" },
    services: ["Full Service Banking", "Business Banking", "Wealth Management", "Safe Deposit Boxes"],
    features: ["Wheelchair Accessible", "24-Hour ATM", "Coin Counter"],
    atms: 6,
  },
  {
    id: 3,
    type: "atm",
    name: "Wells Fargo ATM - Walgreens",
    address: "789 Mission Street",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    distance: "0.4 mi",
    hours: { weekday: "24 Hours", saturday: "24 Hours", sunday: "24 Hours" },
    features: ["Deposit Capable", "Wheelchair Accessible"],
  },
  {
    id: 4,
    type: "atm",
    name: "Wells Fargo ATM - Safeway",
    address: "1234 Folsom Street",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    distance: "0.9 mi",
    hours: { weekday: "6:00 AM - 11:00 PM", saturday: "6:00 AM - 11:00 PM", sunday: "7:00 AM - 10:00 PM" },
    features: ["Deposit Capable"],
  },
  {
    id: 5,
    type: "branch",
    name: "Wells Fargo Bank - Union Square",
    address: "200 Post Street",
    city: "San Francisco",
    state: "CA",
    zip: "94108",
    phone: "(415) 555-0300",
    distance: "1.2 mi",
    hours: { weekday: "9:00 AM - 5:00 PM", saturday: "10:00 AM - 2:00 PM", sunday: "Closed" },
    services: ["Full Service Banking", "Small Business Banking", "Investment Services"],
    features: ["Wheelchair Accessible", "24-Hour ATM"],
    atms: 3,
  },
];

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<typeof sampleLocations[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    driveThru: false,
    wheelchair: false,
    depositAtm: false,
    safeDeposit: false,
    spanishSpeaking: false,
  });
  const [radius, setRadius] = useState("10");

  const filteredLocations = useMemo(() => {
    let results = sampleLocations;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(loc => 
        loc.name.toLowerCase().includes(query) ||
        loc.address.toLowerCase().includes(query) ||
        loc.city.toLowerCase().includes(query) ||
        loc.state.toLowerCase().includes(query) ||
        loc.zip.includes(query)
      );
    }
    
    if (activeTab === "branches") {
      results = results.filter(loc => loc.type === "branch");
    } else if (activeTab === "atms") {
      results = results.filter(loc => loc.type === "atm");
    }
    
    if (filters.driveThru) {
      results = results.filter(loc => loc.features?.includes("Drive-Thru"));
    }
    if (filters.wheelchair) {
      results = results.filter(loc => loc.features?.includes("Wheelchair Accessible"));
    }
    if (filters.depositAtm) {
      results = results.filter(loc => loc.features?.includes("Deposit Capable") || loc.features?.includes("24-Hour ATM"));
    }
    if (filters.safeDeposit) {
      results = results.filter(loc => loc.services?.includes("Safe Deposit Boxes"));
    }
    if (filters.spanishSpeaking) {
      results = results.filter(loc => loc.features?.includes("Spanish Speaking Staff"));
    }
    
    return results;
  }, [activeTab, filters, searchQuery]);

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
            <h1 className="text-white text-lg font-semibold">Find a Location</h1>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Enter city, state, or ZIP code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
                data-testid="input-location-search"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button className="bg-[#d71e28] text-white h-11 px-6" data-testid="button-search-locations">
              Search
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#d71e28]"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Within</span>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-24 h-8" data-testid="select-radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg" data-testid="filter-panel">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: "driveThru", label: "Drive-Thru", icon: Car },
                  { id: "wheelchair", label: "Wheelchair Accessible", icon: Accessibility },
                  { id: "depositAtm", label: "Deposit-Capable ATM", icon: CreditCard },
                  { id: "safeDeposit", label: "Safe Deposit Boxes", icon: Building2 },
                  { id: "spanishSpeaking", label: "Spanish Speaking", icon: Globe },
                ].map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2">
                    <Checkbox
                      id={filter.id}
                      checked={filters[filter.id as keyof typeof filters]}
                      onCheckedChange={(checked) => setFilters({ ...filters, [filter.id]: checked })}
                      data-testid={`checkbox-${filter.id}`}
                    />
                    <Label htmlFor={filter.id} className="text-sm text-gray-600 flex items-center gap-1.5 cursor-pointer">
                      <filter.icon className="w-3.5 h-3.5" />
                      {filter.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-t bg-transparent h-auto p-0">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#d71e28] data-[state=active]:bg-transparent py-3"
              data-testid="tab-all"
            >
              All ({sampleLocations.length})
            </TabsTrigger>
            <TabsTrigger
              value="branches"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#d71e28] data-[state=active]:bg-transparent py-3"
              data-testid="tab-branches"
            >
              Branches ({sampleLocations.filter(l => l.type === "branch").length})
            </TabsTrigger>
            <TabsTrigger
              value="atms"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-[#d71e28] data-[state=active]:bg-transparent py-3"
              data-testid="tab-atms"
            >
              ATMs ({sampleLocations.filter(l => l.type === "atm").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <p className="text-sm text-gray-500 mb-4" data-testid="text-results-count">
          {filteredLocations.length} locations found near San Francisco, CA
        </p>

        <div className="space-y-3">
          {filteredLocations.map((location) => (
            <Card 
              key={location.id} 
              className={`cursor-pointer transition-shadow hover:shadow-md ${selectedLocation?.id === location.id ? "ring-2 ring-[#d71e28]" : ""}`}
              onClick={() => setSelectedLocation(location)}
              data-testid={`card-location-${location.id}`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {location.type === "branch" ? (
                        <Landmark className="w-4 h-4 text-[#d71e28]" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-[#d71e28]" />
                      )}
                      <span className="text-xs font-medium text-[#d71e28] uppercase">
                        {location.type === "branch" ? "Branch & ATM" : "ATM"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                    <p className="text-sm text-gray-600">{location.address}</p>
                    <p className="text-sm text-gray-600">{location.city}, {location.state} {location.zip}</p>
                    
                    {location.phone && (
                      <a href={`tel:${location.phone}`} className="flex items-center gap-1.5 text-sm text-[#d71e28] mt-2" data-testid={`link-phone-${location.id}`}>
                        <Phone className="w-3.5 h-3.5" />
                        {location.phone}
                      </a>
                    )}
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Today: {location.hours.weekday}</span>
                    </div>

                    {location.features && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {location.features.slice(0, 3).map((feature) => (
                          <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {feature}
                          </span>
                        ))}
                        {location.features.length > 3 && (
                          <span className="text-xs text-gray-500">+{location.features.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-gray-900">{location.distance}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-[#d71e28] border-[#d71e28]"
                      onClick={(e) => { e.stopPropagation(); }}
                      data-testid={`button-directions-${location.id}`}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>

                {selectedLocation?.id === location.id && location.type === "branch" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Hours</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><span className="font-medium">Mon-Fri:</span> {location.hours.weekday}</p>
                          <p><span className="font-medium">Saturday:</span> {location.hours.saturday}</p>
                          <p><span className="font-medium">Sunday:</span> {location.hours.sunday}</p>
                        </div>
                      </div>
                      {location.services && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Services</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {location.services.map((service) => (
                              <li key={service} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-[#d71e28] rounded-full" />
                                {service}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="flex-1 bg-[#d71e28] text-white" data-testid={`button-schedule-${location.id}`}>
                        Schedule Appointment
                      </Button>
                      <Button variant="outline" className="flex-1" data-testid={`button-call-${location.id}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Branch
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
