import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Clock, Navigation, Search, Filter, ChevronDown, ChevronRight, Landmark, CreditCard, Building2, Accessibility, Car, Globe, X, Locate, ExternalLink, Printer, Star, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const sampleLocations = [
  {
    id: 1,
    type: "branch",
    name: "WELLS FARGO BANK",
    address: "100 Montgomery Street",
    city: "San Francisco",
    state: "CA",
    zip: "94104",
    phone: "(415) 396-7100",
    distance: "0.2",
    hours: { weekday: "9:00 AM - 5:00 PM", saturday: "9:00 AM - 1:00 PM", sunday: "Closed" },
    lobbyHours: "Mon-Fri 09:00 AM-05:00 PM",
    driveUpHours: null,
    services: ["Full Service Banking", "Safe Deposit Boxes", "Notary", "Mortgage Consultant", "Financial Advisor", "Business Banking"],
    features: ["Wheelchair Accessible", "24-Hour ATM"],
    atms: 4,
    open: true,
  },
  {
    id: 2,
    type: "branch",
    name: "WELLS FARGO BANK",
    address: "1 Embarcadero Center",
    city: "San Francisco",
    state: "CA",
    zip: "94111",
    phone: "(415) 983-6701",
    distance: "0.4",
    hours: { weekday: "9:00 AM - 5:00 PM", saturday: "Closed", sunday: "Closed" },
    lobbyHours: "Mon-Fri 09:00 AM-05:00 PM",
    driveUpHours: null,
    services: ["Full Service Banking", "Business Banking", "Wealth Management"],
    features: ["Wheelchair Accessible", "24-Hour ATM"],
    atms: 2,
    open: true,
  },
  {
    id: 3,
    type: "branch",
    name: "WELLS FARGO BANK",
    address: "44 Montgomery Street",
    city: "San Francisco",
    state: "CA",
    zip: "94104",
    phone: "(415) 477-1000",
    distance: "0.3",
    hours: { weekday: "9:00 AM - 5:00 PM", saturday: "9:00 AM - 2:00 PM", sunday: "Closed" },
    lobbyHours: "Mon-Fri 09:00 AM-05:00 PM, Sat 09:00 AM-02:00 PM",
    driveUpHours: null,
    services: ["Full Service Banking", "Safe Deposit Boxes", "Small Business Banking"],
    features: ["Wheelchair Accessible", "24-Hour ATM", "Spanish Speaking Staff"],
    atms: 3,
    open: true,
  },
  {
    id: 4,
    type: "atm",
    name: "WELLS FARGO ATM",
    address: "345 Spear Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    distance: "0.5",
    hours: { weekday: "24 Hours", saturday: "24 Hours", sunday: "24 Hours" },
    features: ["Deposit Capable", "Wheelchair Accessible"],
    open: true,
  },
  {
    id: 5,
    type: "atm",
    name: "WELLS FARGO ATM",
    address: "201 Mission Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    distance: "0.6",
    hours: { weekday: "24 Hours", saturday: "24 Hours", sunday: "24 Hours" },
    features: ["Deposit Capable"],
    open: true,
  },
  {
    id: 6,
    type: "branch",
    name: "WELLS FARGO BANK",
    address: "333 Market Street",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    phone: "(415) 243-2601",
    distance: "0.7",
    hours: { weekday: "9:00 AM - 6:00 PM", saturday: "10:00 AM - 2:00 PM", sunday: "Closed" },
    lobbyHours: "Mon-Fri 09:00 AM-06:00 PM, Sat 10:00 AM-02:00 PM",
    driveUpHours: null,
    services: ["Full Service Banking", "Safe Deposit Boxes", "Investment Services", "Mortgage Consultant"],
    features: ["Wheelchair Accessible", "24-Hour ATM", "Coin Counter"],
    atms: 6,
    open: true,
  },
];

export default function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState("San Francisco, CA");
  const [activeTab, setActiveTab] = useState<"all" | "branches" | "atms">("all");
  const [selectedLocation, setSelectedLocation] = useState<typeof sampleLocations[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    openNow: false,
    driveUp: false,
    wheelchair: false,
    depositAtm: false,
    safeDeposit: false,
    spanishSpeaking: false,
    saturdayHours: false,
  });
  const [radius, setRadius] = useState("10");
  const [sortBy, setSortBy] = useState("distance");

  const filteredLocations = useMemo(() => {
    let results = sampleLocations;
    
    if (activeTab === "branches") {
      results = results.filter(loc => loc.type === "branch");
    } else if (activeTab === "atms") {
      results = results.filter(loc => loc.type === "atm");
    }
    
    if (filters.openNow) {
      results = results.filter(loc => loc.open);
    }
    if (filters.driveUp) {
      results = results.filter(loc => loc.driveUpHours);
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
    if (filters.saturdayHours) {
      results = results.filter(loc => loc.hours?.saturday !== "Closed");
    }
    
    return results;
  }, [activeTab, filters]);

  const branchCount = sampleLocations.filter(l => l.type === "branch").length;
  const atmCount = sampleLocations.filter(l => l.type === "atm").length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#d71e28]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span
                className="text-white text-xl tracking-wide cursor-pointer"
                style={{ fontFamily: "'Times New Roman', 'Georgia', serif" }}
                data-testid="text-logo"
              >
                WELLS FARGO
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-xs text-white">
              <a href="#" className="hover:underline hidden sm:inline">Español</a>
              <a href="#" className="hover:underline hidden sm:inline">Help</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-[#ffcd41] h-1"></div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="text-[#d71e28] hover:underline">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Locator</span>
          </nav>
          
          <h1 className="text-3xl font-light text-gray-800 mb-1">Find a Wells Fargo Location</h1>
          <p className="text-gray-600">Find an ATM or banking location near you</p>
        </div>
      </div>

      <div className="bg-[#f8f8f8] border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by address, city, state or ZIP code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-white"
                    data-testid="input-location-search"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button className="bg-[#d71e28] hover:bg-[#b91c23] text-white h-11 px-6" data-testid="button-search-locations">
                  Search
                </Button>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                className="h-11 border-[#d71e28] text-[#d71e28] hover:bg-red-50"
                data-testid="button-use-location"
              >
                <Locate className="w-4 h-4 mr-2" />
                Use my location
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Search radius:</label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-28 h-9 bg-white" data-testid="select-radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-[#d71e28]"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide filters" : "More filters"}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg border" data-testid="filter-panel">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Filter by</h3>
                <button 
                  className="text-sm text-[#d71e28] hover:underline"
                  onClick={() => setFilters({
                    openNow: false,
                    driveUp: false,
                    wheelchair: false,
                    depositAtm: false,
                    safeDeposit: false,
                    spanishSpeaking: false,
                    saturdayHours: false,
                  })}
                >
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "openNow", label: "Open now", icon: Clock },
                  { id: "saturdayHours", label: "Saturday hours", icon: Clock },
                  { id: "driveUp", label: "Drive-up services", icon: Car },
                  { id: "wheelchair", label: "Wheelchair accessible", icon: Accessibility },
                  { id: "depositAtm", label: "Deposit-capable ATM", icon: CreditCard },
                  { id: "safeDeposit", label: "Safe deposit boxes", icon: Building2 },
                  { id: "spanishSpeaking", label: "Spanish speaking", icon: Globe },
                ].map((filter) => (
                  <div key={filter.id} className="flex items-center gap-2">
                    <Checkbox
                      id={filter.id}
                      checked={filters[filter.id as keyof typeof filters]}
                      onCheckedChange={(checked) => setFilters({ ...filters, [filter.id]: checked as boolean })}
                      data-testid={`checkbox-${filter.id}`}
                    />
                    <Label htmlFor={filter.id} className="text-sm text-gray-600 cursor-pointer">
                      {filter.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-full lg:w-[420px] flex-shrink-0 border-r overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <div className="bg-white border-b sticky top-0 z-10">
            <div className="flex">
              {[
                { id: "all", label: "All", count: sampleLocations.length },
                { id: "branches", label: "Branches", count: branchCount },
                { id: "atms", label: "ATMs", count: atmCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-[#d71e28] border-[#d71e28]"
                      : "text-gray-600 border-transparent hover:text-gray-800"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600" data-testid="text-results-count">
              {filteredLocations.length} results near <strong>{searchQuery}</strong>
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-gray-600 h-8">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                Sort
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 h-8">
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {filteredLocations.map((location, index) => (
              <div
                key={location.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedLocation?.id === location.id ? "bg-red-50" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedLocation(location)}
                data-testid={`card-location-${location.id}`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#d71e28] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            location.type === "branch" 
                              ? "bg-[#d71e28] text-white" 
                              : "bg-gray-200 text-gray-700"
                          }`}>
                            {location.type === "branch" ? "BRANCH" : "ATM"}
                          </span>
                          {location.open && (
                            <span className="text-xs text-green-600 font-medium">Open now</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">{location.name}</h3>
                        <p className="text-sm text-gray-600">{location.address}</p>
                        <p className="text-sm text-gray-600">{location.city}, {location.state} {location.zip}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">{location.distance} mi</p>
                      </div>
                    </div>

                    {location.type === "branch" && location.lobbyHours && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">Lobby:</span> {location.lobbyHours}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      {location.phone && (
                        <a
                          href={`tel:${location.phone}`}
                          className="text-xs text-[#d71e28] hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`link-phone-${location.id}`}
                        >
                          <Phone className="w-3 h-3" />
                          {location.phone}
                        </a>
                      )}
                      <button
                        className="text-xs text-[#d71e28] hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`button-directions-${location.id}`}
                      >
                        <Navigation className="w-3 h-3" />
                        Get directions
                      </button>
                    </div>

                    {selectedLocation?.id === location.id && location.type === "branch" && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Hours</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Mon - Fri</span>
                                <span>{location.hours.weekday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Saturday</span>
                                <span>{location.hours.saturday}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sunday</span>
                                <span>{location.hours.sunday}</span>
                              </div>
                            </div>
                          </div>

                          {location.services && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Services</h4>
                              <div className="flex flex-wrap gap-1">
                                {location.services.map((service) => (
                                  <span key={service} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {location.features && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Features</h4>
                              <div className="flex flex-wrap gap-1">
                                {location.features.map((feature) => (
                                  <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-[#d71e28] text-white text-xs" data-testid={`button-schedule-${location.id}`}>
                              Schedule appointment
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs" data-testid={`button-details-${location.id}`}>
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-gray-200 items-center justify-center relative">
          <div className="absolute inset-0 bg-[#e8e4df]">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-[#d71e28] mx-auto mb-4 opacity-50" />
                <p className="text-gray-500 text-lg">Map View</p>
                <p className="text-gray-400 text-sm mt-1">Interactive map showing {filteredLocations.length} locations</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Button size="sm" variant="secondary" className="bg-white shadow-md">
              <MapPin className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button size="sm" variant="secondary" className="bg-white shadow-md">
              Satellite
            </Button>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="bg-white shadow-md w-8 h-8">
              +
            </Button>
            <Button size="icon" variant="secondary" className="bg-white shadow-md w-8 h-8">
              -
            </Button>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Privacy, Cookies, Security & Legal</a>
              <a href="#" className="hover:underline">Report Fraud</a>
              <a href="#" className="hover:underline">Sitemap</a>
            </div>
            <p data-testid="text-copyright">
              © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
