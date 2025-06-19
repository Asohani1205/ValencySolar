import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Plus, MessageSquare, ThumbsUp, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Review } from "@shared/schema";

interface UserReviewsProps {
  limit?: number;
  showAddReview?: boolean;
}

export default function UserReviews({ limit, showAddReview = true }: UserReviewsProps) {
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    customerName: "",
    rating: 5,
    comment: "",
    location: "",
    systemSize: "",
    vendorName: "",
    installationDate: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await apiRequest("POST", "/api/reviews", {
        ...reviewData,
        timeAgo: "Just now"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      setIsAddingReview(false);
      setNewReview({
        customerName: "",
        rating: 5,
        comment: "",
        location: "",
        systemSize: "",
        vendorName: "",
        installationDate: ""
      });
      toast({
        title: "Review Added",
        description: "Thank you for sharing your solar experience!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (!newReview.customerName || !newReview.comment || !newReview.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addReviewMutation.mutate(newReview);
  };

  const displayedReviews = limit ? reviews.slice(0, limit) : reviews;
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 text-blue-600" size={20} />
              Community Reviews
            </CardTitle>
            {showAddReview && (
              <Dialog open={isAddingReview} onOpenChange={setIsAddingReview}>
                <DialogTrigger asChild>
                  <Button size="sm" className="solar-gradient text-white">
                    <Plus className="mr-2" size={16} />
                    Share Experience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Your Solar Experience</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={newReview.customerName}
                        onChange={(e) => setNewReview({...newReview, customerName: e.target.value})}
                        placeholder="e.g., Rajesh K."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={newReview.location}
                        onChange={(e) => setNewReview({...newReview, location: e.target.value})}
                        placeholder="e.g., Bangalore, Karnataka"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rating">Rating *</Label>
                      <div className="flex items-center space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`cursor-pointer ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            size={20}
                            onClick={() => setNewReview({...newReview, rating: star})}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({newReview.rating}/5)</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="system-size">System Size</Label>
                      <Input
                        id="system-size"
                        value={newReview.systemSize}
                        onChange={(e) => setNewReview({...newReview, systemSize: e.target.value})}
                        placeholder="e.g., 5 kW"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vendor">Installer/Vendor</Label>
                      <Input
                        id="vendor"
                        value={newReview.vendorName}
                        onChange={(e) => setNewReview({...newReview, vendorName: e.target.value})}
                        placeholder="e.g., SunTech Solar"
                      />
                    </div>

                    <div>
                      <Label htmlFor="comment">Your Experience *</Label>
                      <Textarea
                        id="comment"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        placeholder="Share your experience with solar installation, savings, vendor service, etc..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleSubmitReview}
                      disabled={addReviewMutation.isPending}
                      className="w-full solar-gradient text-white"
                    >
                      {addReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        {reviews.length > 0 && (
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Star className="text-yellow-400 mr-1" size={20} fill="currentColor" />
                <span className="text-xl font-bold">{averageRating.toFixed(1)}</span>
                <span className="text-gray-600 ml-1">/ 5</span>
              </div>
              <div className="text-sm text-gray-600">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''} from real users
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {displayedReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share your solar experience!</p>
              {showAddReview && (
                <Button onClick={() => setIsAddingReview(true)} className="solar-gradient text-white">
                  <Plus className="mr-2" size={16} />
                  Add First Review
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          displayedReviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-800">{review.customerName}</span>
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="text-yellow-400" size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="mr-1" size={12} />
                        {review.location}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1" size={12} />
                        {review.timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                
                {/* Additional Review Details */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Verified User
                  </Badge>
                  {review.rating >= 4 && (
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Satisfied Customer
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {limit && reviews.length > limit && (
        <div className="text-center">
          <Button variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
            View All {reviews.length} Reviews
          </Button>
        </div>
      )}
    </div>
  );
}