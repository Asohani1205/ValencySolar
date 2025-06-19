import { useQuery } from "@tanstack/react-query";
import { Shield, Eye, Headphones, Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Review } from "@shared/schema";

export default function TrustIndicators() {
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  return (
    <div className="space-y-6">
      {/* Why Trust Valency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Shield className="text-green-500 mr-2" size={20} />
            Why Trust Valency?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
            <div>
              <div className="font-medium text-green-800">Verified Vendors</div>
              <div className="text-sm text-green-600">All installers pre-screened</div>
            </div>
            <Shield className="text-green-500" size={20} />
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <div>
              <div className="font-medium text-blue-800">Transparent Pricing</div>
              <div className="text-sm text-blue-600">No hidden costs</div>
            </div>
            <Eye className="text-blue-500" size={20} />
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-800">Expert Support</div>
              <div className="text-sm text-purple-600">24/7 guidance</div>
            </div>
            <Headphones className="text-purple-500" size={20} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Star className="text-yellow-500 mr-2" size={20} />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="border-l-4 border-yellow-400 pl-4">
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400 text-sm mr-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-800">{review.customerName}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
              <span className="text-xs text-gray-400">
                {review.location} • {review.timeAgo}
              </span>
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full text-center text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-medium text-sm transition-colors"
          >
            View All Reviews <ArrowRight className="ml-1" size={14} />
          </Button>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50">
        <CardContent className="p-4 text-center">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">10,000+</div>
              <div className="text-emerald-800">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">500+</div>
              <div className="text-emerald-800">Verified Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">4.9/5</div>
              <div className="text-emerald-800">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">₹2Cr+</div>
              <div className="text-emerald-800">Savings Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
