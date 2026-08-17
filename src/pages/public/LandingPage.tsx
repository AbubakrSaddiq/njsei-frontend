import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Shield,
  Users,
  FileText,
  CheckCircle,
  Globe,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { journalService } from "@/services/journal.service";

const stats = [
  { value: "500+", label: "Published Articles" },
  { value: "1,200+", label: "Registered Researchers" },
  { value: "48", label: "Issues Published" },
  { value: "95%", label: "Review Completion Rate" },
];

const features = [
  {
    icon: <FileText size={24} className="text-primary" />,
    title: "Easy Submission",
    description:
      "Submit your manuscript in minutes with our streamlined submission system supporting PDF and Word formats.",
  },
  {
    icon: <Shield size={24} className="text-primary" />,
    title: "Rigorous Peer Review",
    description:
      "Double-blind peer review by expert academics ensures the highest quality of published research.",
  },
  {
    icon: <Users size={24} className="text-primary" />,
    title: "Expert Reviewers",
    description:
      "A network of qualified reviewers from leading Nigerian and international institutions.",
  },
  {
    icon: <Globe size={24} className="text-primary" />,
    title: "Global Visibility",
    description:
      "Published articles are indexed and accessible to researchers worldwide through major academic databases.",
  },
  {
    icon: <CheckCircle size={24} className="text-primary" />,
    title: "Fast Turnaround",
    description:
      "Editorial decisions within 4-6 weeks. Authors receive detailed feedback at every stage.",
  },
  {
    icon: <Award size={24} className="text-primary" />,
    title: "Open Access",
    description:
      "All published articles are freely accessible, maximizing the impact of your research.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Submit",
    description:
      "Author submits manuscript with abstract, keywords and cover letter.",
  },
  {
    step: "02",
    title: "Editorial Review",
    description: "Editor assesses scope, quality and formatting requirements.",
  },
  {
    step: "03",
    title: "Peer Review",
    description:
      "Expert reviewers provide detailed feedback and recommendations.",
  },
  {
    step: "04",
    title: "Decision",
    description: "Editor makes final decision: accept, revise, or reject.",
  },
  {
    step: "05",
    title: "Publication",
    description: "Accepted articles are edited, typeset and published online.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  const { data: journalsData, isLoading } = useQuery({
    queryKey: ["public-journals"],
    queryFn: journalService.getAll,
  });

  const journals = journalsData?.journals ?? [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#17254D] via-[#1e3270] to-[#2A438C] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/70 mb-6 border border-white/20">
              <BookOpen size={12} />
              Open Access Academic Journal
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Advancing Science &
              <span className="text-blue-300"> Engineering </span>
              in Nigeria
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-2xl">
              The Nigerian Journal of Science and Engineering Infrastructure
              (NJSEI) publishes high-quality peer-reviewed research advancing
              knowledge in science, technology, engineering and infrastructure
              development.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/register")}
              >
                Submit Your Research
                <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/journals")}
              >
                Browse Journals
              </Button>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60L1440 60L1440 30C1440 30 1080 0 720 0C360 0 0 30 0 30L0 60Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="text-center hover:shadow-md transition-shadow"
            >
              <p className="text-3xl font-bold text-primary font-serif">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 font-serif mb-4">
            Why Publish with NJSEI?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We provide a rigorous, transparent and efficient publication process
            for researchers across Nigeria and beyond.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 font-serif mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-4">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Our streamlined editorial workflow ensures efficient processing of
              all manuscript submissions.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gray-200 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {workflow.map((item, index) => (
                <div key={item.step} className="text-center">
                  <div
                    className={`
                    w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg font-serif
                    ${index === 0 ? "bg-primary text-white" : "bg-white text-primary border-2 border-primary/30"}
                  `}
                  >
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Journals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-serif mb-2">
              Our Journals
            </h2>
            <p className="text-gray-500">
              Browse our collection of peer-reviewed journals
            </p>
          </div>
          <Link
            to="/journals"
            className="hidden sm:flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : journals.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">
              No journals published yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {journals.map((journal) => (
              <Card
                key={journal.id}
                className="hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                  <BookOpen size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 font-serif mb-1 group-hover:text-primary transition-colors">
                  {journal.title}
                </h3>
                {journal.issn && (
                  <p className="text-xs text-gray-400 mb-2">
                    ISSN: {journal.issn}
                  </p>
                )}
                {journal.description && (
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                    {journal.description}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {journal.sections?.slice(0, 3).map((section) => (
                      <span
                        key={section.id}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {section.title}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-[#17254D] to-[#2A438C] text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif mb-4">
            Ready to Publish Your Research?
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of researchers who have published with NJSEI. Create
            your account today and submit your manuscript.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate("/register")}
            >
              Create Free Account
              <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
