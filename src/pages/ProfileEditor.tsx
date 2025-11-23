import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Upload, Save, Lock } from "lucide-react";

export default function ProfileEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [uploading, setUploading] = useState(false);

  // Fetch current profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-edit', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bike_model: profile?.bike_model || "",
    bike_number_plate: profile?.bike_number_plate || "",
    blood_group: profile?.blood_group || "",
    mobile: profile?.mobile || "",
    email: profile?.email || "",
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bike_model: profile.bike_model || "",
        bike_number_plate: profile.bike_number_plate || "",
        blood_group: profile.blood_group || "",
        mobile: profile.mobile || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("No user found");
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-edit', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast.success('Profile updated successfully');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'profile' | 'license' | 'plate') => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      const bucket = fileType === 'profile' ? 'profile-photos' : 'documents';
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${fileType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Update profile with the file URL
      const updateField = fileType === 'profile' 
        ? 'profile_photo_url' 
        : fileType === 'license' 
        ? 'license_number' 
        : 'bike_number_plate';

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile-edit', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      toast.success(`${fileType === 'profile' ? 'Profile photo' : fileType === 'license' ? 'Driving license' : 'Number plate'} uploaded successfully`);
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Member ID - Locked */}
              <div>
                <Label>Member ID</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-semibold text-primary">{profile?.member_id}</span>
                  <span className="text-sm text-muted-foreground">(Locked)</span>
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <Label htmlFor="profile-photo">Profile Photo</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-6xl">
                    {profile?.profile_photo_url ? (
                      <img 
                        src={profile.profile_photo_url} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profile')}
                      disabled={uploading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a profile picture (JPG, PNG)
                    </p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username / Display Name</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Your username"
                />
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              {/* Bike Model */}
              <div>
                <Label htmlFor="bike_model">Bike Model</Label>
                <Input
                  id="bike_model"
                  value={formData.bike_model}
                  onChange={(e) => setFormData({ ...formData, bike_model: e.target.value })}
                  placeholder="e.g., Royal Enfield Classic 350"
                />
              </div>

              {/* Bike Number Plate */}
              <div>
                <Label htmlFor="bike_number_plate">Bike Number Plate</Label>
                <Input
                  id="bike_number_plate"
                  value={formData.bike_number_plate}
                  onChange={(e) => setFormData({ ...formData, bike_number_plate: e.target.value })}
                  placeholder="e.g., KA-01-AB-1234"
                />
                <div className="mt-2">
                  <Label htmlFor="plate-photo">Number Plate Photo</Label>
                  <Input
                    id="plate-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'plate')}
                    disabled={uploading}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a photo of your bike's number plate
                  </p>
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select 
                  value={formData.blood_group} 
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mobile */}
              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="Your mobile number"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Your email address"
                />
              </div>

              {/* Driving License */}
              <div>
                <Label htmlFor="license">Driving License</Label>
                <Input
                  id="license"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, 'license')}
                  disabled={uploading}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a copy of your driving license (Image or PDF)
                </p>
                {profile?.license_number && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current: <a href={profile.license_number} target="_blank" rel="noopener noreferrer" className="text-primary underline">View uploaded license</a>
                  </p>
                )}
              </div>

              {/* Save Button */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={() => updateProfileMutation.mutate(formData)}
                  disabled={updateProfileMutation.isPending || uploading}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={updateProfileMutation.isPending || uploading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
