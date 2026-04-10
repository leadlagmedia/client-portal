import { LayoutDashboard, Users, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  const clientItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
  ];

  const adminItems = [
    { title: "Overview", url: "/", icon: LayoutDashboard },
    { title: "Clients", url: "/admin", icon: Users },
  ];

  const items = isAdmin ? adminItems : clientItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Lead-Lag Media">
            <rect width="40" height="40" rx="8" fill="hsl(40, 80%, 55%)" />
            <path d="M10 28V12h4v12h8v4H10z" fill="hsl(220, 40%, 7%)" />
            <path d="M24 28V12h4v16h-4z" fill="hsl(220, 40%, 7%)" opacity="0.7" />
            <path d="M30 12h-2v4h2v-4z" fill="hsl(220, 40%, 7%)" opacity="0.5" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">Lead-Lag Media</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Client Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 mb-2 px-1">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
            {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.company}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground gap-2"
          onClick={() => logout.mutate()}
          data-testid="button-logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
