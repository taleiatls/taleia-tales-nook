
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  status: string | null;
  language: string | null;
  total_chapters: number | null;
  is_hidden: boolean;
  created_at: string;
}

const NovelManagement = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    synopsis: "",
    status: "ongoing",
    language: "english"
  });

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error("Error fetching novels:", error);
      toast.error("Failed to fetch novels");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNovel) {
        const { error } = await supabase
          .from('novels')
          .update(formData)
          .eq('id', editingNovel.id);

        if (error) throw error;
        toast.success("Novel updated successfully");
      } else {
        const { error } = await supabase
          .from('novels')
          .insert([formData]);

        if (error) throw error;
        toast.success("Novel created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNovels();
    } catch (error) {
      console.error("Error saving novel:", error);
      toast.error("Failed to save novel");
    }
  };

  const handleEdit = (novel: Novel) => {
    setEditingNovel(novel);
    setFormData({
      title: novel.title,
      author: novel.author,
      synopsis: novel.synopsis || "",
      status: novel.status || "ongoing",
      language: novel.language || "english"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (novelId: string) => {
    if (!confirm("Are you sure you want to delete this novel?")) return;

    try {
      const { error } = await supabase
        .from('novels')
        .delete()
        .eq('id', novelId);

      if (error) throw error;
      toast.success("Novel deleted successfully");
      fetchNovels();
    } catch (error) {
      console.error("Error deleting novel:", error);
      toast.error("Failed to delete novel");
    }
  };

  const toggleVisibility = async (novel: Novel) => {
    try {
      const { error } = await supabase
        .from('novels')
        .update({ is_hidden: !novel.is_hidden })
        .eq('id', novel.id);

      if (error) throw error;
      toast.success(`Novel ${!novel.is_hidden ? 'hidden' : 'shown'} successfully`);
      fetchNovels();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to toggle visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      synopsis: "",
      status: "ongoing",
      language: "english"
    });
    setEditingNovel(null);
  };

  if (loading) {
    return <div className="text-gray-300">Loading novels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">Manage Novels</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Novel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle>{editingNovel ? 'Edit Novel' : 'Add New Novel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                  id="synopsis"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNovel ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Title</TableHead>
              <TableHead className="text-gray-300">Author</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Visibility</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {novels.map((novel) => (
              <TableRow key={novel.id} className="border-gray-700">
                <TableCell className="text-gray-200">{novel.title}</TableCell>
                <TableCell className="text-gray-200">{novel.author}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{novel.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={novel.is_hidden ? "destructive" : "default"}>
                    {novel.is_hidden ? "Hidden" : "Visible"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(novel)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleVisibility(novel)}>
                      {novel.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(novel.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default NovelManagement;
