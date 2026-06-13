import { redirect } from "next/navigation";
import { LogOut, Mail, Shield, User } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import IconBadge from "@/components/ui/icon-badge";
import { getAuthSession } from "@/lib/auth-session";

const roleLabels: Record<string, string> = {
  recruiter: "Recruiter",
  team_leader: "Team Leader",
  admin: "Administrator",
};

export default async function DashboardSettingsPage() {
  const session = await getAuthSession();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <IconBadge icon={User} variant="dark" size="lg" />
        <div>
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Settings</h3>
          <p className="text-credicus-gray-light">Manage your session and account context.</p>
        </div>
      </div>

      <div className="ui-card-dark p-6">
        <div className="flex items-center gap-4 border-b border-credicus-border pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-credicus-yellow/15 text-xl font-bold text-credicus-yellow">
            {session.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{session.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-credicus-yellow/30 bg-credicus-yellow/10 px-2.5 py-0.5 text-xs font-medium text-credicus-yellow">
              <Shield className="h-3 w-3" />
              {roleLabels[session.role] ?? session.role}
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-credicus-border bg-credicus-black/50 px-4 py-3">
            <Mail className="h-4 w-4 text-credicus-gray" />
            <div>
              <p className="text-xs text-credicus-gray">Email</p>
              <p className="text-sm text-gray-100">{session.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-credicus-border bg-credicus-black/50 px-4 py-3">
            <Shield className="h-4 w-4 text-credicus-gray" />
            <div>
              <p className="text-xs text-credicus-gray">Role</p>
              <p className="text-sm text-gray-100">{roleLabels[session.role] ?? session.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <LogOut className="h-4 w-4 text-credicus-gray" />
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
