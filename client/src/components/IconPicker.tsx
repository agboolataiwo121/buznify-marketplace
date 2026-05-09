import { useState, useRef, useEffect } from "react";
import {
  Package, Bot, Globe, Shield, ShieldCheck, Gamepad2, Coins, CreditCard,
  Instagram, Tv, Phone, TrendingUp, Star, Zap, Tag, Layers, Box,
  Music, Film, BookOpen, Code, Cpu, Database, Cloud, Lock,
  Mail, MessageCircle, Bell, Gift, Heart, ShoppingCart, ShoppingBag,
  Wallet, DollarSign, BarChart2, PieChart, Activity, Users, User,
  Settings, Wrench, Key, Link, Search, Filter, Upload, Download,
  Camera, Image, Video, Mic, Headphones, Speaker, Wifi, Bluetooth,
  Smartphone, Monitor, Laptop, Server, HardDrive, Printer,
  Map, MapPin, Navigation, Compass, Globe2, Truck, Car, Plane,
  Coffee, Pizza, Utensils, ShoppingBasket, Store, Building2,
  Briefcase, FileText, Clipboard, Archive, Folder, FolderOpen,
  Calendar, Clock, Timer, AlarmClock, Hourglass, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Info, HelpCircle,
  ThumbsUp, Award, Trophy, Medal, Crown, Gem, Diamond,
  Flame, Bolt, Leaf, Sun, Moon, Snowflake, Droplets, Wind,
  Rocket, Satellite, Telescope, Microscope, Atom,
  Brush, Palette, Pen, PenTool, Scissors, Ruler,
  Bitcoin, Coins as CoinsAlt, Banknote, Receipt, Calculator,
  ChevronRight, ArrowRight, ExternalLink, Share2, Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export const ICON_MAP: Record<string, React.ElementType> = {
  Package, Bot, Globe, Shield, ShieldCheck, Gamepad2, Coins, CreditCard,
  Instagram, Tv, Phone, TrendingUp, Star, Zap, Tag, Layers, Box,
  Music, Film, BookOpen, Code, Cpu, Database, Cloud, Lock,
  Mail, MessageCircle, Bell, Gift, Heart, ShoppingCart, ShoppingBag,
  Wallet, DollarSign, BarChart2, PieChart, Activity, Users, User,
  Settings, Wrench, Key, Link, Search, Filter, Upload, Download,
  Camera, Image, Video, Mic, Headphones, Speaker, Wifi, Bluetooth,
  Smartphone, Monitor, Laptop, Server, HardDrive, Printer,
  Map, MapPin, Navigation, Compass, Globe2, Truck, Car, Plane,
  Coffee, Pizza, Utensils, ShoppingBasket, Store, Building2,
  Briefcase, FileText, Clipboard, Archive, Folder, FolderOpen,
  Calendar, Clock, Timer, AlarmClock, Hourglass, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Info, HelpCircle,
  ThumbsUp, Award, Trophy, Medal, Crown, Gem, Diamond,
  Flame, Bolt, Leaf, Sun, Moon, Snowflake, Droplets, Wind,
  Rocket, Satellite, Telescope, Microscope, Atom,
  Brush, Palette, Pen, PenTool, Scissors, Ruler,
  Bitcoin, Banknote, Receipt, Calculator,
  ChevronRight, ArrowRight, ExternalLink, Share2, Eye,
};

// Deduplicate keys
const ICON_NAMES = Array.from(new Set(Object.keys(ICON_MAP)));

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
  iconColor?: string;
}

export default function IconPicker({ value, onChange, iconColor = "text-violet-400" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = ICON_NAMES.filter(name =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = ICON_MAP[value] ?? Package;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:border-white/20 transition-all text-sm text-foreground"
      >
        <SelectedIcon className={`w-4 h-4 ${iconColor}`} />
        <span className="flex-1 text-left">{value || "Select icon…"}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 min-w-[280px] bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl p-3">
          {/* Search */}
          <Input
            autoFocus
            placeholder="Search icons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white/5 border-white/10 text-sm mb-3 h-8"
          />

          {/* Icon grid */}
          <div className="grid grid-cols-7 gap-1 max-h-52 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="col-span-7 text-center text-xs text-muted-foreground py-4">No icons found</p>
            ) : (
              filtered.map(name => {
                const Icon = ICON_MAP[name];
                const isSelected = name === value;
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => { onChange(name); setOpen(false); setSearch(""); }}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })
            )}
          </div>

          {/* Selected name footer */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {value ? <><span className={iconColor}>{value}</span> selected</> : "Click an icon to select"}
          </p>
        </div>
      )}
    </div>
  );
}
