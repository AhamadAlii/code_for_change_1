
import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'py-4 bg-white/80 backdrop-blur-md shadow-sm' : 'py-6 bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">H</span>
          </span>
          <span className="text-xl font-display font-semibold">HealthHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/hospitals" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Hospitals
          </NavLink>
          <NavLink to="/blood-bank" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Blood Bank
          </NavLink>
          <NavLink to="/health-news" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Health News
          </NavLink>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        'md:hidden fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out pt-24',
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <nav className="container mx-auto px-6 py-8 flex flex-col space-y-6">
          <NavLink 
            to="/" 
            className={({isActive}) => isActive ? 'text-xl font-medium text-primary' : 'text-xl font-medium'} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/hospitals" 
            className={({isActive}) => isActive ? 'text-xl font-medium text-primary' : 'text-xl font-medium'} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Hospitals
          </NavLink>
          <NavLink 
            to="/blood-bank" 
            className={({isActive}) => isActive ? 'text-xl font-medium text-primary' : 'text-xl font-medium'} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Blood Bank
          </NavLink>
          <NavLink 
            to="/health-news" 
            className={({isActive}) => isActive ? 'text-xl font-medium text-primary' : 'text-xl font-medium'} 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Health News
          </NavLink>
          <div className="pt-6">
            <button className="btn-primary w-full">Donate Blood</button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
