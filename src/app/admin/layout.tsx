"use client";

import AppLayout from "@/components/AppLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout allowedRoles={["administrateur"]}>
      {children}
    </AppLayout>
  );
}