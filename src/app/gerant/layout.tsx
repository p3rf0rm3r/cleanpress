"use client";

import AppLayout from "@/components/AppLayout";

export default function GerantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout allowedRoles={["gerant", "administrateur"]}>
      {children}
    </AppLayout>
  );
}