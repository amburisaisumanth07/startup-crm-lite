import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * AppearanceCard component manages Light/Dark theme configuration.
 * It reuses the application-wide ThemeContext to apply styling changes instantly.
 * Features a custom switch and selectable mode previews with smooth Framer Motion animations.
 *
 * @returns {React.JSX.Element}
 */
export default function AppearanceCard() {
  const { isDarkMode, toggleTheme } = useTheme();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut', delay: 0.1 } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="glass-panel bg-bg-surface dark:bg-zinc-900 border border-border-subtle dark:border-zinc-700 rounded-2xl p-6 shadow-premium hover:shadow-xl transition-all duration-300"
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle dark:border-zinc-800 pb-4 mb-6">
        <div className="p-2 bg-primary-light text-primary dark:bg-primary/10 rounded-lg">
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </div>
        <h2 className="text-lg font-bold text-text-main dark:text-white">Appearance</h2>
      </div>

      {/* Theme Settings Description & Toggle */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-text-main dark:text-white">Theme Mode</h3>
          <p className="text-xs text-text-muted dark:text-zinc-400 mt-1">
            Choose between light and dark visual themes.
          </p>
        </div>

        {/* Custom Toggle Switch */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme mode"
          className={`relative h-8 w-14 rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
            isDarkMode ? 'bg-primary' : 'bg-border-strong dark:bg-zinc-700'
          }`}
        >
          <motion.div
            layout
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-md"
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {isDarkMode ? (
              <Moon className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-warning" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Visual Theme Selection Boxes */}
      <div className="grid grid-cols-2 gap-4">
        {/* Light Mode Box */}
        <button
          onClick={() => { if (isDarkMode) toggleTheme(); }}
          className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
            !isDarkMode
              ? 'border-primary bg-primary-light/30 dark:bg-primary/5 shadow-subtle'
              : 'border-border-subtle dark:border-zinc-800 bg-bg-surface-hover/30 hover:bg-bg-surface-hover/80 dark:bg-zinc-800/20'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-warning">
            <Sun className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-text-main dark:text-zinc-300">Light Theme</span>
        </button>

        {/* Dark Mode Box */}
        <button
          onClick={() => { if (!isDarkMode) toggleTheme(); }}
          className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
            isDarkMode
              ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-subtle'
              : 'border-border-subtle dark:border-zinc-800 bg-bg-surface-hover/30 hover:bg-bg-surface-hover/80 dark:bg-zinc-800/20'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-primary">
            <Moon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-text-main dark:text-zinc-300">Dark Theme</span>
        </button>
      </div>
    </motion.div>
  );
}
