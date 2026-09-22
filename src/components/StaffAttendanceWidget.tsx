import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Coffee, CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/use-local-storage";

type AttendanceState = "Clocked Out" | "Clocked In" | "On Break";

export function StaffAttendanceWidget() {
  const [state, setState] = useLocalStorage<AttendanceState>("staff.attendance.state", "Clocked Out");
  const [clockInTime, setClockInTime] = useLocalStorage<number | null>("staff.attendance.clockInTime", null);
  const [breakStartTime, setBreakStartTime] = useLocalStorage<number | null>("staff.attendance.breakStartTime", null);
  const [totalBreakMs, setTotalBreakMs] = useLocalStorage<number>("staff.attendance.totalBreakMs", 0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setState("Clocked In");
    setClockInTime(Date.now());
    setTotalBreakMs(0); // Reset break time for the new day
    toast.success("Clocked In", { description: "Have a great day at work!" });
  };

  const handleStartBreak = () => {
    setState("On Break");
    setBreakStartTime(Date.now());
    toast("Break Started", { description: "Enjoy your break!" });
  };

  const handleEndBreak = () => {
    if (breakStartTime) {
      setTotalBreakMs(prev => prev + (Date.now() - breakStartTime));
    }
    setState("Clocked In");
    setBreakStartTime(null);
    toast("Break Ended", { description: "Welcome back." });
  };

  const handleClockOut = () => {
    // If they were on break, finalize the break time
    if (state === "On Break" && breakStartTime) {
      setTotalBreakMs(prev => prev + (Date.now() - breakStartTime));
      setBreakStartTime(null);
    }
    setState("Clocked Out");
    toast.success("Clocked Out", { description: "Great work today! See you tomorrow." });
  };

  const calculateHoursWorked = () => {
    if (!clockInTime) return "0h 0m";
    const endTime = state === "Clocked Out" ? Date.now() : now; 
    // Wait, if clocked out, we don't show the active timer, we just reset or show the last session? 
    // Let's just show 0h 0m when clocked out for simplicity, or the last duration.
    if (state === "Clocked Out") return "0h 0m";

    let elapsed = endTime - clockInTime - totalBreakMs;
    if (state === "On Break" && breakStartTime) {
      elapsed -= (now - breakStartTime);
    }

    const totalMinutes = Math.max(0, Math.floor(elapsed / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="flex flex-col border-border/70 p-5 transition-colors hover:border-primary/40 relative overflow-hidden">
      {/* Decorative background element */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20 ${
        state === 'Clocked In' ? 'bg-green-500' : state === 'On Break' ? 'bg-orange-500' : 'bg-gray-500'
      }`} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Time Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your attendance</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold font-mono tracking-tight">
            {calculateHoursWorked()}
          </div>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
            Active Time
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-2 relative z-10">
        {state === "Clocked Out" && (
          <Button onClick={handleClockIn} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all hover:scale-[1.02]">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Clock In
          </Button>
        )}

        {state === "Clocked In" && (
          <>
            <Button onClick={handleStartBreak} variant="outline" className="flex-1 border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-400">
              <Coffee className="w-4 h-4 mr-2" />
              Take Break
            </Button>
            <Button onClick={handleClockOut} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          </>
        )}

        {state === "On Break" && (
          <>
            <Button onClick={handleEndBreak} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Resume Work
            </Button>
            <Button onClick={handleClockOut} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Clock Out
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium relative z-10">
        <span className="text-muted-foreground">Status:</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
          state === 'Clocked In' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          state === 'On Break' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {state}
        </span>
      </div>
    </Card>
  );
}
