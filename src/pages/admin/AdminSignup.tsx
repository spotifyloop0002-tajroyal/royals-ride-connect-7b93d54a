import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminSignup() {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    admin_code: "",
  });

  useEffect(() => {
    if (user && (isAdmin || isSuperAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (signupData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Admin access code validation (you can set this to any secret code)
    const ADMIN_ACCESS_CODE = "TAJROYALS2024"; // Change this to your secure code
    if (signupData.admin_code !== ADMIN_ACCESS_CODE) {
      toast.error("Invalid admin access code");
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/admin`;

      // Create the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.full_name,
            username: signupData.email.split('@')[0] + '_admin',
          }
        }
      });

      if (signupError) throw signupError;

      if (authData.user) {
        // Wait a moment for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the auto-assigned 'user' role to 'super_admin'
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'super_admin' })
          .eq('user_id', authData.user.id)
          .eq('role', 'user');

        if (roleError) {
          console.error('Role assignment error:', roleError);
          toast.error('Account created but role assignment failed. Contact system administrator.');
        } else {
          toast.success('Super admin account created successfully!');
          setTimeout(() => {
            navigate('/admin/login');
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Admin Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            The Taj Royals - Core Team Registration
          </p>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              You need a valid admin access code to create an account. Contact the system administrator if you don't have one.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Your full name"
                value={signupData.full_name}
                onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@tajroyals.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Create a strong password (min 8 chars)"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="admin-code">Admin Access Code</Label>
              <Input
                id="admin-code"
                type="password"
                placeholder="Enter admin access code"
                value={signupData.admin_code}
                onChange={(e) => setSignupData({ ...signupData, admin_code: e.target.value })}
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Contact your team lead for the access code
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Super Admin Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an admin account?
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/admin/login')}
            >
              Sign In to Admin Panel
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/')}
              className="block mx-auto text-xs"
            >
              ← Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
