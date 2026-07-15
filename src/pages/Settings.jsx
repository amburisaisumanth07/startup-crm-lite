import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

// Components
import ProfileCard from '../components/settings/ProfileCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import NotificationCard from '../components/settings/NotificationCard';
import AuthCard from '../components/settings/AuthCard';

/**
 * Settings page component.
 * Displays application settings including Profile, Appearance, Notifications, and Authentication.
 * Uses Framer Motion to animate the entry of settings cards.
 *
 * @returns {React.JSX.Element}
 */
export default function Settings() {
  // Page stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-light text-primary dark:bg-primary/10 rounded-lg">
              <SettingsIcon className="h-6 w-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-main dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-sm text-text-muted dark:text-zinc-400 mt-1">
            Manage your account profiles, customize theme preferences, configure notifications, and manage auth sessions.
          </p>
        </div>
      </div>

      {/* Grid Layout of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <ProfileCard />
        <AppearanceCard />
        <NotificationCard />
        <AuthCard />
      </div>
    </motion.div>
  );
}
