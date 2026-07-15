import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * ProfileCard component displays the logged-in user's profile details.
 * It reads current user information from the AuthContext and renders
 * a circular initials-based avatar, full name, email address, and role.
 *
 * @returns {React.JSX.Element}
 */
export default function ProfileCard() {
  const { user } = useAuth();

  // Helper to extract user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const name = user?.name || 'Guest User';
  const email = user?.email || 'guest@example.com';
  const role = user?.role || 'User';
  const initials = getInitials(name);

  // Animation variants matching requirements
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="glass-panel bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-premium hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center gap-3 border-b border-border-subtle pb-4 mb-6">
        <div className="p-2 bg-primary-light text-primary dark:bg-primary/10 rounded-lg">
          <User className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-text-main">Profile</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular Avatar */}
        <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white font-extrabold text-2xl shadow-premium shrink-0 ring-4 ring-primary-light dark:ring-primary/15">
          {initials}
          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-success border-2 border-bg-surface" />
        </div>

        {/* User Details */}
        <div className="flex-1 text-center sm:text-left space-y-3 min-w-0 w-full">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              Full Name
            </label>
            <p className="text-base font-semibold text-text-main truncate mt-0.5">
              {name}
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              Email Address
            </label>
            <p className="text-sm text-text-muted truncate mt-0.5">
              {email}
            </p>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              Role
            </label>
            <div className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary dark:bg-primary/10">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
