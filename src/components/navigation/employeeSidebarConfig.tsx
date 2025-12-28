import type { SidebarItem } from './Sidebar';
import { PieChart, Users, LifeBuoy, Settings, Inbox, ClipboardCheck, Share2, CalendarClock } from 'lucide-react';

export const employeeSidebarItems: SidebarItem[] = [
  {
    href: '/employee/dashboard',
    labelKey: 'sidebar.employee.dashboard',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    href: '/employee/users',
    labelKey: 'sidebar.employee.users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/employee/providers',
    labelKey: 'sidebar.employee.providers',
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
  {
    href: '/employee/bookings',
    labelKey: 'sidebar.employee.bookings',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    href: '/employee/teams',
    labelKey: 'sidebar.employee.teams',
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    href: '/employee/support',
    labelKey: 'sidebar.employee.support',
    icon: <LifeBuoy className="h-5 w-5" />,
  },
  {
    href: '/employee/operations',
    labelKey: 'sidebar.employee.operations',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    href: '/employee/tickets',
    labelKey: 'sidebar.employee.tickets',
    icon: <Inbox className="h-5 w-5" />,
  },
];
