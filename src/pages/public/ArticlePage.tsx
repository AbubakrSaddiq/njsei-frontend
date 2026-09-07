import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ArrowLeft,
  Download,
  Copy,
  Check,
  User,
  Calendar,
  FileText,
  Tag,
  Quote,
  Globe,
  Share2,
} from "lucide-react";
import toast from "react-hot-toast";
import { articleService } from "@/services/article.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";
import api from "@/services/api";

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeCitation, setActiveCitation] = useState<
    "apa" | "mla" | "chicago"
  >("apa");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => articleService.getArticle(Number(id)),
    enabled: !!id,
  });

  const article = data?.article;

  const handleCopyCitation = async () => {
    if (!article) return;
    const citation = article.citations[activeCitation];
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    toast.success("Citation copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("redirect_after_login", window.location.pathname);
      toast("Please sign in to download this article", { icon: "🔒" });
      navigate("/login");
      return;
    }

    setDownloading(true);
    try {
      const response = await api.get(`/articles/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${article?.title ?? "article"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <FileText size={48} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-2">
          Article Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          This article may not be published yet or does not exist.
        </p>
        <Link to="/journals">
          <Button variant="outline">Browse Journals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top Bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <Link
                to="/journals"
                className="hover:text-primary transition-colors"
              >
                Journals
              </Link>
              <span>/</span>
              <Link
                to={`/journals/${article.journal.slug}`}
                className="hover:text-primary transition-colors"
              >
                {article.journal.title}
              </Link>
              {article.issue && (
                <>
                  <span>/</span>
                  <Link
                    to={`/journals/${article.journal.slug}/issues/${article.issue.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {article.issue.label}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-gray-700 truncate max-w-32">Article</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleShare}>
                <Share2 size={14} />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                loading={downloading}
                className={!isAuthenticated ? "opacity-90" : ""}
              >
                <Download size={14} />
                {isAuthenticated ? "Download PDF" : "Download PDF"}
                {!isAuthenticated && (
                  <span className="ml-1 text-xs opacity-70">(Sign in)</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Article Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Article Header */}
            <div>
              {/* Section & Journal Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                  {article.section.title}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {article.journal.title}
                </span>
                {article.issue && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {article.issue.label}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-6">
                {article.title}
              </h1>

              {/* Author & Meta */}
              <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {article.author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {article.author.name}
                    </p>
                    {article.author.affiliation && (
                      <p className="text-xs text-gray-500">
                        {article.author.affiliation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  {article.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Published{" "}
                      {new Date(article.published_at).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  )}
                  {article.page_number && (
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} />
                      pp. {article.page_number}
                    </span>
                  )}
                  {article.doi && (
                    <span className="flex items-center gap-1.5">
                      <Globe size={12} />
                      DOI: {article.doi}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Abstract */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 font-serif mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                Abstract
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {article.abstract}
                </p>
              </div>
            </section>

            {/* Keywords */}
            {article.keywords && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 font-serif mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.split(",").map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/20 text-primary text-sm rounded-full"
                    >
                      <Tag size={11} />
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* How to Cite */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 font-serif mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full" />
                How to Cite
              </h2>
              <Card padding="none" className="overflow-hidden">
                {/* Citation Format Tabs */}
                <div className="flex border-b border-gray-100">
                  {(["apa", "mla", "chicago"] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => setActiveCitation(format)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeCitation === format
                          ? "text-primary border-b-2 border-primary bg-primary/5"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Citation Text */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-gray-700 leading-relaxed italic flex-1">
                      <Quote
                        size={14}
                        className="inline text-gray-300 mr-1 -mt-0.5"
                      />
                      {article.citations[activeCitation]}
                    </p>
                    <button
                      onClick={handleCopyCitation}
                      className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                      title="Copy citation"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </section>

            {/* Download Section */}
            <section className="bg-gradient-to-br from-[#17254D] to-[#2A438C] rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-serif text-xl font-bold mb-1">
                    Download Full Article
                  </h2>
                  <p className="text-white/60 text-sm">
                    {isAuthenticated
                      ? "Download the complete manuscript as PDF"
                      : "Create a free account to download the full article"}
                  </p>
                </div>
                <Button
                  size="lg"
                  loading={downloading}
                  onClick={handleDownload}
                  className="bg-white !text-[#2A438C] hover:bg-gray-100 font-semibold flex-shrink-0"
                >
                  <Download size={18} />
                  {isAuthenticated ? "Download PDF" : "Sign In to Download"}
                </Button>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4 flex-wrap">
                  <p className="text-white/50 text-xs">
                    Already have an account?
                  </p>
                  <button
                    onClick={() => {
                      sessionStorage.setItem(
                        "redirect_after_login",
                        window.location.pathname,
                      );
                      navigate("/login");
                    }}
                    className="text-white text-xs font-medium hover:underline"
                  >
                    Sign in →
                  </button>
                  <button
                    onClick={() => {
                      sessionStorage.setItem(
                        "redirect_after_login",
                        window.location.pathname,
                      );
                      navigate("/register");
                    }}
                    className="text-white text-xs font-medium hover:underline"
                  >
                    Create free account →
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publication Details */}
            <Card>
              <h3 className="font-semibold text-gray-900 font-serif mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-primary" />
                Publication Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Journal
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    <Link
                      to={`/journals/${article.journal.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {article.journal.title}
                    </Link>
                  </dd>
                </div>
                {article.journal.issn && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      ISSN
                    </dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      {article.journal.issn}
                    </dd>
                  </div>
                )}
                {article.issue && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Issue
                    </dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      <Link
                        to={`/journals/${article.journal.slug}/issues/${article.issue.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.issue.label}
                      </Link>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Section
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {article.section.title}
                  </dd>
                </div>
                {article.page_number && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Pages
                    </dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      pp. {article.page_number}
                    </dd>
                  </div>
                )}
                {article.published_at && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Published
                    </dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      {new Date(article.published_at).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </dd>
                  </div>
                )}
                {article.doi && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      DOI
                    </dt>
                    <dd className="text-sm text-primary mt-0.5">
                      <a
                        href={`https://doi.org/${article.doi}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {article.doi}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Author Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 font-serif mb-4 flex items-center gap-2">
                <User size={16} className="text-primary" />
                About the Author
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-[#2A438C] flex items-center justify-center text-white font-bold text-lg font-serif flex-shrink-0">
                  {article.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {article.author.name}
                  </p>
                  {article.author.affiliation && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {article.author.affiliation}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Open Access Notice */}
            <Card className="bg-green-50 border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe size={15} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 text-sm mb-1">
                    Open Access
                  </h4>
                  <p className="text-green-700 text-xs leading-relaxed">
                    This article is published under an open access license. The
                    abstract is freely available to everyone. Download requires
                    a free account.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Download */}
            <Card>
              <h3 className="font-semibold text-gray-900 font-serif mb-3">
                Download Article
              </h3>
              <Button fullWidth loading={downloading} onClick={handleDownload}>
                <Download size={15} />
                {isAuthenticated ? "Download PDF" : "Sign In to Download"}
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Free account required
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
