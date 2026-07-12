import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const avatarUrl = user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-accent-bg text-accent' : 'text-text hover:bg-accent-bg hover:text-accent'}`;

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-accent">IdeaXchange</Link>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/profile" className={linkClass}>My Reputation</NavLink>
        {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 rounded-md bg-accent-bg text-accent hover:bg-accent-border"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-9 h-9 rounded-full border-2 border-accent"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'; }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
