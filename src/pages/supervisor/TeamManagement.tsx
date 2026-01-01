import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit2, User, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface SortableTeamItemProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
  isDeleting: boolean;
}

function SortableTeamItem({ member, onEdit, onDelete, onToggleActive, isDeleting }: SortableTeamItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg bg-background"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-shrink-0">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{member.name}</p>
        <p className="text-sm text-muted-foreground">{member.role}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={member.is_active}
          onCheckedChange={(checked) => onToggleActive(member.id, checked)}
        />
        <span className="text-sm text-muted-foreground w-16">
          {member.is_active ? "Active" : "Hidden"}
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(member.id)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function TeamManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    photo_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const uploadPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; role: string; photo_url: string | null }) => {
      const maxOrder = teamMembers?.reduce((max, m) => Math.max(max, m.sort_order), 0) || 0;
      const { error } = await supabase.from("team_members").insert({
        name: data.name,
        role: data.role,
        photo_url: data.photo_url || null,
        sort_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error adding team member", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; role: string; photo_url: string | null }) => {
      const { error } = await supabase
        .from("team_members")
        .update({
          name: data.name,
          role: data.role,
          photo_url: data.photo_url || null,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating team member", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Team member deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting team member", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Status updated" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("team_members")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members-admin"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast({ title: "Order updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error reordering", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", role: "", photo_url: "" });
    setEditingMember(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      photo_url: member.photo_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role) {
      toast({ title: "Name and role are required", variant: "destructive" });
      return;
    }

    if (editingMember) {
      updateMutation.mutate({
        id: editingMember.id,
        name: formData.name,
        role: formData.role,
        photo_url: formData.photo_url || null,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        role: formData.role,
        photo_url: formData.photo_url || null,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      setFormData((prev) => ({ ...prev, photo_url: url }));
      toast({ title: "Photo uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Error uploading photo", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && teamMembers) {
      const oldIndex = teamMembers.findIndex((m) => m.id === active.id);
      const newIndex = teamMembers.findIndex((m) => m.id === over.id);

      const newOrder = arrayMove(teamMembers, oldIndex, newIndex);
      const updates = newOrder.map((member, index) => ({
        id: member.id,
        sort_order: index + 1,
      }));

      reorderMutation.mutate(updates);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Core Team Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingMember(null); setFormData({ name: "", role: "", photo_url: "" }); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., President, Vice President"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo (5:4 ratio recommended)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                {formData.photo_url && (
                  <div className="mt-2 w-32 aspect-[5/4] rounded-lg overflow-hidden">
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingMember ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Team Members ({teamMembers?.length || 0})
            <span className="text-sm font-normal text-muted-foreground">• Drag to reorder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No team members added yet. Click "Add Team Member" to get started.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={teamMembers?.map((m) => m.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {teamMembers?.map((member) => (
                    <SortableTeamItem
                      key={member.id}
                      member={member}
                      onEdit={handleEdit}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onToggleActive={(id, is_active) =>
                        toggleActiveMutation.mutate({ id, is_active })
                      }
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
