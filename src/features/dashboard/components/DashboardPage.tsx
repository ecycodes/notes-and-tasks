import { motion } from "framer-motion";
import {
  FileText,
  CheckSquare,
  TrendingUp,
  Zap,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="bg-white border border-gray-100/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {label}
          </p>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-violet-500 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-50">
          <Icon className="w-4.5 h-4.5 text-violet-500" />
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      <div className="px-4 md:px-10 pt-6 md:pt-8 pb-10 max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-2xl md:text-[1.75rem] lg:text-3xl font-extrabold tracking-tight text-gray-900 leading-none">
            Good morning <span className="text-2xl md:text-[1.75rem] lg:text-3xl">👋</span>
          </h1>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mt-1.5">
            Here's what's happening today
          </p>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            label="Total Notes"
            value="0"
            icon={FileText}
            trend="Start writing"
            delay={0.05}
          />
          <StatCard
            label="Open Tasks"
            value="0"
            icon={CheckSquare}
            trend="All clear!"
            delay={0.1}
          />
          <StatCard
            label="Streak"
            value="0 days"
            icon={Zap}
            trend="Build your habit"
            delay={0.15}
          />
        </div>

        {/* ── Recent Activity ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white border border-gray-100/80 rounded-2xl shadow-sm p-8"
        >
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-6">
            Recent Activity
          </h2>
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No activity yet.</p>
            <p className="text-xs text-gray-300">
              Create your first note or task to get started.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
