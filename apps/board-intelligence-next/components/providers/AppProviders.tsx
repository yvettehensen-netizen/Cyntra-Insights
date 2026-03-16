"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { EventBusProvider } from "@/components/providers/EventBusProvider";
import { OrganizationProvider } from "@/components/providers/OrganizationProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventBusProvider>
        <OrganizationProvider>{children}</OrganizationProvider>
      </EventBusProvider>
    </AuthProvider>
  );
}
