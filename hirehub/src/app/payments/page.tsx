export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Payments & Billing
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Payment Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Manage your subscription and payment methods
            </p>
            <div className="max-w-md mx-auto">
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Current Plan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Free tier - Limited features
                </p>
                <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-8">
              Payment management functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 