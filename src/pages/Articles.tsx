import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Mail, Eye, Calendar, MapPin, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/PageHeader";
import { supabase } from '@/lib/supabase';

// Interface for ses_potential_project data
interface SesPotentialProject {
  article_id: string;
  client_id: string | null;
  type_of_article: string;
  article_date: string | null;
  deep_research_status: string | null;
  newsletter_check: boolean | null;
  article_link: string;
  pp_scope?: string;
  pp_stage?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  insights_summary?: string;
}

interface ArticleModalProps {
  article: SesPotentialProject;
  isOpen: boolean;
  onClose: () => void;
}

const RDModal = ({ article, isOpen, onClose }: ArticleModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-5xl max-h-[90vh] bg-white border-0 shadow-2xl overflow-hidden rounded-xl">
      <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 px-8 py-8 rounded-t-xl">
        <DialogTitle className="text-4xl font-bold text-white flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
            <Tag className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold">R&D Article Details</div>
            <div className="text-blue-100 text-xl font-medium mt-2 opacity-90">Research & Development Analysis</div>
          </div>
        </DialogTitle>
      </DialogHeader>
      
      {/* Scrollable Content Area */}
      <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 space-y-8 pt-8">
        {/* Key Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-4 block">Article ID</label>
              <p className="font-mono text-xl font-bold text-blue-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.article_id || 'N/A'}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-green-700 uppercase tracking-wider mb-4 block">Type</label>
              <Badge className="bg-green-600 text-white border-0 px-6 py-3 text-base font-bold rounded-xl shadow-md">
                {article?.type_of_article || 'N/A'}
              </Badge>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-4 block">Research Status</label>
              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-white/80 px-6 py-3 text-base font-bold rounded-xl shadow-sm">
                {article?.deep_research_status || 'Pending'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4 block">Newsletter Status</label>
              <Badge className={`px-6 py-3 text-base font-bold rounded-xl border-0 shadow-md ${
                article?.newsletter_check 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}>
                {article?.newsletter_check ? '✓ Checked' : '✗ Not Checked'}
              </Badge>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-4 block">Publication Date</label>
              <p className="text-xl font-semibold text-orange-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.article_date ? new Date(article.article_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 block">Client ID</label>
              <p className="font-mono text-xl font-bold text-slate-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.client_id || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-4 block">Location</label>
              <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                <MapPin className="h-6 w-6 text-indigo-600" />
                <span className="text-base font-semibold text-indigo-900">
                  {[article?.city, article?.state, article?.country].filter(Boolean).join(' → ') || 'Location not specified'}
                </span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-4 block">Article Link</label>
              {article?.article_link ? (
                <a 
                  href={article.article_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-rose-700 hover:text-rose-800 font-semibold bg-white/80 px-4 py-3 rounded-xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="text-base">View Article</span>
                  <span className="text-rose-500 text-lg">→</span>
                </a>
              ) : (
                <span className="text-rose-600 bg-white/80 px-4 py-3 rounded-xl text-base">No link available</span>
              )}
            </div>
          </div>
        </div>

        {/* Insights Summary */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <label className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-6 block">Insights Summary</label>
          <div className="bg-white/80 p-8 rounded-xl border border-amber-200/30 shadow-sm">
            <p className="text-lg leading-relaxed text-amber-900 whitespace-pre-wrap font-medium">
              {article?.insights_summary || 'No insights summary available for this article. This field contains business insights and analysis summary.'}
            </p>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Link */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <label className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-6 block">Article Link</label>
            {article?.article_link ? (
              <div className="bg-white/80 p-6 rounded-xl border border-rose-200/30 shadow-sm">
                <a 
                  href={article.article_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-rose-700 hover:text-rose-800 font-semibold hover:underline transition-all duration-300 text-lg"
                >
                  <span>View Full Article</span>
                  <span className="text-rose-500 text-xl">→</span>
                </a>
                <div className="mt-4 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200/30">
                  <span className="font-semibold">URL:</span> {article.article_link}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 p-6 rounded-xl border border-rose-200/30">
                <span className="text-rose-600 text-lg">No article link available</span>
              </div>
            )}
          </div>

          {/* Project Stage */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <label className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-6 block">Project Stage</label>
            <div className="bg-white/80 p-6 rounded-xl border border-violet-200/30 shadow-sm">
              <p className="text-lg text-violet-900 font-medium">
                {article?.pp_stage || 'No project stage information available'}
              </p>
            </div>
          </div>
        </div>

        {/* Full Article Details */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6 block">Complete Article Information</label>
          <div className="bg-white/80 p-8 rounded-xl border border-slate-200/30 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Article ID:</span>
                <span className="text-slate-600 font-mono text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.article_id || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Client ID:</span>
                <span className="text-slate-600 font-mono text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.client_id || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Type:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.type_of_article || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Publication Date:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">
                  {article?.article_date ? new Date(article.article_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Status:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.pp_stage || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Research:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.deep_research_status || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Newsletter:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.newsletter_check ? 'Checked' : 'Not Checked'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">City:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.city || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">State:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.state || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Country:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.country || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-8 pb-6">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Done
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const ProjectModal = ({ article, isOpen, onClose }: ArticleModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-5xl max-h-[90vh] bg-white border-0 shadow-2xl overflow-hidden rounded-xl">
      <DialogHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 -mx-6 -mt-6 px-8 py-8 rounded-t-xl">
        <DialogTitle className="text-4xl font-bold text-white flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold">Project Details</div>
            <div className="text-emerald-100 text-xl font-medium mt-2 opacity-90">Business Project Analysis & Insights</div>
          </div>
        </DialogTitle>
      </DialogHeader>
      
      {/* Scrollable Content Area */}
      <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 space-y-8 pt-8">
        {/* Key Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-4 block">Article ID</label>
              <p className="font-mono text-xl font-bold text-emerald-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.article_id || 'N/A'}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-4 block">Client ID</label>
              <p className="font-mono text-xl font-bold text-teal-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.client_id || 'N/A'}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-4 block">Project Type</label>
              <Badge className="bg-cyan-600 text-white border-0 px-6 py-3 text-base font-bold rounded-xl shadow-md">
                {article?.type_of_article || 'N/A'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-4 block">Location</label>
              <div className="flex items-center gap-3 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                <MapPin className="h-6 w-6 text-blue-600" />
                <span className="text-base font-semibold text-blue-900">
                  {[article?.city, article?.state, article?.country].filter(Boolean).join(' → ') || 'Location not specified'}
                </span>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-4 block">Publication Date</label>
              <p className="text-xl font-semibold text-orange-900 bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                {article?.article_date ? new Date(article.article_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-4 block">Research Status</label>
              <Badge variant="outline" className="border-violet-300 text-violet-700 bg-white/80 px-6 py-3 text-base font-bold rounded-xl shadow-sm">
                {article?.deep_research_status || 'Pending'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-4 block">Newsletter Status</label>
              <Badge className={`px-6 py-3 text-base font-bold rounded-xl border-0 shadow-md ${
                article?.newsletter_check 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}>
                {article?.newsletter_check ? '✓ Checked' : '✗ Not Checked'}
              </Badge>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <label className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-4 block">Article Link</label>
              {article?.article_link ? (
                <a 
                  href={article.article_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-amber-700 hover:text-amber-800 font-semibold bg-white/80 px-4 py-3 rounded-xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="text-base">View Article</span>
                  <span className="text-amber-500 text-lg">→</span>
                </a>
              ) : (
                <span className="text-amber-600 bg-white/80 px-4 py-3 rounded-xl text-base">No link available</span>
              )}
            </div>
          </div>
        </div>

        {/* Project Scope */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-6 block">Project Scope</label>
          <div className="bg-white/80 p-8 rounded-xl border border-indigo-200/30 shadow-sm">
            <p className="text-lg text-indigo-900 whitespace-pre-wrap break-words leading-relaxed font-medium">
              {article?.pp_scope || 'No project scope information available for this article.'}
            </p>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Article Link */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <label className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-6 block">Article Link</label>
            {article?.article_link ? (
              <div className="bg-white/80 p-6 rounded-xl border border-amber-200/30 shadow-sm">
                <a 
                  href={article.article_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-amber-700 hover:text-amber-800 font-semibold hover:underline transition-all duration-300 text-lg"
                >
                  <span>View Full Article</span>
                  <span className="text-amber-500 text-xl">→</span>
                </a>
                <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200/30">
                  <span className="font-semibold">URL:</span> {article.article_link}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 p-6 rounded-xl border border-amber-200/30">
                <span className="text-amber-600 text-lg">No article link available</span>
              </div>
            )}
          </div>

          {/* Insights Summary */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <label className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-6 block">Insights Summary</label>
            <div className="bg-white/80 p-6 rounded-xl border border-amber-200/30 shadow-sm">
              <p className="text-lg text-amber-900 whitespace-pre-wrap break-words leading-relaxed font-medium">
                {article?.insights_summary || 'No insights summary available for this article.'}
              </p>
            </div>
          </div>
        </div>

        {/* Full Project Details */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6 block">Complete Project Information</label>
          <div className="bg-white/80 p-8 rounded-xl border border-slate-200/30 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Article ID:</span>
                <span className="text-slate-600 font-mono text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.article_id || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Client ID:</span>
                <span className="text-slate-600 font-mono text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.client_id || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Type:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.type_of_article || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Publication Date:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">
                  {article?.article_date ? new Date(article.article_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Status:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.pp_stage || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Research:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.deep_research_status || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Newsletter:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.newsletter_check ? 'Checked' : 'Not Checked'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">City:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.city || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">State:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.state || 'N/A'}</span>
              </div>
              <div className="space-y-3">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wider">Country:</span>
                <span className="text-slate-600 text-lg bg-slate-50 px-3 py-2 rounded-lg">{article?.country || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-8 pb-6">
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-4 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Done
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function Articles() {
  const [articles, setArticles] = useState<SesPotentialProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<SesPotentialProject | null>(null);
  const [modalType, setModalType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch data from Supabase
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        console.log('Fetching articles from Supabase...');
        console.log('Supabase client:', supabase);
        
        console.log('Querying table: ses_potential_project');
        
        // First, let's check if the table exists and has data
        const { count, error: countError } = await supabase
          .from('ses_potential_project')
          .select('*', { count: 'exact', head: true });
        
        console.log('Table count result:', { count, countError });
        
        // Fetch all articles from the database
        const { data, error } = await supabase
          .from('ses_potential_project')
          .select('*');

        console.log('Supabase response:', { 
          data: data ? `Array with ${data.length} items` : 'null', 
          error: error ? error.message : 'null',
          dataType: typeof data,
          isArray: Array.isArray(data)
        });

        if (error) {
          console.error('Error fetching articles:', error);
          setError(`Supabase error: ${error.message}`);
          
          // Try alternative table names if the first one fails
          console.log('Trying alternative table names...');
          const { data: altData, error: altError } = await supabase
            .from('ses_potential_projects')
            .select('*')
            .limit(5);
          
          if (altData && altData.length > 0) {
            console.log('Found data in alternative table:', altData.length, 'rows');
            setArticles(altData);
            setError(null);
            return;
          }
          
          return;
        }

        console.log('Articles fetched successfully:', data?.length || 0, 'articles');
        console.log('First few articles:', data?.slice(0, 3));
        setArticles(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const openModal = (article: SesPotentialProject, type: string) => {
    setSelectedArticle(article);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setModalType("");
  };

  const getTypeButton = (type: string, article: SesPotentialProject) => {
    const buttonProps = {
      "CP": { 
        variant: "outline" as const, 
        className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm" 
      },
      "PP": { 
        variant: "outline" as const, 
        className: "bg-green-50 hover:bg-green-100 text-green-700 border-green-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm" 
      },
      "RD": { 
        variant: "outline" as const, 
        className: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-sm" 
      },
    };

    const buttonConfig = buttonProps[type as keyof typeof buttonProps] || buttonProps["CP"];

    return (
      <Button
        {...buttonConfig}
        size="sm"
        onClick={() => openModal(article, type)}
        className={buttonConfig.className}
      >
        {type}
      </Button>
    );
  };

  // Filter articles based on search and filters
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.article_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.article_link?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.client_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      article.deep_research_status === statusFilter;

    const matchesType = typeFilter === "all" || 
      article.type_of_article === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Articles & Emails"
          subtitle="Manage and track article insights and email drafts"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="moving-light-effect rounded-lg bg-white/5 backdrop-blur-sm shadow-lg header-container">
        <PageHeader
          title="Articles & Emails"
          subtitle="Manage and track article insights and email drafts"
          actions={[
            {
              type: 'export',
              label: 'Export List',
              onClick: () => console.log('Export list')
            }
          ]}
        />
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by article ID, client ID, or link..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Research Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Article Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CP">CP</SelectItem>
                  <SelectItem value="PP">PP</SelectItem>
                  <SelectItem value="RD">RD</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>



            {/* Articles Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Total Articles ({filteredArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Article ID
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Type
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Insights
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Scope
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Mail Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Newsletter
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider border-r border-gray-200">
                    Link
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Client ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article, index) => (
                  <TableRow 
                    key={article.article_id} 
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    } border-b border-gray-100`}
                    onClick={() => openModal(article, article.type_of_article)}
                  >
                                         <TableCell className="px-6 py-4 font-mono text-sm text-gray-900 border-r border-gray-100">
                       <span 
                         className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium cursor-help"
                         title={article.article_id || 'N/A'}
                       >
                         {article.article_id ? (
                           article.article_id.length > 4 
                             ? `${article.article_id.substring(0, 4)}...` 
                             : article.article_id
                         ) : 'N/A'}
                       </span>
                     </TableCell>
                    <TableCell className="px-6 py-4 border-r border-gray-100" onClick={(e) => e.stopPropagation()}>
                      {getTypeButton(article.type_of_article, article)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-700 border-r border-gray-100">
                      {article.article_date ? (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                          {new Date(article.article_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-xs border-r border-gray-100">
                      <div 
                        className="truncate text-sm text-gray-700 leading-relaxed" 
                        title={article.insights_summary || 'No insights available'}
                      >
                        {article.insights_summary || (
                          <span className="text-gray-400 italic">No insights available</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-xs border-r border-gray-100">
                      <div 
                        className="truncate text-sm text-gray-700 leading-relaxed" 
                        title={article.pp_scope || 'No scope defined'}
                      >
                        {article.pp_scope || (
                          <span className="text-gray-400 italic">No scope defined</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-xs border-r border-gray-100">
                      <div 
                        className="truncate text-sm text-gray-700 leading-relaxed" 
                        title={article.pp_stage || 'No stage defined'}
                      >
                        {article.pp_stage || (
                          <span className="text-gray-400 italic">No stage defined</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 border-r border-gray-100">
                      <Badge 
                        variant={article.deep_research_status === 'done' ? 'default' : 'secondary'}
                        className="text-xs font-medium px-3 py-1"
                      >
                        {article.deep_research_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 border-r border-gray-100">
                      <Badge 
                        variant={article.newsletter_check ? 'default' : 'outline'}
                        className="text-xs font-medium px-3 py-1"
                      >
                        {article.newsletter_check ? 'Checked' : 'Not Checked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-xs truncate border-r border-gray-100" title={article.article_link}>
                      <a 
                        href={article.article_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-medium break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {article.article_link ? (
                          <span className="flex items-center gap-1">
                            <span className="truncate">View Article</span>
                            <span className="text-blue-400">→</span>
                          </span>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </a>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-sm text-gray-900">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                        {article.client_id || 'N/A'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {modalType === "RD" && (
        <RDModal article={selectedArticle!} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
      {modalType === "PP" && (
        <ProjectModal article={selectedArticle!} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
      {modalType === "CP" && (
        <ProjectModal article={selectedArticle!} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
}