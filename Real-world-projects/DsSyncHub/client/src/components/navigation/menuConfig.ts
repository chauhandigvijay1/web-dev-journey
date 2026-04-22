import {
  Activity,
  Calendar,
  CreditCard,
  Files,
  LayoutDashboard,
  MessageSquareText,
  Video,
  NotebookPen,
  Settings,
  SquareKanban,
  CheckSquare,
  Users,
} from 'lucide-react'

export const appMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Workspaces', path: '/workspaces', icon: SquareKanban },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Notes', path: '/notes', icon: NotebookPen },
  { label: 'Chat', path: '/chat', icon: MessageSquareText },
  { label: 'Meetings', path: '/meetings', icon: Video },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
  { label: 'Files', path: '/files', icon: Files },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Activity', path: '/activity', icon: Activity },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Settings', path: '/settings', icon: Settings },
] as const
