import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Star, Zap, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@shared/schema";

interface VendorSectionProps {
  pincode: string;
}

export default function VendorSection({ pincode }: VendorSectionProps) {
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: [`/api/vendors/${pincode}`],
  });

  const handleContactVendor = (vendor: Vendor) => {
    // In a real app, this would open a contact form or redirect to vendor details
    alert(`Contact ${vendor.name} for a quote. In a real app, this would open a contact form or connect you directly with the vendor.`);
  };

  if (vendors.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-gray-800">
            Connect with Verified Solar Installers in Your Area
          </CardTitle>
          <p className="text-gray-600">
            Pre-screened professionals ready to provide quotes and installation services
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="border-2 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Zap className="text-orange-600" size={16} />
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="text-yellow-400 mr-1" size={14} />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-gray-500 ml-1">({vendor.reviewCount})</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-1">{vendor.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{vendor.description}</p>

                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="mr-2" size={12} />
                      <span>{vendor.distance} km away</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2" size={12} />
                      <span>{vendor.responseTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      Certified
                    </Badge>
                    {vendor.rating >= 4.8 && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Top Rated
                      </Badge>
                    )}
                    {vendor.responseTime.includes('1 hour') && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                        Quick Response
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleContactVendor(vendor)}
                      className="w-full solar-gradient text-white font-medium hover:shadow-md transition-all duration-200"
                    >
                      <Phone className="mr-2" size={14} />
                      Get Quote
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleContactVendor(vendor)}
                      className="w-full text-sm"
                    >
                      <Mail className="mr-2" size={14} />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help choosing? Our AI assistant can help you compare vendors.
            </p>
            <Button variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
              Compare All Vendors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
