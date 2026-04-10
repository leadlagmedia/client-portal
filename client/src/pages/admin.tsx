import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, UserPlus, Users, Building, Shield,
  Loader2, Search
} from "lucide-react";
import type { User } from "@shared/schema";

type SafeUser = Omit<User, "password">;

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-400 border-red-500/20",
  issuer: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  sponsor: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  advisor: "bg-green-500/15 text-green-400 border-green-500/20",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  issuer: "Fund Issuer",
  sponsor: "Sponsor",
  advisor: "Financial Advisor",
};

function CreateUserDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", company: "", role: "issuer",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Client created", description: "Login credentials have been set." });
      setOpen(false);
      setForm({ name: "", email: "", password: "", company: "", role: "issuer" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-create-user">
          <UserPlus className="h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border/60">
        <DialogHeader>
          <DialogTitle>Create Client Account</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="space-y-4 mt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kai Wu"
                required
                className="bg-background/50"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Sparkline Capital"
                required
                className="bg-background/50"
                data-testid="input-company"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="kai@sparklinecapital.com"
              required
              className="bg-background/50"
              data-testid="input-user-email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Set a password"
                required
                className="bg-background/50"
                data-testid="input-user-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="bg-background/50" data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="issuer">Fund Issuer</SelectItem>
                  <SelectItem value="sponsor">Sponsor</SelectItem>
                  <SelectItem value="advisor">Financial Advisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending}
            data-testid="button-submit-user"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/admin/users/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
  });

  const filtered = (users || []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: (users || []).length,
    issuers: (users || []).filter((u) => u.role === "issuer").length,
    sponsors: (users || []).filter((u) => u.role === "sponsor").length,
    advisors: (users || []).filter((u) => u.role === "advisor").length,
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Client Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create and manage portal access for clients
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border/40">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/40">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{stats.issuers}</p>
              <p className="text-xs text-muted-foreground">Issuers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/40">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{stats.sponsors}</p>
              <p className="text-xs text-muted-foreground">Sponsors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/40">
          <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">{stats.advisors}</p>
              <p className="text-xs text-muted-foreground">Advisors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card className="bg-card border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Clients</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm bg-background/50"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground font-medium">Name</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Company</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Email</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Role</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Created</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="border-border/20" data-testid={`row-user-${user.id}`}>
                    <TableCell className="text-sm font-medium">{user.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.company}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${roleColors[user.role] || ""}`}>
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(user.id)}
                          data-testid={`button-delete-${user.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
