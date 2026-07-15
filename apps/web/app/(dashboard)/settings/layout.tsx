import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Settings — FlowMind AI",
    default: "Settings — FlowMind AI",
  },
  description:
    "Manage your FlowMind workspace settings, API keys, team members, and preferences.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
