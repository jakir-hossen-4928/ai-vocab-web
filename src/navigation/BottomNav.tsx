import { Home, BookOpen, GraduationCap, User, Globe } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
  { path: "/dictionary", icon: Globe, label: "Dictionary" },
  { path: "/resources", icon: GraduationCap, label: "Resources" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom md:hidden pb-[var(--safe-area-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-primary transition-colors"
            activeClassName="text-primary font-medium"
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
