import LoginForm from "@/components/auth/login-form";

export default function SignInPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-credicus-yellow/30 bg-credicus-yellow/10 px-3 py-1 text-xs font-semibold text-credicus-black">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-credicus-yellow" />
          Secure workspace access
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sign in to Credicus</h1>
        <p className="text-sm leading-relaxed text-credicus-gray">
          Enter your work email and password, or choose a demo role below to explore the CRM.
        </p>
      </div>
      <LoginForm />
    </section>
  );
}
