import type { SidebarItem } from './Sidebar';
import {
  BarChart3,
  BriefcaseBusiness,
  CircleUser,
  Wallet,
  LifeBuoy,
  MapPin,
  IdCard,
  Coins,
  ReceiptText,
  CalendarClock,
  LineChart,
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
    href: '/prestataire/profile',
    labelKey: 'sidebar.provider.profileSection',
    icon: <CircleUser className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/profile',
        labelKey: 'sidebar.provider.profilePublic',
      },
      {
        href: '/prestataire/profile#address',
        labelKey: 'sidebar.provider.profileAddress',
      },
      {
        href: '/prestataire/profile#service-areas',
        labelKey: 'sidebar.provider.profileAreas',
      },
      {
        href: '/prestataire/onboarding/identity',
        labelKey: 'sidebar.provider.profileIdentity',
      },
    ],
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
        href: '/prestataire/profile#pricing',
        labelKey: 'sidebar.provider.earningsPricing',
      },
      {
        href: '/prestataire/revenus#invoices',
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
    href: '/prestataire/onboarding/identity',
    labelKey: 'sidebar.provider.documentsShortcut',
    icon: <IdCard className="h-5 w-5" />,
  },
  {
    href: '/prestataire/disponibilites',
    labelKey: 'sidebar.provider.availabilitySection',
    icon: <CalendarClock className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/disponibilites',
        labelKey: 'sidebar.provider.availabilitySchedule',
      },
      {
        href: '/prestataire/disponibilites#time-off',
        labelKey: 'sidebar.provider.availabilityTimeOff',
      },
    ],
  },
  {
    href: '/prestataire/statistiques',
    labelKey: 'sidebar.provider.statsSection',
    icon: <LineChart className="h-5 w-5" />,
    children: [
      {
        href: '/prestataire/statistiques',
        labelKey: 'sidebar.provider.statsReliability',
      },
      {
        href: '/prestataire/statistiques#reviews',
        labelKey: 'sidebar.provider.statsReviews',
      },
    ],
  },
  {
    href: '/prestataire/profile#pricing',
    labelKey: 'sidebar.provider.pricingShortcut',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    href: '/prestataire/revenus#invoices',
    labelKey: 'sidebar.provider.invoicesShortcut',
    icon: <ReceiptText className="h-5 w-5" />,
  },
  {
    href: '/prestataire/profile#service-areas',
    labelKey: 'sidebar.provider.zonesShortcut',
    icon: <MapPin className="h-5 w-5" />,
  },
];
