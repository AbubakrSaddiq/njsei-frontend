import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, X, FileText } from "lucide-react";
import { submissionService } from "@/services/submission.service";
import { journalService } from "@/services/journal.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Submission, SubmissionStatus } from "@/types";

const statusOptions: { value: SubmissionStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "revision_required", label: "Revision Required" },
  { value: "accepted", label: "Accepted" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get("q") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const journalFilter = searchParams.get("journal") ?? "";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";

  const [localQuery, setLocalQuery] = useState(query);

  const { data: submissionsData, isLoading } = useQuery({
    queryKey: ["search", query, statusFilter, journalFilter, dateFrom, dateTo],
    queryFn: submissionService.getAll,
    enabled: true,
  });

  const { data: journalsData } = useQuery({
    queryKey: ["journals"],
    queryFn: journalService.getAll,
  });

  const journals = journalsData?.journals ?? [];
  const allSubmissions: Submission[] = submissionsData?.data ?? [];

  // Client-side filtering
  const filtered = allSubmissions.filter((s) => {
    const matchesQuery =
      !query ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.abstract?.toLowerCase().includes(query.toLowerCase()) ||
      s.keywords?.toLowerCase().includes(query.toLowerCase()) ||
      s.author?.name?.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = !statusFilter || s.status === statusFilter;
    const matchesJournal =
      !journalFilter || s.journal?.id?.toString() === journalFilter;

    const submittedDate = new Date(s.submitted_at);
    const matchesFrom = !dateFrom || submittedDate >= new Date(dateFrom);
    const matchesTo = !dateTo || submittedDate <= new Date(dateTo);

    return (
      matchesQuery &&
      matchesStatus &&
      matchesJournal &&
      matchesFrom &&
      matchesTo
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localQuery) {
      params.set("q", localQuery);
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setLocalQuery("");
    setSearchParams({});
  };

  const hasActiveFilters =
    query || statusFilter || journalFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-serif">Search</h2>
        <p className="text-sm text-gray-500 mt-1">
          Search across all submissions by title, abstract, keywords or author
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by title, abstract, keywords, author..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  updateFilter("q", "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button type="submit">
            <Search size={15} />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={15} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => updateFilter("status", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Journal Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Journal
              </label>
              <select
                value={journalFilter}
                onChange={(e) => updateFilter("journal", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Journals</option>
                {journals.map((j: any) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Submitted From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilter("from", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Submitted To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => updateFilter("to", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Search: "{query}"
              <button
                onClick={() => {
                  setLocalQuery("");
                  updateFilter("q", "");
                }}
              >
                <X size={11} />
              </button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Status: {statusFilter.replace(/_/g, " ")}
              <button onClick={() => updateFilter("status", "")}>
                <X size={11} />
              </button>
            </span>
          )}
          {journalFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
              Journal:{" "}
              {
                journals.find((j: any) => j.id.toString() === journalFilter)
                  ?.title
              }
              <button onClick={() => updateFilter("journal", "")}>
                <X size={11} />
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
              From: {new Date(dateFrom).toLocaleDateString()}
              <button onClick={() => updateFilter("from", "")}>
                <X size={11} />
              </button>
            </span>
          )}
          {dateTo && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">
              To: {new Date(dateTo).toLocaleDateString()}
              <button onClick={() => updateFilter("to", "")}>
                <X size={11} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Searching..."
              : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Search size={32} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 font-serif">
                {hasActiveFilters ? "No results found" : "Start searching"}
              </h3>
              <p className="text-gray-500 text-sm mt-2">
                {hasActiveFilters
                  ? "Try adjusting your search terms or filters"
                  : "Enter keywords to search across all submissions"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((submission) => (
              <Link key={submission.id} to={`/submissions/${submission.id}`}>
                <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <Badge status={submission.status} />
                        <span className="text-xs text-gray-400">
                          #{submission.id}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
                        {query ? (
                          <HighlightText
                            text={submission.title}
                            highlight={query}
                          />
                        ) : (
                          submission.title
                        )}
                      </h3>
                      {submission.abstract && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {query ? (
                            <HighlightText
                              text={submission.abstract}
                              highlight={query}
                            />
                          ) : (
                            submission.abstract
                          )}
                        </p>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-gray-400">
                          👤 {submission.author?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          📔 {submission.journal?.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          🗓{" "}
                          {new Date(submission.submitted_at).toLocaleDateString(
                            "en-NG",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      {submission.keywords && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {submission.keywords
                            .split(",")
                            .slice(0, 4)
                            .map((kw) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {kw.trim()}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-300 flex-shrink-0">›</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Highlight matching text
function HighlightText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-100 text-yellow-800 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
