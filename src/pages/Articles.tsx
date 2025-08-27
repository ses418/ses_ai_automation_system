import { useState } from "react";
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

// Mock data for articles
const mockArticles = [
  {
    id: "ART001",
    articleId: "12345",
    link: "https://example.com/article1",
    date: "2024-01-15",
    title: "AI Revolution in Healthcare: New R&D Opportunities",
    keywords: "AI, Healthcare, Research",
    category: "Technology",
    headline: "Healthcare companies investing heavily in AI research",
    location: "San Francisco, CA",
    status: "Active",
    company: "MedTech Corp",
    type: "R/D",
  },
  {
    id: "ART002",
    articleId: "12346",
    link: "https://example.com/article2",
    date: "2024-01-14",
    title: "New Infrastructure Project Announced in Austin",
    keywords: "Infrastructure, Construction, Development",
    category: "Construction",
    headline: "City announces $50M infrastructure development",
    location: "Austin, TX",
    status: "Pending",
    company: "BuildCorp Inc",
    type: "Project Announced",
  },
  {
    id: "ART003",
    articleId: "12347",
    link: "https://example.com/article3",
    date: "2024-01-13",
    title: "Downtown Office Complex Project Completed",
    keywords: "Commercial, Real Estate, Completion",
    category: "Real Estate",
    headline: "Major office complex opens doors to tenants",
    location: "New York, NY",
    status: "Completed",
    company: "RealEstate Pro",
    type: "Completed Project",
  },
];

interface ArticleModalProps {
  article: any;
  isOpen: boolean;
  onClose: () => void;
}

const RDModal = ({ article, isOpen, onClose }: ArticleModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl">
      <DialogHeader className="pb-6">
        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          R&D Article Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="font-semibold mt-1 text-foreground">{article?.title}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Relevancy</label>
              <Badge variant="outline" className="bg-green-50 text-green-700 mt-2 border-green-300">High Relevance</Badge>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">R&D Focus Area</label>
              <p className="mt-1 text-sm">Artificial Intelligence, Machine Learning</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">R&D Type</label>
              <p className="mt-1 text-sm">Applied Research</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Proceed Status</label>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 mt-2 border-blue-300">Proceed</Badge>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Published Date</label>
              <p className="mt-1 text-sm">{article?.date}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30">
          <label className="text-sm font-medium text-muted-foreground">Insights Summary</label>
          <p className="mt-2 text-sm leading-relaxed">
            This article discusses breakthrough AI technologies in healthcare with significant R&D opportunities for our clients. The research focuses on developing innovative solutions that could transform patient care.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/30">
          <label className="text-sm font-medium text-muted-foreground">Location</label>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">United States → California → San Francisco</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Mark as Processed</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const ProjectModal = ({ article, isOpen, onClose }: ArticleModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl">
      <DialogHeader className="pb-6">
        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          Project Announced Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <p className="font-semibold mt-1 text-foreground">{article?.company}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Project Scope</label>
              <p className="mt-1 text-sm">Large Scale Infrastructure Development</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Lead Source</label>
              <p className="mt-1 text-sm">Industry Publication</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Badge variant="outline" className="mt-1">{article?.category}</Badge>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{article?.location}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Published Date</label>
              <p className="mt-1 text-sm">{article?.date}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30">
          <label className="text-sm font-medium text-muted-foreground">Identified Opportunity</label>
          <p className="mt-2 text-sm leading-relaxed">
            New infrastructure development project with significant potential for construction and engineering services. The project involves modernizing critical systems and presents excellent collaboration opportunities with established industry leaders.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Create Proposal</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const CompletedModal = ({ article, isOpen, onClose }: ArticleModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl">
      <DialogHeader className="pb-6">
        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          Completed Project Details
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="font-semibold mt-1 text-foreground">{article?.title}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Relevancy</label>
              <Badge variant="outline" className="bg-green-50 text-green-700 mt-2 border-green-300">Relevant</Badge>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Project Keywords</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {article?.keywords.split(", ").map((keyword: string) => (
                  <Badge key={keyword} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Companies Mentioned</label>
              <p className="font-medium mt-1">{article?.company}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{article?.location}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <label className="text-sm font-medium text-muted-foreground">Published Date</label>
              <p className="mt-1 text-sm">{article?.date}</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30">
          <label className="text-sm font-medium text-muted-foreground">Insights Summary</label>
          <p className="mt-2 text-sm leading-relaxed">
            Successful completion of major office complex project, demonstrating market demand for similar developments. This completed project provides valuable insights and reference potential for similar future opportunities.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button>Follow Up</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function Articles() {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [modalType, setModalType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const openModal = (article: any, type: string) => {
    setSelectedArticle(article);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setModalType("");
  };

  const getTypeButton = (type: string, article: any) => {
    const buttonProps = {
      "R/D": { variant: "outline" as const, className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300" },
      "Project Announced": { variant: "outline" as const, className: "bg-green-50 hover:bg-green-100 text-green-700 border-green-300" },
      "Completed Project": { variant: "outline" as const, className: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300" },
    };

    return (
      <Button
        {...buttonProps[type as keyof typeof buttonProps]}
        size="sm"
        onClick={() => openModal(article, type)}
      >
        {type}
      </Button>
    );
  };

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
                  placeholder="Search by title, keyword, company, or link..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Construction">Construction</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
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
      <Card>
        <CardHeader>
          <CardTitle>Total Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Article ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockArticles.map((article) => (
                  <TableRow key={article.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{article.id}</TableCell>
                    <TableCell>{article.articleId}</TableCell>
                    <TableCell>{article.date}</TableCell>
                    <TableCell className="max-w-xs truncate" title={article.title}>
                      {article.title}
                    </TableCell>
                    <TableCell>{article.keywords}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell>{article.location}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === "Active" ? "default" : "secondary"}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.company}</TableCell>
                    <TableCell>
                      {getTypeButton(article.type, article)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {modalType === "R/D" && (
        <RDModal article={selectedArticle} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
      {modalType === "Project Announced" && (
        <ProjectModal article={selectedArticle} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
      {modalType === "Completed Project" && (
        <CompletedModal article={selectedArticle} isOpen={!!selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
}