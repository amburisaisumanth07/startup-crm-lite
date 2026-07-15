import { motion } from 'framer-motion';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthCard component displays authentication status and allows the user to log out.
 * Reads user data and invokes the logout function from AuthContext.
 *
 * @returns {React.JSX.Element}
 */
export default function AuthCard() {
  const { user, logout } = useAuth();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut', delay: 0.3 } 
    }
  };

  const email = user?.email || 'guest@example.com';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="glass-panel bg-bg-surface dark:bg-zinc-900 border border-border-subtle dark:border-zinc-700 rounded-2xl p-6 shadow-premium hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border-subtle dark:border-zinc-800 pb-4 mb-6">
          <div className="p-2 bg-primary-light text-primary dark:bg-primary/10 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-text-main dark:text-white">Authentication</h2>
        </div>

        {/* Auth Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted dark:text-zinc-400">Status</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success-light dark:bg-success/10 text-success text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              Logged In
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-text-muted dark:text-zinc-400 shrink-0">Signed in as</span>
            <span className="text-sm font-semibold text-text-main dark:text-zinc-200 truncate" title={email}>
              {email}
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-danger-light text-danger dark:bg-danger/10 dark:text-danger hover:bg-danger hover:text-white dark:hover:bg-danger dark:hover:text-white font-semibold transition-all duration-200 cursor-pointer shadow-subtle hover:shadow-premium"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
