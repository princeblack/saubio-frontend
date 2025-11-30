import type { SidebarItem } from './Sidebar';
import { PieChart, Users, LifeBuoy, Settings, Inbox, ClipboardCheck, Share2, CalendarClock } from 'lucide-react';

export const adminSidebarItems: SidebarItem[] = [
  {
    href: '/admin/dashboard',
    labelKey: 'sidebar.admin.dashboard',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    href: '/admin/users',
    labelKey: 'sidebar.admin.users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/admin/providers',
    labelKey: 'sidebar.admin.providers',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    href: '/admin/bookings',
    labelKey: 'sidebar.admin.bookings',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    href: '/admin/teams',
    labelKey: 'sidebar.admin.teams',
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    href: '/admin/support',
    labelKey: 'sidebar.admin.support',
    icon: <LifeBuoy className="h-5 w-5" />,
  },
  {
    href: '/admin/operations',
    labelKey: 'sidebar.admin.operations',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    href: '/admin/tickets',
    labelKey: 'sidebar.admin.tickets',
    icon: <Inbox className="h-5 w-5" />,
  },
];
