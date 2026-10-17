import {
  BarChart3,
  BookOpen,
  Building,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileQuestion,
  Film,
  History,
  Home,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  Trophy,
  UserCheck,
  Users,
  UserSquare,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { Permission } from "./permissions";

export type NavItem = {
  /** Key under shell.nav.* */
  key: string;
  href: string;
  icon: LucideIcon;
  /** Any one of these grants visibility; omitted = visible to every staff role. */
  permissions?: Permission[];
};

export type NavGroup = { key: string; items: NavItem[] };

/** Admin sidebar structure (spec 05 §6). Each route lives under src/app/admin/. */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "overview",
    items: [{ key: "dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    key: "recruitment",
    items: [
      { key: "applicants", href: "/admin/applicants", icon: Users, permissions: ["applicants.read"] },
      { key: "identityReviews", href: "/admin/identity-reviews", icon: ShieldCheck, permissions: ["identity.review"] },
      { key: "interviews", href: "/admin/interviews", icon: Video, permissions: ["interviews.review"] },
      { key: "decisions", href: "/admin/decisions", icon: UserCheck, permissions: ["applications.decide"] },
    ],
  },
  {
    key: "training",
    items: [
      { key: "courses", href: "/admin/courses", icon: BookOpen, permissions: ["training.manage"] },
      { key: "courseVideos", href: "/admin/course-videos", icon: Film, permissions: ["training.manage"] },
      { key: "questionBank", href: "/admin/quiz/questions", icon: FileQuestion, permissions: ["quiz.manage"] },
      { key: "quizConfig", href: "/admin/quiz/config", icon: SlidersHorizontal, permissions: ["quiz.manage"] },
      { key: "attempts", href: "/admin/quiz/attempts", icon: Trophy, permissions: ["quiz.results.read"] },
    ],
  },
  {
    key: "properties",
    items: [
      { key: "locations", href: "/admin/locations", icon: MapPin, permissions: ["properties.manage"] },
      { key: "compounds", href: "/admin/compounds", icon: Building, permissions: ["properties.manage"] },
      { key: "propertyTypes", href: "/admin/property-types", icon: Home, permissions: ["properties.manage"] },
      { key: "unitModels", href: "/admin/unit-models", icon: ClipboardList, permissions: ["properties.manage"] },
      { key: "media", href: "/admin/media", icon: ImageIcon, permissions: ["properties.manage"] },
      { key: "pricing", href: "/admin/pricing", icon: Tag, permissions: ["prices.manage"] },
    ],
  },
  {
    key: "sales",
    items: [
      { key: "leads", href: "/admin/leads", icon: UserSquare, permissions: ["leads.manage", "leads.read_all"] },
      { key: "assignments", href: "/admin/assignments", icon: ClipboardCheck, permissions: ["leads.assign"] },
      { key: "assignmentHistory", href: "/admin/assignment-history", icon: History, permissions: ["leads.read_all"] },
    ],
  },
  {
    key: "administration",
    items: [
      { key: "users", href: "/admin/users", icon: Users, permissions: ["users.manage"] },
      { key: "roles", href: "/admin/roles", icon: KeyRound, permissions: ["roles.manage"] },
      { key: "reports", href: "/admin/reports", icon: BarChart3, permissions: ["reports.read"] },
      { key: "auditLogs", href: "/admin/audit-logs", icon: FileClock, permissions: ["audit.read"] },
      { key: "settings", href: "/admin/settings", icon: Settings, permissions: ["settings.manage"] },
    ],
  },
];

/** Find the nav item that owns a pathname (longest matching href wins). */
export function navItemForPath(pathname: string): NavItem | undefined {
  return NAV_GROUPS.flatMap((g) => g.items)
    .filter((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
