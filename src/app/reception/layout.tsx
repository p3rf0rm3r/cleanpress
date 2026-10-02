"use client";

import AppLayout from "@/components/AppLayout";

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout allowedRoles={["receptionniste", "gerant", "administrateur"]}>
      {children}
    </AppLayout>
  );
}