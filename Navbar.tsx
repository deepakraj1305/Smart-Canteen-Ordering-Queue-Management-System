import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ClipboardList, Home, LayoutDashboard, LogOut, Menu, ReceiptText, ShieldCheck, ShoppingCart, Ticket, UtensilsCrossed, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Logo from './Logo';

export function StudentNavbar() {
  const { user, displayName, signOut } = useAuth();
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/orders', label: 'My Orders', icon: ClipboardList },
    { to: '/serving', label: 'Live Counter', icon: Ticket }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ' +
                (isActive ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900')
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:border-orange-300 hover:text-orange-600"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-orange-300"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{displayName}</span>
                <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-xl"
                  >
                    <Link
                      to="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    >
                      <ClipboardList className="h-4 w-4" /> My Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-stone-800 sm:block"
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-orange-100 bg-white md:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ' +
                    (isActive ? 'bg-orange-100 text-orange-700' : 'text-stone-600')
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600"
                >
                  <LogOut className="h-4 w-4" /> Sign out ({displayName})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-stone-900 px-3 py-2.5 text-sm font-bold text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function AdminSidebar() {
  const { displayName, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open ]);

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Live Orders', icon: ReceiptText, end: false },
    { to: '/admin/menu', label: 'Menu Manager', icon: UtensilsCrossed, end: false },
    { to: '/admin/counter', label: 'Serving Counter', icon: Ticket, end: false }
  ];

  const sidebar = (
    <div className="flex h-full flex-col bg-stone-950 text-stone-200">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <Logo light />
        <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 lg:hidden" aria-label="Close sidebar">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs font-semibold text-amber-300">
        <ShieldCheck className="h-4 w-4" /> Canteen Staff Console
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ' +
              (isActive ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-900/40' : 'text-stone-400 hover:bg-white/5 hover:text-white')
            }
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-400 transition hover:bg-white/5 hover:text-white"
        >
          <Home className="h-4 w-4" /> View Student Site
        </Link>
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-sm font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{displayName}</p>
            <p className="text-xs text-stone-400">Canteen Admin</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate('/admin/login');
            }}
            className="grid h-9 w-9 place-items-center rounded-lg text-stone-400 transition hover:bg-rose-500/20 hover:text-rose-300"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-stone-950 px-4 lg:hidden">
        <Logo light />
        <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white" aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
