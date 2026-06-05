import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Microscope,
  Link2,
  UserCircle,
  LogOut,
} from 'lucide-react';
import './DashboardLayout.css';

const NAV_ITEMS = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
      { to: '/dashboard/diagnosis', icon: Microscope, label: 'Citrus Diagnosis' },
      { to: '/dashboard/blockchain', icon: Link2, label: 'Blockchain Tokens', badge: 'Soon' },
    ],
  },
  {
    section: 'Account',
    items: [
      { to: '/dashboard/profile', icon: UserCircle, label: 'My Profile' },
    ],
  },
];

// Page title mapping
const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', crumb: 'Overview' },
  '/dashboard/diagnosis': { title: 'Citrus Diagnosis', crumb: 'Scanner' },
  '/dashboard/blockchain': { title: 'Blockchain Tokens', crumb: 'Coming Soon' },
  '/dashboard/profile': { title: 'My Profile', crumb: 'Account' },
};

export default function DashboardLayout({ onSignOut, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Dashboard', crumb: '' };
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="dash-layout">
      {/* Mobile hamburger */}
      <button
        className={`dash-hamburger ${sidebarOpen ? 'dash-hamburger--open' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
        id="dash-hamburger"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="dash-overlay dash-overlay--visible"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'dash-sidebar--open' : ''}`} id="dash-sidebar">
        {/* Brand */}
        <div className="dash-sidebar__brand">
          <NavLink to="/dashboard" className="dash-sidebar__brand-link">
            <span className="dash-sidebar__logo-icon">🍋</span>
            <div>
              <span className="dash-sidebar__logo-text">CitriScan</span>
              <span className="dash-sidebar__logo-badge">AI Platform</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="dash-sidebar__nav" id="dash-nav">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <p className="dash-sidebar__nav-label">{group.section}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `dash-sidebar__nav-item ${isActive ? 'dash-sidebar__nav-item--active' : ''}`
                  }
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="dash-sidebar__nav-icon" />
                  {item.label}
                  {item.badge && (
                    <span className="dash-sidebar__nav-badge">{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="dash-sidebar__footer">
          <button className="dash-sidebar__signout" onClick={onSignOut} id="sidebar-signout">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar" id="dash-topbar">
          <div className="dash-topbar__page-info">
            <h1 className="dash-topbar__page-title">{pageInfo.title}</h1>
            <div className="dash-topbar__breadcrumb">
              <span>CitriScan</span>
              <span className="dash-topbar__breadcrumb-sep">/</span>
              <span>{pageInfo.crumb}</span>
            </div>
          </div>

          <div className="dash-topbar__user">
            <NavLink to="/dashboard/profile" className="dash-topbar__user-pill" id="topbar-user-pill">
              <div className="dash-topbar__avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <div className="dash-topbar__user-name">{displayName}</div>
                {user?.email && (
                  <div className="dash-topbar__user-email">{user.email}</div>
                )}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content via nested routes */}
        <div className="dash-content">
          <Outlet context={{ user, onSignOut }} />
        </div>
      </main>
    </div>
  );
}
