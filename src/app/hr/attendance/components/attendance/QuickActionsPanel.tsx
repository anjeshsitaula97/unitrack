import { Clock, Loader2, MapPin, Camera, ShieldCheck } from "lucide-react";
import type { AttendanceAction, AttendanceRecord } from "./types";

const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const clockTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: browserTimeZone,
});

const formatClockTime = (value: string) => clockTimeFormatter.format(new Date(value));

const QuickActionsPanel = ({
  myStatus,
  checking,
  proceedWithAction,
}: {
  myStatus: AttendanceRecord | null;
  checking: boolean;
  proceedWithAction: (action: AttendanceAction) => void;
}) => (
  <div className="card p-5">
    <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
    {myStatus ? (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Checked in at</p>
          <p className="text-lg font-bold text-slate-800">{formatClockTime(myStatus.checkIn)}</p>
          {myStatus.checkInLat && myStatus.checkInLng && (
            <a
              href={`https://www.google.com/maps?q=${myStatus.checkInLat},${myStatus.checkInLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 hover:underline"
              title="Open in Google Maps"
            >
              <MapPin size={10} /> {myStatus.checkInLat.toFixed(4)},{" "}
              {myStatus.checkInLng.toFixed(4)}
            </a>
          )}
          {myStatus.checkInPhoto && (
            <button
              type="button"
              onClick={() => window.open(myStatus.checkInPhoto!, "_blank", "noopener,noreferrer")}
              className="text-[10px] text-indigo-600 flex items-center gap-1 mt-1 hover:underline"
            >
              <Camera size={10} /> View photo
            </button>
          )}
          {myStatus.checkOut && (
            <>
              <p className="text-xs text-slate-500 mt-2 mb-1">Checked out at</p>
              <p className="text-lg font-bold text-slate-800">
                {formatClockTime(myStatus.checkOut)}
              </p>
              {myStatus.checkOutLat && myStatus.checkOutLng && (
                <a
                  href={`https://www.google.com/maps?q=${myStatus.checkOutLat},${myStatus.checkOutLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 hover:underline"
                  title="Open in Google Maps"
                >
                  <MapPin size={10} /> {myStatus.checkOutLat.toFixed(4)},{" "}
                  {myStatus.checkOutLng.toFixed(4)}
                </a>
              )}
            </>
          )}
          <div className="mt-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                myStatus.status === "Present"
                  ? "bg-emerald-50 text-emerald-700"
                  : myStatus.status === "Late"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
              }`}
            >
              {myStatus.status}
            </span>
          </div>
        </div>
        {!myStatus.checkOut && (
          <button
            type="button"
            onClick={() => proceedWithAction("checkout")}
            disabled={checking}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            Face Verification Check Out
          </button>
        )}
      </div>
    ) : (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 text-center">
          <Clock size={24} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Not checked in today</p>
        </div>
        <button
          type="button"
          onClick={() => proceedWithAction("checkin")}
          disabled={checking}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {checking ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          Face Verification Check In
        </button>
      </div>
    )}
  </div>
);

export default QuickActionsPanel;
