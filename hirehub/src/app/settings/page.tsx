export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your personal information and preferences
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Settings
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Configure how you receive updates about new opportunities
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Privacy & Security
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Control your data and account security settings
            </p>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Settings functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 