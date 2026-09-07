import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { journalService } from "@/services/journal.service";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["journal", slug],
    queryFn: () => journalService.getBySlug(slug!),
    enabled: !!slug,
  });

  const journal = data?.journal;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4">
          Journal Not Found
        </h2>
        <Link to="/journals">
          <Button variant="outline">Back to Journals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#17254D] to-[#2A438C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/journals")}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            All Journals
          </button>

          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <BookOpen size={28} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
                {journal.title}
              </h1>
              {journal.issn && (
                <p className="text-white/60 text-sm mb-3">
                  ISSN: {journal.issn}
                </p>
              )}
              {journal.description && (
                <p className="text-white/70 text-base leading-relaxed max-w-3xl">
                  {journal.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  className="bg-white !text-[#2A438C] hover:bg-gray-100 font-semibold"
                  onClick={() =>
                    navigate(isAuthenticated ? "/submissions/new" : "/register")
                  }
                >
                  Submit Manuscript
                  <ArrowRight size={16} />
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Published Issues */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-serif mb-4">
                Published Issues
              </h2>
              {journal.issues?.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <Calendar
                      size={32}
                      className="text-gray-200 mx-auto mb-3"
                    />
                    <p className="text-gray-500 text-sm">
                      No issues published yet.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Check back soon for published research.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {journal.issues?.map((issue: any) => (
                    <Link
                      key={issue.id}
                      to={`/journals/${journal.slug}/issues/${issue.id}`}
                    >
                      <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                              <BookOpen size={20} className="text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {issue.label}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar size={11} />
                                  {new Date(
                                    issue.published_at,
                                  ).toLocaleDateString("en-NG", {
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <FileText size={11} />
                                  {issue.submissions_count} article
                                  {issue.submissions_count !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0"
                          />
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Journal Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 font-serif mb-4">
                Journal Information
              </h3>
              <dl className="space-y-3">
                {journal.issn && (
                  <div>
                    <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      ISSN
                    </dt>
                    <dd className="text-sm text-gray-700 mt-0.5">
                      {journal.issn}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Issues Published
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {journal.issues?.length ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Access Type
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">Open Access</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Review Type
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    Double-blind Peer Review
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Sections */}
            {journal.sections?.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 font-serif mb-4">
                  Journal Sections
                </h3>
                <div className="space-y-2">
                  {journal.sections.map((section: any) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={12} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {section.title}
                        </p>
                        {section.description && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Submit CTA */}
            <Card className="bg-[#17254D] border-0">
              <h3 className="font-semibold text-white font-serif mb-2">
                Ready to Submit?
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Submit your manuscript to {journal.title} for peer review and
                publication.
              </p>
              <Button
                fullWidth
                className="bg-white !text-[#2A438C] hover:bg-gray-100 font-semibold"
                onClick={() =>
                  navigate(isAuthenticated ? "/submissions/new" : "/register")
                }
              >
                Submit Manuscript
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
