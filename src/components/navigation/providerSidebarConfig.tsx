import type { SidebarItem } from './Sidebar';
import {
  BarChart3,
  BriefcaseBusiness,
  CircleUser,
  Wallet,
  LifeBuoy,
  Coins,
  CalendarClock,
  LineChart,
  Sparkles,
} from 'lucide-react';

export const providerSidebarItems: SidebarItem[] = [
  {
    href: '/prestataire/dashboard',
    labelKey: 'sidebar.provider.dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/prestataire/missions',
    labelKey: 'sidebar.provider.missions',
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    href: '/prestataire/profile/identity',
    labelKey: 'sidebar.provider.profileSection',
    icon: <CircleUser className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/profile/identity',
        labelKey: 'sidebar.provider.profilePublic',
      },
      {
        href: '/prestataire/profile/address',
        labelKey: 'sidebar.provider.profileAddress',
      },
    ],
  },
  {
    href: '/prestataire/profile/pricing',
    labelKey: 'sidebar.provider.earningsPricing',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    href: '/prestataire/profile/services',
    labelKey: 'sidebar.provider.servicesSection',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    href: '/prestataire/revenus',
    labelKey: 'sidebar.provider.earningsSection',
    icon: <Wallet className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/revenus',
        labelKey: 'sidebar.provider.earningsOverview',
      },
      {
        href: '/prestataire/revenus/documents',
        labelKey: 'sidebar.provider.earningsInvoices',
      },
    ],
  },
  {
    href: '/prestataire/ressources',
    labelKey: 'sidebar.provider.supportSection',
    icon: <LifeBuoy className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/ressources',
        labelKey: 'sidebar.provider.supportLibrary',
      },
      {
        href: '/prestataire/onboarding',
        labelKey: 'sidebar.provider.supportChecklist',
      },
    ],
  },
  {
    href: '/prestataire/disponibilites',
    labelKey: 'sidebar.provider.availabilitySection',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    href: '/prestataire/statistiques',
    labelKey: 'sidebar.provider.statsSection',
    icon: <LineChart className="h-5 w-5" />,
  },
];
