import * as React from 'react';

declare module 'lucide-react' {
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Layers: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Search: LucideIcon;
  export const Plus: LucideIcon;
  export const Sparkles: LucideIcon;
  export const User: LucideIcon;
  export const Sun: LucideIcon;
  export const Moon: LucideIcon;
  export const Bell: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const Inbox: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Folder: LucideIcon;
  export const BarChart3: LucideIcon;
  export const History: LucideIcon;
  export const Settings: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Kanban: LucideIcon;
  export const ListFilter: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Table: LucideIcon;
  export const X: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const Send: LucideIcon;
  export const Paperclip: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Circle: LucideIcon;
  export const Trash2: LucideIcon;
  export const Tag: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const FileText: LucideIcon;
  export const FolderPlus: LucideIcon;
  export const Check: LucideIcon;
  export const Mail: LucideIcon;
  export const Link: LucideIcon;
  export const Shield: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const Image: LucideIcon;
  export const Film: LucideIcon;
  export const Code: LucideIcon;
  export const Download: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Target: LucideIcon;
  export const Bot: LucideIcon;
  export const ListPlus: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const FolderKanban: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Smile: LucideIcon;
  export const Reply: LucideIcon;
  export const Edit2: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Users: LucideIcon;
  export const Lock: LucideIcon;
}
