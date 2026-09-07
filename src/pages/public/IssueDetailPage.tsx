import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ArrowLeft, FileText, User, Calendar } from "lucide-react";
import { issueService } from "@/services/issue.service";
import { journalService } from "@/services/journal.service";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";

export function IssueDetailPage() {
  const { slug, issueId } = useParams<{ slug: string; issueId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: journalData, isLoading: loadingJournal } = useQuery({
    queryKey: ["journal", slug],
    queryFn: () => journalService.getBySlug(slug!),
    enabled: !!slug,
  });

  const journal = journalData?.journal;

  const { data: issueData, isLoading: loadingIssue } = useQuery({
    queryKey: ["public-issue", journal?.id, issueId],
    queryFn: () => issueService.getIssue(journal!.id, Number(issueId)),
    enabled: !!journal?.id && !!issueId,
  });

  const issue = issueData?.issue;

  if (loadingJournal || loadingIssue) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!issue || !journal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4">
          Issue Not Found
        </h2>
        <Link to={`/journals/${slug}`}>
          <Button variant="outline">Back to Journal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#17254D] to-[#2A438C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <button
              onClick={() => navigate("/journals")}
              className="hover:text-white transition-colors"
            >
              Journals
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/journals/${slug}`)}
              className="hover:text-white transition-colors"
            >
              {journal.title}
            </button>
            <span>/</span>
            <span className="text-white/80">{issue.label}</span>
          </div>

          <button
            onClick={() => navigate(`/journals/${slug}`)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Journal
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/20">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">{journal.title}</p>
              <h1 className="font-serif text-3xl font-bold mb-2">
                {issue.label}
              </h1>
              <div className="flex items-center gap-4 text-white/60 text-sm flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(issue.published_at ?? "").toLocaleDateString(
                    "en-NG",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText size={13} />
                  {issue.submissions?.length ?? 0} articles
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 font-serif mb-6">
              Articles in this Issue
            </h2>

            {issue.submissions?.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FileText size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No articles in this issue.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {issue.submissions?.map((submission: any, index: number) => (
                  <Card
                    key={submission.id}
                    className="hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Article Number */}
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 font-serif leading-snug mb-2">
                          {submission.title}
                        </h3>

                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <User size={11} />
                            {submission.author}
                          </span>
                          <span className="text-gray-200">·</span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FileText size={11} />
                            {submission.section}
                          </span>
                          {submission.page_number && (
                            <>
                              <span className="text-gray-200">·</span>
                              <span className="text-xs text-gray-500">
                                pp. {submission.page_number}
                              </span>
                            </>
                          )}
                        </div>

                        {isAuthenticated ? (
                          <Link
                            to={`/articles/${submission.id}`}
                            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                          >
                            View Full Article
                            <ArrowLeft size={11} className="rotate-180" />
                          </Link>
                        ) : (
                          <Link
                            to={`/articles/${submission.id}`}
                            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                          >
                            View Article
                            <ArrowLeft size={11} className="rotate-180" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Issue Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 font-serif mb-4">
                Issue Information
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Journal
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {journal.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Volume / Issue
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {issue.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Published
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {new Date(issue.published_at ?? "").toLocaleDateString(
                      "en-NG",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Articles
                  </dt>
                  <dd className="text-sm text-gray-700 mt-0.5">
                    {issue.submissions?.length ?? 0}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Submit CTA */}
            <Card className="bg-[#17254D] border-0">
              <h3 className="font-semibold text-white font-serif mb-2">
                Submit Your Research
              </h3>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Contribute to the next issue of {journal.title}.
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
