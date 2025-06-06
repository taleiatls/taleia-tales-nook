
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  status: string | null;
  language: string | null;
  total_chapters: number | null;
  is_hidden: boolean;
  cover_image_url: string | null;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
}

interface NovelTag {
  novel_id: string;
  tag_id: string;
  tag: Tag;
}

const NovelManagement = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [novelTags, setNovelTags] = useState<{ [novelId: string]: Tag[] }>({});
  const [loading, setLoading] = useState(true);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
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
    author: "",
    synopsis: "",
    status: "ongoing",
    language: "english"
  });

  useEffect(() => {
    fetchNovels();
    fetchTags();
    fetchNovelTags();
  }, []);

  const fetchNovels = async () => {
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching novels:", error);
        throw error;
      }
      console.log("Fetched novels:", data);
      setNovels(data || []);
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }
      setTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchNovelTags = async () => {
    try {
      const { data, error } = await supabase
        .from('novel_tags')
        .select(`
          novel_id,
          tag_id,
          tag:tags(id, name)
        `);

      if (error) {
        console.error("Error fetching novel tags:", error);
        throw error;
      }

      // Group tags by novel_id
      const tagsByNovel: { [novelId: string]: Tag[] } = {};
      data?.forEach((item: any) => {
        if (!tagsByNovel[item.novel_id]) {
          tagsByNovel[item.novel_id] = [];
        }
        tagsByNovel[item.novel_id].push(item.tag);
      });
      
      setNovelTags(tagsByNovel);
    } catch (error) {
      console.error("Error fetching novel tags:", error);
    }
  };

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('novel-covers')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading cover image:", uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('novel-covers')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error in uploadCoverImage:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let finalCoverImageUrl = coverImageUrl;

      // Upload cover image if a file is selected
      if (coverImageFile) {
        const uploadedUrl = await uploadCoverImage(coverImageFile);
        if (uploadedUrl) {
          finalCoverImageUrl = uploadedUrl;
        }
      }

      const novelData = {
        ...formData,
        cover_image_url: finalCoverImageUrl || null
      };

      let novelId: string;

      if (editingNovel) {
        console.log("Updating novel:", editingNovel.id, novelData);
        const { data, error } = await supabase
          .from('novels')
          .update(novelData)
          .eq('id', editingNovel.id)
          .select('*');

        if (error) {
          console.error("Error updating novel:", error);
          throw error;
        }
        console.log("Novel updated successfully:", data);
        novelId = editingNovel.id;
      } else {
        console.log("Creating novel:", novelData);
        const { data, error } = await supabase
          .from('novels')
          .insert([novelData])
          .select('*');

        if (error) {
          console.error("Error creating novel:", error);
          throw error;
        }
        console.log("Novel created successfully:", data);
        novelId = data[0].id;
      }

      // Update tags
      await updateNovelTags(novelId, selectedTags);

      setIsDialogOpen(false);
      resetForm();
      await fetchNovels();
      await fetchNovelTags();
    } catch (error) {
      console.error("Error saving novel:", error);
    }
  };

  const updateNovelTags = async (novelId: string, tagIds: string[]) => {
    try {
      // Delete existing tags for this novel
      await supabase
        .from('novel_tags')
        .delete()
        .eq('novel_id', novelId);

      // Insert new tags
      if (tagIds.length > 0) {
        const novelTagsData = tagIds.map(tagId => ({
          novel_id: novelId,
          tag_id: tagId
        }));

        const { error } = await supabase
          .from('novel_tags')
          .insert(novelTagsData);

        if (error) {
          console.error("Error updating novel tags:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Error in updateNovelTags:", error);
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
    setCoverImageUrl(novel.cover_image_url || "");
    setCoverImageFile(null);
    
    // Set selected tags for this novel
    const novelTagList = novelTags[novel.id] || [];
    setSelectedTags(novelTagList.map(tag => tag.id));
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (novel: Novel) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Novel",
      message: `Are you sure you want to delete "${novel.title}"? This will also delete all its chapters and cannot be undone.`,
      onConfirm: async () => {
        try {
          console.log("Deleting novel:", novel.id);
          
          // First delete all chapters of this novel
          const { error: chaptersError } = await supabase
            .from('chapters')
            .delete()
            .eq('novel_id', novel.id);

          if (chaptersError) {
            console.error("Error deleting chapters:", chaptersError);
            throw chaptersError;
          }

          // Delete novel tags
          await supabase
            .from('novel_tags')
            .delete()
            .eq('novel_id', novel.id);

          // Then delete the novel
          const { data, error } = await supabase
            .from('novels')
            .delete()
            .eq('id', novel.id)
            .select('*');

          if (error) {
            console.error("Error deleting novel:", error);
            throw error;
          }
          
          console.log("Novel deleted successfully:", data);
          await fetchNovels();
          await fetchNovelTags();
        } catch (error) {
          console.error("Error deleting novel:", error);
        }
      }
    });
  };

  const toggleVisibility = async (novel: Novel) => {
    const action = novel.is_hidden ? "show" : "hide";
    setConfirmDialog({
      isOpen: true,
      title: `${action === "show" ? "Show" : "Hide"} Novel`,
      message: `Are you sure you want to ${action} "${novel.title}"?`,
      onConfirm: async () => {
        try {
          console.log("Toggling visibility for novel:", novel.id, "from", novel.is_hidden, "to", !novel.is_hidden);
          
          const { data, error } = await supabase
            .from('novels')
            .update({ 
              is_hidden: !novel.is_hidden,
              updated_at: new Date().toISOString()
            })
            .eq('id', novel.id)
            .select('*');

          if (error) {
            console.error("Supabase error:", error);
            throw error;
          }

          console.log("Update successful, updated data:", data);
          await fetchNovels();
          
        } catch (error) {
          console.error("Error toggling visibility:", error);
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      synopsis: "",
      status: "ongoing",
      language: "english"
    });
    setSelectedTags([]);
    setCoverImageUrl("");
    setCoverImageFile(null);
    setEditingNovel(null);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverImageUrl(previewUrl);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImageUrl("");
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
          <DialogContent className="bg-gray-800 border-gray-700 text-gray-200 max-w-2xl max-h-[80vh] overflow-y-auto">
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

              {/* Cover Image Upload */}
              <div>
                <Label htmlFor="cover-image">Cover Image</Label>
                <div className="space-y-2">
                  <Input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="bg-gray-700 border-gray-600"
                  />
                  {coverImageUrl && (
                    <div className="relative inline-block">
                      <img 
                        src={coverImageUrl} 
                        alt="Cover preview" 
                        className="w-32 h-48 object-cover rounded border border-gray-600"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-1 right-1"
                        onClick={removeCoverImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Selection */}
              <div>
                <Label>Tags</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto p-2 border border-gray-600 rounded bg-gray-700">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
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
              <TableHead className="text-gray-300">Cover</TableHead>
              <TableHead className="text-gray-300">Title</TableHead>
              <TableHead className="text-gray-300">Author</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Tags</TableHead>
              <TableHead className="text-gray-300">Visibility</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {novels.map((novel) => (
              <TableRow key={novel.id} className="border-gray-700">
                <TableCell>
                  {novel.cover_image_url ? (
                    <img 
                      src={novel.cover_image_url} 
                      alt={`${novel.title} cover`}
                      className="w-12 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">No cover</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-gray-200">{novel.title}</TableCell>
                <TableCell className="text-gray-200">{novel.author}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{novel.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(novelTags[novel.id] || []).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
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
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(novel)}>
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

export default NovelManagement;
