export const metadata = {
  title: 'Sign In — Feel Sharper',
  description: 'Sign in to your Feel Sharper account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-600">
              Sign in to continue to Feel Sharper
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-600">
              Sign-in functionality will be restored soon.
            </p>
            <a 
              href="/dashboard" 
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}