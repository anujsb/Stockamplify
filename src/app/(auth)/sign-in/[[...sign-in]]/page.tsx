import { SignIn } from '@clerk/nextjs';
import Header from "@/components/header";

export default function SignInPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <section className="relative px-6 py-20 flex items-center justify-center">
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-300">Sign in to access your stock dashboard</p>
            </div>
            {/* <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20"> */}
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
                  card: 'bg-transparent shadow-none',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-gray-300',
                  socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
                  formFieldLabel: 'text-white',
                  formFieldInput: 'bg-white/10 border-white/20 text-white placeholder-gray-400',
                  footerActionLink: 'text-blue-400 hover:text-blue-300',
                  identityPreviewText: 'text-white',
                  formButtonReset: 'text-blue-400 hover:text-blue-300'
                }
              }}
              redirectUrl="/portfolio"
              signUpUrl="/sign-up"
            />
            {/* Terms & Conditions Text */}
            <p className="text-xs text-gray-300 mt-4 text-center">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-blue-400 hover:underline">
                Terms and Conditions
              </a>.
            </p>
            {/* </div> */}
          </div>
        </section>
      </div>
    </>
  );
}
