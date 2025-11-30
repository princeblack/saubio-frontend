import type { SidebarItem } from './Sidebar';
import { CalendarDays, LifeBuoy, CircleUser, Bell, BarChart3, Users, CreditCard } from 'lucide-react';

export const clientSidebarItems: SidebarItem[] = [
  {
    href: '/client/dashboard',
    labelKey: 'sidebar.client.dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: '/client/bookings',
    labelKey: 'sidebar.client.bookings',
    icon: <CalendarDays className="h-5 w-5" />,
    children: [
      {
        href: '/bookings/new',
        labelKey: 'sidebar.client.new',
      },
    ],
  },
  {
    href: '/client/notifications',
    labelKey: 'sidebar.client.notifications',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    href: '/client/providers',
    labelKey: 'sidebar.client.providers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/client/support',
    labelKey: 'sidebar.client.support',
    icon: <LifeBuoy className="h-5 w-5" />,
  },
  {
    href: '/client/payments/mandates',
    labelKey: 'sidebar.client.mandates',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: '/client/profile',
    labelKey: 'sidebar.client.profile',
    icon: <CircleUser className="h-5 w-5" />,
  },
];
