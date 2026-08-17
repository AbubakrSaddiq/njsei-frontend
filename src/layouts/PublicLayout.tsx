import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function PublicLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2A438C] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">
                  N
                </span>
              </div>
              <div>
                <span className="font-bold text-[#17254D] font-serif text-lg">
                  NJSEI
                </span>
                <span className="hidden sm:block text-xs text-gray-400 leading-none">
                  Nigerian Journal of Science & Engineering
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/journals"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Journals
              </Link>
              <Link
                to="/about"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                to="/submit"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                Submit
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <Link
              to="/journals"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Journals
            </Link>
            <Link
              to="/about"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/submit"
              className="block text-sm text-gray-600 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit
            </Link>
            <div className="pt-2 space-y-2">
              {isAuthenticated ? (
                <Button fullWidth onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                  <Button fullWidth onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <Outlet />

      {/* Footer */}
      <footer className="bg-[#17254D] text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-serif font-bold text-xl mb-3">NJSEI</h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Nigerian Journal of Science and Engineering Infrastructure.
                Advancing research through rigorous peer review and open
                scholarly discourse.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">
                Platform
              </h4>
              <ul className="space-y-2">
                {[
                  "Submit Manuscript",
                  "Review Process",
                  "Editorial Board",
                  "Guidelines",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-white/50 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">
                Resources
              </h4>
              <ul className="space-y-2">
                {[
                  "Author Guidelines",
                  "Reviewer Guide",
                  "Ethics Policy",
                  "Contact Us",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      to="#"
                      className="text-white/50 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} NJSEI. All rights reserved.
            </p>
            <p className="text-white/40 text-xs">Built with Laravel & React</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
