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
  Download,
  DollarSign,
  ExternalLink,
  FileText,
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
  Skull,
  Wand2,
  X,
  XCircle,
} from 'lucide-react';
import { VscMcp } from 'react-icons/vsc';
import type { IconBaseProps } from 'react-icons';

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
/** VS Code MCP glyph — used for the OpenMario MCP install page / nav */
export const McpIcon = (props: LucideProps) => {
   const { size = 24, color, className, style, ...rest } = props;
   return (
      <VscMcp
         size={typeof size === 'number' || typeof size === 'string' ? size : 24}
         color={color}
         className={className}
         style={style}
         {...(rest as IconBaseProps)}
      />
   );
};

// ─── Domain — Communication ──────────────────────────────────────────────────
export const MessageCircleIcon = MessageCircle;
/** lucide dropped brand icons; keep GitHub logo here for the sidebar link */
export const GithubIcon = (props: LucideProps) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.size ?? 24}
      height={props.size ?? 24}
      fill="currentColor"
      aria-hidden="true"
      className={props.className}
      style={props.style}
      color={props.color}
      {...(props as React.SVGProps<SVGSVGElement>)}
   >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
   </svg>
);
export const MailIcon = Mail;
export const MailReadIcon = MailCheck;
export const SurveyIcon = ClipboardList;

// ─── Domain — Misc ───────────────────────────────────────────────────────────
export const HomeIcon = Home;
export const ShaftIcon = Skull;
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
