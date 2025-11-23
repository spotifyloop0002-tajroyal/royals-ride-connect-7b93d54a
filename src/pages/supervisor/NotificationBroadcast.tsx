import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function NotificationBroadcast() {
  const { toast } = useToast();
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    type: "all", // all, selected, individual
    recipients: [] as string[],
  });

  const { data: users } = useQuery({
    queryKey: ["users-for-notification"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const handleSendNotification = async () => {
    if (!notificationData.title || !notificationData.message) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    // Create announcement that will show as notification
    const { error } = await supabase.from("announcements").insert({
      title: notificationData.title,
      description: notificationData.message,
      is_active: true,
      show_as_popup: true,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Notification sent to ${
        notificationData.type === "all" ? "all users" : "selected users"
      }`,
    });

    // Reset form
    setNotificationData({
      title: "",
      message: "",
      type: "all",
      recipients: [],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notification Broadcast</h1>
        <p className="text-muted-foreground">
          Send notifications to members via email, SMS, push, and in-app alerts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={notificationData.title}
              onChange={(e) =>
                setNotificationData({ ...notificationData, title: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter notification message"
              rows={5}
              value={notificationData.message}
              onChange={(e) =>
                setNotificationData({ ...notificationData, message: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="recipient-type">Recipient Type</Label>
            <Select
              value={notificationData.type}
              onValueChange={(value) =>
                setNotificationData({ ...notificationData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="selected">Selected Users</SelectItem>
                <SelectItem value="individual">Individual User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(notificationData.type === "selected" ||
            notificationData.type === "individual") && (
            <div>
              <Label>Select Recipients</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={user.id}
                      className="rounded"
                      checked={notificationData.recipients.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNotificationData({
                            ...notificationData,
                            recipients: [...notificationData.recipients, user.id],
                          });
                        } else {
                          setNotificationData({
                            ...notificationData,
                            recipients: notificationData.recipients.filter(
                              (id) => id !== user.id
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={user.id} className="cursor-pointer">
                      {user.full_name} ({user.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notification Channels</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Email</Badge>
              <Badge variant="secondary">SMS</Badge>
              <Badge variant="secondary">Push Notification</Badge>
              <Badge variant="secondary">In-App Alert</Badge>
            </div>
          </div>

          <Button onClick={handleSendNotification} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
      {children}
    </span>
  );
}
