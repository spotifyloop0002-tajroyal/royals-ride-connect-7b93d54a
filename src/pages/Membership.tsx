import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Award } from "lucide-react";

const Membership = () => {
  const benefits = [
    "Access to all club rides and events",
    "Official club merchandise and gear",
    "Priority registration for long rides",
    "Discounts on riding gear from partners",
    "Free mechanical support during rides",
    "Club stickers and patches",
    "Exclusive member-only meetups",
    "Vote in club decisions",
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center animate-fade-in">Join The Brotherhood</h1>
          <p className="text-center text-muted-foreground mb-12 animate-fade-in">
            Become a lifetime member of Agra's premier riders club
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="animate-fade-in">
              <CardHeader className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-primary" />
                <CardTitle className="text-3xl">Lifetime Membership</CardTitle>
                <div className="text-5xl font-bold text-primary mt-4">₹999</div>
                <p className="text-muted-foreground">One-time payment</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Membership Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" placeholder="Enter your name" />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Choose username" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>

                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" placeholder="+91 XXXXX XXXXX" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bike">Bike Model</Label>
                      <Input id="bike" placeholder="e.g., Royal Enfield" />
                    </div>
                    <div>
                      <Label htmlFor="license">License Number</Label>
                      <Input id="license" placeholder="DL number" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="blood">Blood Group</Label>
                      <Input id="blood" placeholder="e.g., O+" />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years Driven</Label>
                      <Input id="experience" type="number" placeholder="Years" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input id="emergency" placeholder="Name & Number" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" defaultValue="India" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photo">Profile Photo</Label>
                    <Input id="photo" type="file" accept="image/*" />
                  </div>

                  <Button variant="gold" className="w-full" size="lg" type="button">
                    Pay ₹999 & Join Now
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By registering, you agree to our terms and conditions
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Membership;
