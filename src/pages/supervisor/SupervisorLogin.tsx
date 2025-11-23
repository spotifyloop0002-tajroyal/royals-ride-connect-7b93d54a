import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUPERVISOR_ACCESS_CODE = "TAJROYALS2025SUPERVISOR";

export default function SupervisorLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (localStorage.getItem("supervisor_access") === "granted") {
      navigate("/supervisor");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (accessCode === SUPERVISOR_ACCESS_CODE) {
      localStorage.setItem("supervisor_access", "granted");
      toast({
        title: "Access Granted",
        description: "Welcome to Supervisor Panel",
      });
      navigate("/supervisor");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Access denied. Please check the code and try again.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Supervisor Access</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the supervisor access code to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="access-code">Access Code</Label>
              <Input
                id="access-code"
                type="password"
                placeholder="Enter supervisor access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Login"}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs"
            >
              ← Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
