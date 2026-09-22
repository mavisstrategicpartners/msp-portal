import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Coffee, CheckCircle2, XCircle, Search } from "lucide-react";

// Mock data shared across dashboards
const MOCK_STAFF = [
  { id: 1, name: "Siphelele Malotana", role: "Software Engineer", status: "Clocked In", time: "08:00", hours: "3h 45m", department: "Engineering" },
  { id: 2, name: "Thandi Mokoena", role: "HR Manager", status: "On Break", time: "07:45", hours: "4h 00m", department: "HR" },
  { id: 3, name: "David Smith", role: "Intern", status: "Clocked Out", time: "-", hours: "0h 0m", department: "Marketing" },
  { id: 4, name: "Sarah Johnson", role: "Sales Executive", status: "Clocked In", time: "09:15", hours: "2h 30m", department: "Sales" },
  { id: 5, name: "Michael Chang", role: "Intern", status: "Clocked In", time: "08:30", hours: "3h 15m", department: "Engineering" },
];

export function StaffAttendanceBoard({ title = "Staff Attendance", description = "Monitor real-time check-ins and breaks across all departments." }) {
  const [search, setSearch] = useState("");
  
  // Try to pull local storage state for the current user to make it feel real
  const localState = typeof window !== 'undefined' ? localStorage.getItem("staff.attendance.state")?.replace(/"/g, '') : null;
  
  const allStaff = [...MOCK_STAFF];
  // Find if we are in the list, if not, add our live state
  const currentUserName = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('sb-tkjytjaerfjpghusrwom-auth-token') || '{}')?.user?.user_metadata?.full_name : null;
  
  if (currentUserName && !allStaff.find(s => s.name === currentUserName)) {
    allStaff.unshift({
      id: 999,
      name: currentUserName,
      role: "Staff",
      status: localState || "Clocked Out",
      time: localState && localState !== "Clocked Out" ? "Today" : "-",
      hours: "Live",
      department: "Your Department"
    });
  }

  const filtered = allStaff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.department.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: allStaff.length,
    active: allStaff.filter(s => s.status === "Clocked In").length,
    break: allStaff.filter(s => s.status === "On Break").length,
    out: allStaff.filter(s => s.status === "Clocked Out").length,
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Total Staff</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Clocked In</p>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-500/20" />
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-orange-500">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">On Break</p>
            <p className="text-2xl font-bold mt-1">{stats.break}</p>
          </div>
          <Coffee className="w-8 h-8 text-orange-500/20" />
        </Card>
        <Card className="p-4 border-border/70 flex items-center justify-between border-l-4 border-l-gray-400">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Clocked Out</p>
            <p className="text-2xl font-bold mt-1">{stats.out}</p>
          </div>
          <XCircle className="w-8 h-8 text-gray-400/20" />
        </Card>
      </div>

      <Card className="border-border/70">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, role, or department..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
              <tr>
                <th className="px-6 py-3 font-semibold">Staff Member</th>
                <th className="px-6 py-3 font-semibold">Department</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Clock In Time</th>
                <th className="px-6 py-3 font-semibold text-right">Hours Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(staff => (
                <tr key={staff.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{staff.department}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                      staff.status === 'Clocked In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      staff.status === 'On Break' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{staff.time}</td>
                  <td className="px-6 py-4 text-right font-mono font-medium">{staff.hours}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No staff members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
