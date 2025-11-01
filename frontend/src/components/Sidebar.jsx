import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ShoppingCart,
  MessageSquare,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const location = useLocation();
  const user = auth.getUser();
  const logout = useLogout();

  const navItems = [
    { to: "/dashboard", label: "My Calendar", icon: CalendarDays },
    { to: "/marketplace", label: "Marketplace", icon: ShoppingCart },
    { to: "/requests", label: "Swapping Requests", icon: MessageSquare },
    { to: "/new-event", label: "New Event", icon: PlusCircle },
  ];

  const handleLogout = () => {
    logout();
  };

  // Generate user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a color based on user name for avatar background
  const getAvatarColor = (name) => {
    if (!name) return "bg-blue-500";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="h-16 flex items-center px-6 border-b">
        <Link to="/dashboard" className="text-xl font-bold text-blue-600">
          SlotSwapper
        </Link>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {user && (
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${getAvatarColor(
                user.name
              )}`}
            >
              {getUserInitials(user.name)}
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}
