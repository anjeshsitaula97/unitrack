import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const AttendanceStatsCards = ({
  present,
  late,
  absent,
}: {
  present: number;
  late: number;
  absent: number;
}) => (
  <div className="grid grid-cols-3 gap-3 mb-4">
    <div className="bg-emerald-50 rounded-xl p-4 text-center">
      <CheckCircle size={20} className="text-emerald-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-emerald-700">{present}</div>
      <div className="text-xs text-emerald-600 font-medium">Present</div>
    </div>
    <div className="bg-amber-50 rounded-xl p-4 text-center">
      <AlertTriangle size={20} className="text-amber-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-amber-700">{late}</div>
      <div className="text-xs text-amber-600 font-medium">Late</div>
    </div>
    <div className="bg-rose-50 rounded-xl p-4 text-center">
      <XCircle size={20} className="text-rose-600 mx-auto mb-1" />
      <div className="text-2xl font-bold text-rose-700">{absent}</div>
      <div className="text-xs text-rose-600 font-medium">Absent</div>
    </div>
  </div>
);

export default AttendanceStatsCards;
