import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center animate-fade-in">Get In Touch</h1>
          <p className="text-center text-muted-foreground mb-12 animate-fade-in">
            Have questions? We'd love to hear from you
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="animate-fade-in">
              <CardHeader>
                <Phone className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Call us for immediate assistance
                </p>
                <a
                  href="tel:+919319331420"
                  className="text-xl font-semibold text-primary hover:underline"
                >
                  +91 93193 31420
                </a>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <MessageCircle className="w-12 h-12 text-primary mb-2" />
                <CardTitle>WhatsApp Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join our active WhatsApp community
                </p>
                <Button variant="gold" className="w-full">Join WhatsApp Group</Button>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <Mail className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Send us an email anytime
                </p>
                <a
                  href="mailto:info@thetajroyals.com"
                  className="text-lg font-semibold text-primary hover:underline"
                >
                  info@thetajroyals.com
                </a>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mb-2" />
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Visit us in Agra
                </p>
                <address className="not-italic">
                  Agra, Uttar Pradesh<br />
                  India
                </address>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227748.99971108268!2d77.87991835!3d27.17669335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39747121d702ff6d%3A0xdd2ae4803f767dde!2sAgra%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
