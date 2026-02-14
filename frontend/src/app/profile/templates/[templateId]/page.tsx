'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserTemplate, getAllUserTemplates, updateUserTemplate, deleteUserTemplate } from '@/services/templateService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Edit2, Trash2, Wand2, AlertCircle, Share2, Bookmark, Download } from 'lucide-react';
import { toast } from 'sonner';
import Masonry from 'react-masonry-css';
import UserTemplateCard from '@/components/templates/userTemplateCard';

interface UserTemplate {
  _id: string;
  imageUrl: string;
  templateId: string;
  name: string;
  status?: string;
  category?: string;
  subCategory?: string;
  createdAt?: string;
}

const feedBreakpoints = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1
};

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<UserTemplate | null>(null);
  const [allTemplates, setAllTemplates] = useState<UserTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const templateRes = await getUserTemplate(templateId);
        let singleTemplate: UserTemplate | null = null;

        if (templateRes?.data?.template) {
          singleTemplate = templateRes.data.template;
        } else if (templateRes?.data) {
          singleTemplate = templateRes.data;
        } else if (templateRes?.template) {
          singleTemplate = templateRes.template;
        } else if (templateRes && typeof templateRes === 'object' && '_id' in templateRes) {
          singleTemplate = templateRes as UserTemplate;
        }

        if (!singleTemplate) {
          setError('Template not found');
          return;
        }
        setTemplate(singleTemplate);
        setEditName(singleTemplate.name);

        const allRes = await getAllUserTemplates();
        let templates: UserTemplate[] = [];

        if (allRes?.data?.templates && Array.isArray(allRes.data.templates)) {
          templates = allRes.data.templates;
        } else if (allRes?.templates && Array.isArray(allRes.templates)) {
          templates = allRes.templates;
        } else if (Array.isArray(allRes?.data)) {
          templates = allRes.data;
        } else if (Array.isArray(allRes)) {
          templates = allRes;
        }

        setAllTemplates(templates.filter(t => t._id !== templateId));
      } catch (err) {
        console.error('Failed to load template', err);
        setError('Failed to load template');
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      loadData();
    }
  }, [templateId]);

  const handleUpdateName = async () => {
    if (!template || !editName.trim()) {
      toast.error('Template name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserTemplate(template.templateId, { name: editName });
      setTemplate(prev => prev ? { ...prev, name: editName } : prev);
      setIsEditing(false);
      toast.success('Template name updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    try {
      setIsDeleting(true);
      await deleteUserTemplate(template.templateId);
      toast.success('Template deleted successfully');
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete template');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateMeme = () => {
    if (!template) return;
    router.push(`/create/editor?templateId=${template.templateId}&type=user`);
  };

  const handleShare = async () => {
    if (!template) return;
    const shareUrl = `${window.location.origin}/profile/templates/${template._id}`;
    if (navigator.share) {
      await navigator.share({ title: template.name, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg text-zinc-100 mb-2">{error || 'Template not found'}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex item-center bg-black text-zinc-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-400 mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-400 mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-8 ">
          
          {/* Left: Image */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-900">
              <img
                src={template.imageUrl}
                alt={template.name}
                className="w-full h-200 object-contain"
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {template.category && (
                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                  {template.category}
                </span>
              )}

              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold bg-zinc-950 border-zinc-800 h-12"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateName} disabled={isSaving} size="sm" className="bg-zinc-200 hover:bg-zinc-300">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button onClick={() => { setIsEditing(false); setEditName(template.name); }} variant="outline" size="sm" className="border-zinc-800">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-3">{template.name}</h1>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      A blank canvas for your chaotic thoughts. Use this template to create something legendary.
                    </p>
                  </>
                )}
              </div>

              <Button onClick={handleCreateMeme} className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-zinc-200 rounded-xl">
                <Wand2 className="w-5 h-5 mr-2" />
                Create Meme
              </Button>

              <div className="grid grid-cols-3 gap-3">
                <Button variant="ghost" onClick={() => router.push("/upcoming")} className="h-12 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl">
                  <Bookmark className="w-5 h-5" />
                </Button>
                <Button variant="ghost" className="h-12 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl">
                  <Download className="w-5 h-5" />
                </Button>
                <Button onClick={handleShare} variant="ghost" className="h-12 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="pt-6 border-t border-zinc-900 space-y-3">
                <Button onClick={() => setIsEditing(true)} disabled={isEditing} variant="outline" className="w-full h-11 border-zinc-800 hover:bg-zinc-950 rounded-xl">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Name
                </Button>

                <Button onClick={() => setShowDeleteConfirm(true)} variant="outline" className="w-full h-11 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Template
                </Button>
              </div>

              {template.status && (
                <div className="pt-4 border-t border-zinc-900">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-zinc-300 font-medium capitalize">{template.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {allTemplates.length > 0 && (
          <div className="mt-16 pt-16 border-t border-zinc-900">
            <h2 className="text-2xl font-bold text-zinc-100 mb-8">✨ Your Templates</h2>
            <Masonry className="my-masonry-grid" columnClassName="my-masonry-grid_column" breakpointCols={feedBreakpoints}>
              {allTemplates.map((tpl) => (
                <div key={tpl._id} className="mb-6">
                  <UserTemplateCard template={tpl} onDelete={() => {}} />
                </div>
              ))}
            </Masonry>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Delete Template?</h3>
                <p className="text-sm text-zinc-400 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 border-zinc-800 hover:bg-zinc-900">
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4 mr-2" />Delete</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}