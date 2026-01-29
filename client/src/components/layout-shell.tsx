import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  LogOut,
  Stethoscope,
  Activity,
  History,
  Menu,
  X,
  Calendar,
  Pill,
  Wifi,
  FileText,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user || !profile) return null;

  const isDoctor = profile.role === "doctor";

  const navigation = [
    { name: "Consultations", href: "/consultations", icon: UserCheck },
    { name: "Teleconsult", href: "/teleconsult", icon: Wifi },
    { name: "Records", href: "/records", icon: FileText },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Prescriptions", href: "/prescriptions", icon: Pill },
    ...(isDoctor
      ? [
          { name: "Queue", href: "/doctor", icon: Activity },
          { name: "Completed", href: "/doctor/completed", icon: History },
        ]
      : [
          { name: "Patients", href: "/facilitator/patients", icon: Users },
        ])
  ];

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
          <Stethoscope className="h-6 w-6" />
          <span>TeleMed</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b hidden md:flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900">TeleMed</h1>
              <p className="text-xs text-muted-foreground font-medium">Rural Healthcare</p>
            </div>
          </div>

          <div className="p-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                {profile.role === "doctor" ? "Dr" : user.firstName?.[0] || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate text-sm">
                  {profile.role === "doctor" ? `Dr. ${user.lastName}` : `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-gray-500")} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] md:h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
