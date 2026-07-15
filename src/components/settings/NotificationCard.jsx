import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

/**
 * NotificationCard component handles email and browser notification preferences.
 * State is managed locally and persisted via the `useLocalStorage` hook.
 *
 * @returns {React.JSX.Element}
 */
export default function NotificationCard() {
  const [emailNotifications, setEmailNotifications] = useLocalStorage(
    'crm-settings-email-notifications',
    true
  );
  const [browserNotifications, setBrowserNotifications] = useLocalStorage(
    'crm-settings-browser-notifications',
    false
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut', delay: 0.2 } 
    }
  };

  const toggleEmail = () => setEmailNotifications((prev) => !prev);
  const toggleBrowser = () => setBrowserNotifications((prev) => !prev);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="glass-panel bg-bg-surface dark:bg-zinc-900 border border-border-subtle dark:border-zinc-700 rounded-2xl p-6 shadow-premium hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle dark:border-zinc-800 pb-4 mb-6">
        <div className="p-2 bg-primary-light text-primary dark:bg-primary/10 rounded-lg">
          <Bell className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-text-main dark:text-white">Notifications</h2>
      </div>

      <div className="space-y-6">
        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-main dark:text-white">Email Notifications</h3>
            <p className="text-xs text-text-muted dark:text-zinc-400 mt-1">
              Receive automated summaries and activity alerts.
            </p>
          </div>

          <button
            onClick={toggleEmail}
            aria-label="Toggle email notifications"
            className={`relative h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              emailNotifications ? 'bg-primary' : 'bg-border-strong dark:bg-zinc-700'
            }`}
          >
            <motion.div
              layout
              className="h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
          </button>
        </div>

        {/* Browser Notifications Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-main dark:text-white">Browser Notifications</h3>
            <p className="text-xs text-text-muted dark:text-zinc-400 mt-1">
              Get real-time system alerts and status banners.
            </p>
          </div>

          <button
            onClick={toggleBrowser}
            aria-label="Toggle browser notifications"
            className={`relative h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              browserNotifications ? 'bg-primary' : 'bg-border-strong dark:bg-zinc-700'
            }`}
          >
            <motion.div
              layout
              className="h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
