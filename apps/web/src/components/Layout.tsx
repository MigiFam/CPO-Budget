import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/Button';
import { LogOut, LayoutDashboard, Building2, DollarSign, FolderKanban, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-primary">
              CPO Budgets
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-sm hover:text-primary">
                <LayoutDashboard className="inline w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <Link to="/facilities" className="text-sm hover:text-primary">
                <Building2 className="inline w-4 h-4 mr-1" />
                Facilities
              </Link>
              <Link to="/funding-sources" className="text-sm hover:text-primary">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Funding
              </Link>
              <Link to="/projects" className="text-sm hover:text-primary">
                <FolderKanban className="inline w-4 h-4 mr-1" />
                Projects
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="text-sm text-right hidden sm:block">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                to="/facilities" 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 className="w-4 h-4" />
                Facilities
              </Link>
              <Link 
                to="/funding-sources" 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <DollarSign className="w-4 h-4" />
                Funding
              </Link>
              <Link 
                to="/projects" 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FolderKanban className="w-4 h-4" />
                Projects
              </Link>
              <div className="sm:hidden border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Capital Projects Office
        </div>
      </footer>
    </div>
  );
}
