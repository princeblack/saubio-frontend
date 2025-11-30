import type { ReactNode } from 'react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { providerSidebarItems } from '../../components/navigation/providerSidebarConfig';
import { ProviderOnboardingGate } from '../../components/provider/ProviderOnboardingGate';

export default function ProviderLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout allowedRoles={['provider', 'employee', 'admin']} sidebarItems={providerSidebarItems}>
      <ProviderOnboardingGate>{children}</ProviderOnboardingGate>
    </RoleLayout>
  );
}
