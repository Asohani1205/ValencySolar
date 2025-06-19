import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Award, Phone, Mail, Globe, CheckCircle, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Vendor } from "@shared/schema";

interface VendorComparisonProps {
  pincode: string;
  systemSize?: number;
}

export default function VendorComparison({ pincode, systemSize = 3 }: VendorComparisonProps) {
  const [selectedVendors, setSelectedVendors] = useState<Vendor[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/vendors/${pincode}`],
  });

  const toggleVendorSelection = (vendor: Vendor) => {
    setSelectedVendors(prev => {
      const isSelected = prev.find(v => v.id === vendor.id);
      if (isSelected) {
        return prev.filter(v => v.id !== vendor.id);
      } else if (prev.length < 3) {
        return [...prev, vendor];
      }
      return prev;
    });
  };

  const sortedVendors = [...vendors].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return parseFloat(a.priceRange.split(' - ')[0].replace(/[^\d]/g, '')) - 
               parseFloat(b.priceRange.split(' - ')[0].replace(/[^\d]/g, ''));
      case 'experience':
        return b.experienceYears - a.experienceYears;
      default:
        return 0;
    }
  });

  const getEstimatedCost = (vendor: Vendor) => {
    const priceRange = vendor.priceRange.match(/₹([\d,]+)/g) || [];
    if (priceRange.length >= 2) {
      const minPrice = parseInt(priceRange[0].replace(/[^\d]/g, ''));
      const maxPrice = parseInt(priceRange[1].replace(/[^\d]/g, ''));
      const avgPrice = (minPrice + maxPrice) / 2;
      return (avgPrice * (systemSize || 3)).toLocaleString();
    }
    return "Contact for quote";
  };

  return (
    <div className="space-y-6">
      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Choose Vendors to Compare</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'rating' ? 'price' : sortBy === 'price' ? 'experience' : 'rating')}
                className="text-xs"
              >
                <ArrowUpDown className="mr-1" size={12} />
                {sortBy === 'rating' ? 'Rating' : sortBy === 'price' ? 'Price' : 'Experience'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">Select up to 3 vendors to compare their services, pricing, and offerings</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {sortedVendors.map((vendor) => {
              const isSelected = selectedVendors.find(v => v.id === vendor.id);
              return (
                <Card 
                  key={vendor.id} 
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected ? 'border-orange-500 bg-orange-50' : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleVendorSelection(vendor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{vendor.name}</h4>
                      {isSelected ? (
                        <CheckCircle className="text-orange-500" size={16} />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mb-2">
                      <Star className="text-yellow-400 mr-1" size={12} />
                      <span>{vendor.rating} ({vendor.reviewCount})</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{vendor.priceRange}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {vendor.experienceYears}+ years
                      </Badge>
                      {vendor.financingOptions.slice(0, 2).map((option, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Comparison</CardTitle>
            <p className="text-sm text-gray-600">
              Detailed comparison for your {systemSize}kW solar system
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="financing">Financing</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Vendor</th>
                        {selectedVendors.map(vendor => (
                          <th key={vendor.id} className="text-center p-2 min-w-[200px]">
                            {vendor.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Rating</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            <div className="flex items-center justify-center">
                              <Star className="text-yellow-400 mr-1" size={14} />
                              {vendor.rating} ({vendor.reviewCount})
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Experience</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            {vendor.experienceYears} years
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Installations</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            {vendor.installationsCompleted}+
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Warranty</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            {vendor.warrantyYears} years
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Response Time</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            {vendor.responseTime}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cost Details</th>
                        {selectedVendors.map(vendor => (
                          <th key={vendor.id} className="text-center p-2">
                            {vendor.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Price Range</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2">
                            {vendor.priceRange}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-medium">Estimated Total ({systemSize}kW)</td>
                        {selectedVendors.map(vendor => (
                          <td key={vendor.id} className="text-center p-2 font-semibold text-green-600">
                            ₹{getEstimatedCost(vendor)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="financing" className="space-y-4">
                <div className="grid gap-4">
                  {selectedVendors.map(vendor => (
                    <Card key={vendor.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{vendor.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {vendor.financingOptions.map((option, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <div className="grid gap-4">
                  {selectedVendors.map(vendor => (
                    <Card key={vendor.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{vendor.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Specializations</h5>
                            <div className="flex flex-wrap gap-2">
                              {vendor.specializations.map((spec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Services Offered</h5>
                            <div className="flex flex-wrap gap-2">
                              {vendor.servicesOffered.map((service, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Certifications</h5>
                            <div className="flex flex-wrap gap-2">
                              {vendor.certifications.map((cert, idx) => (
                                <Badge key={idx} className="text-xs bg-green-100 text-green-800">
                                  <Award className="mr-1" size={10} />
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Contact Actions */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-3">Get Quotes from Selected Vendors</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {selectedVendors.map(vendor => (
                  <Card key={vendor.id} className="text-center">
                    <CardContent className="p-4">
                      <h5 className="font-medium mb-2">{vendor.name}</h5>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full solar-gradient text-white">
                          <Phone className="mr-2" size={14} />
                          Call Now
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Mail className="mr-2" size={14} />
                          Get Quote
                        </Button>
                        {vendor.website && (
                          <Button variant="ghost" size="sm" className="w-full">
                            <Globe className="mr-2" size={14} />
                            Visit Website
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}