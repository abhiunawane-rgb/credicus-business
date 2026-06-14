import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Database,
  FileSpreadsheet,
  FileText,
  Headphones,
  Phone,
  Send,
  Shield,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

export const dashboardIcons = {
  users: Users,
  shield: Shield,
  userPlus: UserPlus,
  database: Database,
  barChart3: BarChart3,
  phone: Phone,
  send: Send,
  fileText: FileText,
  fileSpreadsheet: FileSpreadsheet,
  userCog: UserCog,
  headphones: Headphones,
  userCheck: UserCheck,
} as const satisfies Record<string, LucideIcon>;

export type DashboardIconName = keyof typeof dashboardIcons;

export function getDashboardIcon(name: DashboardIconName): LucideIcon {
  return dashboardIcons[name];
}
