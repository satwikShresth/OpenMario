/**
 * Central icon registry — all app icons are defined here.
 * To swap any icon, change only its mapping in this file.
 *
 * Usage:
 *   import { SearchIcon, WarningIcon } from '@/components/icons'
 *   <Icon as={SearchIcon} />   // Chakra pattern
 *   <SearchIcon size={16} />   // Direct JSX
 */

import type { LucideProps } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Clipboard,
  ClipboardList,
  Clock,
  Database,
  Download,
  DollarSign,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Heart,
  Home,
  Hourglass,
  Info,
  Lightbulb,
  List,
  ListFilter,
  Mail,
  MailCheck,
  MapPin,
  Menu,
  MessageCircle,
  Monitor,
  MonitorX,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Sun,
  TriangleAlert,
  Trash2,
  Upload,
  Users,
  Wand2,
  X,
  XCircle,
} from 'lucide-react';

export type AppIcon = React.ComponentType<LucideProps>;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const ArrowLeftIcon = ArrowLeft;
export const ArrowRightIcon = ArrowRight;
export const ArrowUpIcon = ArrowUp;
export const ArrowDownIcon = ArrowDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
export const ChevronUpIcon = ChevronUp;
export const ChevronDownIcon = ChevronDown;
export const SortIcon = ChevronsUpDown;
export const SortAscIcon = ChevronUp;
export const SortDescIcon = ChevronDown;
export const ExternalLinkIcon = ExternalLink;

// ─── Layout / Sidebar ────────────────────────────────────────────────────────
export const MenuIcon = Menu;
export const SidebarCollapseIcon = PanelLeftClose;
export const SidebarExpandIcon = PanelLeftOpen;

// ─── Theme ───────────────────────────────────────────────────────────────────
export const MoonIcon = Moon;
export const SunIcon = Sun;

// ─── Actions ─────────────────────────────────────────────────────────────────
export const AddIcon = Plus;
export const AddCircleIcon = PlusCircle;
export const CloseIcon = X;
export const CheckIcon = Check;
export const SearchIcon = Search;
export const FilterIcon = ListFilter;
export const DeleteIcon = Trash2;
export const DownloadIcon = Download;
export const UploadIcon = Upload;
export const RefreshIcon = RefreshCw;
export const ClipboardIcon = Clipboard;

// ─── Status / Feedback ───────────────────────────────────────────────────────
export const CheckCircleIcon = CheckCircle;
export const ErrorIcon = XCircle;
export const WarningIcon = TriangleAlert;
export const InfoIcon = Info;
export const HourglassIcon = Hourglass;
export const EmptyIcon = Palette;

// ─── Domain — Finance ────────────────────────────────────────────────────────
export const DollarSignIcon = DollarSign;
export const SalaryIcon = DollarSign;

// ─── Domain — People / Org ───────────────────────────────────────────────────
export const UsersIcon = Users;
export const BriefcaseIcon = Briefcase;
export const StarIcon = Star;
export const MapPinIcon = MapPin;

// ─── Domain — Education ──────────────────────────────────────────────────────
export const BookOpenIcon = BookOpen;
export const GraduationCapIcon = GraduationCap;
export const ListIcon = List;
export const LightbulbIcon = Lightbulb;

// ─── Domain — Scheduling ─────────────────────────────────────────────────────
export const CalendarIcon = Calendar;
export const CalendarDaysIcon = CalendarDays;
export const CalendarPlusIcon = CalendarPlus;
export const ClockIcon = Clock;

// ─── Domain — Files / Data ───────────────────────────────────────────────────
export const FileTextIcon = FileText;
export const DatabaseIcon = Database;

// ─── Domain — Communication ──────────────────────────────────────────────────
export const MessageCircleIcon = MessageCircle;
export const GithubIcon = Github;
export const MailIcon = Mail;
export const MailReadIcon = MailCheck;
export const SurveyIcon = ClipboardList;

// ─── Domain — Misc ───────────────────────────────────────────────────────────
export const HomeIcon = Home;
export const MonitorIcon = Monitor;
export const MonitorOffIcon = MonitorX;
export const AutoFillIcon = Sparkles;
export const WandIcon = Wand2;

// ─── Custom: Filled Heart ────────────────────────────────────────────────────
export const HeartIcon = Heart;
export const HeartFilledIcon = (props: LucideProps) => (
  <Heart fill="currentColor" {...props} />
);

// ─── Custom: Day-of-week letter squares (for course schedule filters) ─────────
function createLetterSquare(letter: string, filled: boolean): AppIcon {
  return function LetterSquare({ size = 24, color, style, className, ...props }: LucideProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        color={color}
        style={style}
        className={className}
        aria-hidden="true"
        {...(props as React.SVGProps<SVGSVGElement>)}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill={filled ? 'var(--chakra-colors-bg, white)' : 'currentColor'}
          stroke="none"
        >
          {letter}
        </text>
      </svg>
    );
  };
}

export const SquareMIcon = createLetterSquare('M', false);
export const SquareMFilledIcon = createLetterSquare('M', true);
export const SquareTIcon = createLetterSquare('T', false);
export const SquareTFilledIcon = createLetterSquare('T', true);
export const SquareWIcon = createLetterSquare('W', false);
export const SquareWFilledIcon = createLetterSquare('W', true);
export const SquareFIcon = createLetterSquare('F', false);
export const SquareFFilledIcon = createLetterSquare('F', true);
