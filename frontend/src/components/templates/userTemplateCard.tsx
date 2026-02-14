'use client';

import { Edit2, Trash2, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import Link from "next/link";
import { useState } from "react";
import { deleteUserTemplate, updateUserTemplate } from "@/services/templateService";

export interface UserTemplate {
  _id: string;
  imageUrl: string;
  name: string;
  templateId: string;
}

interface UserTemplateCardProps {
  template: UserTemplate;
  onDelete?: () => void;
}

export default function UserTemplateCard({ template, onDelete }: UserTemplateCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(template.name);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateMeme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/create/editor?templateId=${template.templateId}&type=user`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/profile/templates/${template._id}`;
    if (navigator.share) {
      await navigator.share({ title: template.name, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsDeleting(true);
      await deleteUserTemplate(template.templateId);
      toast.success("Template deleted successfully");
      onDelete?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete template");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditName = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editName.trim()) {
      toast.error("Template name cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      await updateUserTemplate(template.templateId, { name: editName });
      toast.success("Template name updated");
      template.name = editName;
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="cursor-pointer group relative break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/50">
        <img 
          src={template.imageUrl} 
          alt={template.name}
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 block"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <Link href={`/profile/templates/${template.templateId}`} className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
          
          {/* Template Name */}
          <p className="text-zinc-100 font-bold text-sm line-clamp-2 mb-3 drop-shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {template.name}
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
            <Button 
              onClick={handleCreateMeme}
              title="Create Meme With Template"
              className="flex-1 cursor-pointer bg-zinc-600 hover:bg-zinc-700 text-white font-semibold h-9 rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" /> 
              Create
            </Button>
            
            <Button
              onClick={handleShare}
              variant="secondary"
              title="Share Template"
              size="icon"
              className="h-9 w-9 cursor-pointer bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"    
            >
              <Share2 className="w-4 h-4" />
            </Button>

            <Button 
              size="icon" 
              variant="secondary"
              className="h-9 w-9 cursor-pointer bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit Template"
            >
              <Edit2 className="w-4 h-4" />
            </Button>

            <Button 
              size="icon" 
              variant="secondary"
              className="h-9 w-9 cursor-pointer bg-red-500/20 hover:bg-red-500/30 text-red-400 border-0 backdrop-blur-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title="Delete Template"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setIsEditing(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-100">Edit Template Name</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              placeholder="Template name"
            />
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="flex-1 border-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditName}
                disabled={isSaving}
                className="flex-1 bg-white hover:bg-zinc-300 text-black"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-zinc-100">Delete Template?</h3>
            <p className="text-sm text-zinc-400">
              This action cannot be undone. The template "{template.name}" will be permanently deleted.
            </p>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-zinc-700"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}