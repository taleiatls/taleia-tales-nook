import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  content: string;
  coin_price: number;
  is_locked: boolean;
  is_hidden: boolean;
  novel_id: string;
  novels: { title: string };
}

interface Novel {
  id: string;
  title: string;
}

const ChapterManagement = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNovelFilter, setSelectedNovelFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [formData, setFormData] = useState({
    title: "",
    chapter_number: "",
    content: "",
    coin_price: "1",
    is_locked: false,
    novel_id: ""
  });

  useEffect(() => {
    fetchChapters();
    fetchNovels();
  }, []);

  useEffect(() => {
    filterChapters();
  }, [chapters, selectedNovelFilter]);

  const filterChapters = () => {
    if (selectedNovelFilter === "all") {
      setFilteredChapters(chapters);
    } else {
      setFilteredChapters(chapters.filter(chapter => chapter.novel_id === selectedNovelFilter));
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          novels (title)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching chapters:", error);
        throw error;
      }
      console.log("Fetched chapters:", data);
      setChapters(data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNovels = async () => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error("Error fetching novels:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a novel is selected
    if (!formData.novel_id || formData.novel_id.trim() === "") {
      console.error("No novel selected");
      alert("Please select a novel before creating a chapter.");
      return;
    }

    // Validate content length (now allowing up to 50,000 characters)
    if (formData.content.length > 50000) {
      console.error("Content too long");
      alert("Chapter content cannot exceed 50,000 characters.");
      return;
    }
    
    try {
      const chapterData = {
        ...formData,
        chapter_number: parseInt(formData.chapter_number),
        coin_price: parseInt(formData.coin_price)
      };

      if (editingChapter) {
        console.log("Updating chapter:", editingChapter.id, chapterData);
        const { data, error } = await supabase
          .from('chapters')
          .update(chapterData)
          .eq('id', editingChapter.id)
          .select('*');

        if (error) {
          console.error("Error updating chapter:", error);
          throw error;
        }
        console.log("Chapter updated successfully:", data);
      } else {
        console.log("Creating chapter:", chapterData);
        const { data, error } = await supabase
          .from('chapters')
          .insert([chapterData])
          .select('*');

        if (error) {
          console.error("Error creating chapter:", error);
          throw error;
        }
        console.log("Chapter created successfully:", data);
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchChapters();
    } catch (error) {
      console.error("Error saving chapter:", error);
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      chapter_number: chapter.chapter_number.toString(),
      content: chapter.content,
      coin_price: chapter.coin_price.toString(),
      is_locked: chapter.is_locked,
      novel_id: chapter.novel_id
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (chapter: Chapter) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Chapter",
      message: `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          console.log("Deleting chapter:", chapter.id);
          const { data, error } = await supabase
            .from('chapters')
            .delete()
            .eq('id', chapter.id)
            .select('*');

          if (error) {
            console.error("Error deleting chapter:", error);
            throw error;
          }
          console.log("Chapter deleted successfully:", data);
          await fetchChapters();
        } catch (error) {
          console.error("Error deleting chapter:", error);
        }
      }
    });
  };

  const toggleVisibility = async (chapter: Chapter) => {
    const action = chapter.is_hidden ? "show" : "hide";
    setConfirmDialog({
      isOpen: true,
      title: `${action === "show" ? "Show" : "Hide"} Chapter`,
      message: `Are you sure you want to ${action} "${chapter.title}"?`,
      onConfirm: async () => {
        try {
          console.log("Toggling chapter visibility:", chapter.id, "from", chapter.is_hidden, "to", !chapter.is_hidden);
          const { data, error } = await supabase
            .from('chapters')
            .update({ 
              is_hidden: !chapter.is_hidden,
              updated_at: new Date().toISOString()
            })
            .eq('id', chapter.id)
            .select('*');

          if (error) {
            console.error("Error toggling visibility:", error);
            throw error;
          }
          console.log("Chapter visibility toggled successfully:", data);
          await fetchChapters();
        } catch (error) {
          console.error("Error toggling visibility:", error);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      chapter_number: "",
      content: "",
      coin_price: "1",
      is_locked: false,
      novel_id: ""
    });
    setEditingChapter(null);
  };

  if (loading) {
    return <div className="text-gray-300">Loading chapters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-200">Manage Chapters</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="novel-filter" className="text-gray-200">Filter by Novel:</Label>
            <Select value={selectedNovelFilter} onValueChange={setSelectedNovelFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200 w-48">
                <SelectValue placeholder="Select novel" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Novels</SelectItem>
                {novels.map((novel) => (
                  <SelectItem key={novel.id} value={novel.id}>
                    {novel.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-gray-200 max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="novel_id">Novel *</Label>
                  <Select 
                    value={formData.novel_id} 
                    onValueChange={(value) => setFormData({ ...formData, novel_id: value })}
                    required
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select a novel" />
                    </SelectTrigger>
                    <SelectContent>
                      {novels.map((novel) => (
                        <SelectItem key={novel.id} value={novel.id}>
                          {novel.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter_number">Chapter Number *</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      value={formData.chapter_number}
                      onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
                      required
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content">Content * (Max 50,000 characters)</Label>
                  <div className="text-sm text-gray-400 mb-2">
                    {formData.content.length}/50,000 characters
                  </div>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    maxLength={50000}
                    className="bg-gray-700 border-gray-600 min-h-40"
                    placeholder="Enter chapter content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coin_price">Coin Price</Label>
                    <Input
                      id="coin_price"
                      type="number"
                      value={formData.coin_price}
                      onChange={(e) => setFormData({ ...formData, coin_price: e.target.value })}
                      required
                      min="1"
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_locked"
                      checked={formData.is_locked}
                      onChange={(e) => setFormData({ ...formData, is_locked: e.target.checked })}
                      className="rounded border-gray-600"
                    />
                    <Label htmlFor="is_locked">Locked (requires coins)</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingChapter ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Novel</TableHead>
              <TableHead className="text-gray-300">Chapter</TableHead>
              <TableHead className="text-gray-300">Title</TableHead>
              <TableHead className="text-gray-300">Price</TableHead>
              <TableHead className="text-gray-300">Visibility</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChapters.map((chapter) => (
              <TableRow key={chapter.id} className="border-gray-700">
                <TableCell className="text-gray-200">{chapter.novels?.title}</TableCell>
                <TableCell className="text-gray-200">Ch. {chapter.chapter_number}</TableCell>
                <TableCell className="text-gray-200">{chapter.title}</TableCell>
                <TableCell>
                  <Badge variant={chapter.is_locked ? "destructive" : "secondary"}>
                    {chapter.is_locked ? `${chapter.coin_price} coins` : 'Free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={chapter.is_hidden ? "destructive" : "default"}>
                    {chapter.is_hidden ? "Hidden" : "Visible"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(chapter)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleVisibility(chapter)}>
                      {chapter.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(chapter)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default ChapterManagement;
