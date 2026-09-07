import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, ArrowRight, FileText, Globe } from "lucide-react";
import { journalService } from "@/services/journal.service";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function JournalsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["public-journals"],
    queryFn: journalService.getAll,
  });

  const journals = data?.journals ?? [];

  const filtered = journals.filter(
    (j: any) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#17254D] to-[#2A438C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/70 mb-4 border border-white/20">
              <Globe size={12} />
              Open Access Journals
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Browse Our Journals
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Explore our collection of peer-reviewed academic journals covering
              science, technology, engineering and infrastructure development.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="relative max-w-xl mb-8">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search journals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {filtered.length}
            </span>{" "}
            journal{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Journals Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 font-serif text-lg">
              No journals found
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((journal: any) => (
              <Link key={journal.id} to={`/journals/${journal.slug}`}>
                <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                  {/* Journal Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#2A438C] rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 font-serif leading-tight group-hover:text-primary transition-colors">
                        {journal.title}
                      </h3>
                      {journal.issn && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          ISSN: {journal.issn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {journal.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">
                      {journal.description}
                    </p>
                  )}

                  {/* Sections */}
                  {journal.sections?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Sections
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {journal.sections.map((section: any) => (
                          <span
                            key={section.id}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {section.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FileText size={12} />
                      <span>{journal.sections?.length ?? 0} sections</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                      View Journal
                      <ArrowRight size={12} />
                    </span>
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
