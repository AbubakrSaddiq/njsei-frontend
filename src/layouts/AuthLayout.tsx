import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#17254D] flex-col justify-between p-12">
        <div>
          <h1 className="text-white font-serif text-3xl font-bold">NJSEI</h1>
          <p className="text-white/60 text-sm mt-1">
            Nigerian Journal of Science & Engineering Infrastructure
          </p>
        </div>

        <div>
          <blockquote className="text-white/80 text-xl font-serif leading-relaxed">
            "Advancing science and engineering through rigorous peer review and
            open scholarly discourse."
          </blockquote>
          <p className="text-white/40 text-sm mt-4">
            — NJSEI Editorial Mission
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "500+", label: "Publications" },
            { value: "1,200+", label: "Researchers" },
            { value: "48", label: "Issues Published" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-white text-2xl font-bold font-serif">
                {stat.value}
              </p>
              <p className="text-white/50 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-[#17254D] font-serif text-2xl font-bold">
              NJSEI
            </h1>
            <p className="text-[#565656] text-sm mt-1">
              Nigerian Journal of Science & Engineering Infrastructure
            </p>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
