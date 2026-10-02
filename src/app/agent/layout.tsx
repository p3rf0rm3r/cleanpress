"use client";

import AppLayout from "@/components/AppLayout";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout allowedRoles={["agent", "gerant", "administrateur"]}>
      {children}
    </AppLayout>
  );
}