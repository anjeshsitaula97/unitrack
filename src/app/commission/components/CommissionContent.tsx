"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCommissionData } from "./commission/useCommissionData";
import type { CommissionRow, ModalInitial } from "./commission/types";
import CommissionHeader from "./commission/CommissionHeader";
import CommissionStats from "./commission/CommissionStats";
import CommissionSearch from "./commission/CommissionSearch";
import CommissionTable from "./commission/CommissionTable";
import CommissionInfoBox from "./commission/CommissionInfoBox";
import CommissionModal from "./commission/CommissionModal";

export default function CommissionContent() {
  const {
    universities,
    courses,
    loading,
    saving,
    commissioned,
    commissionedCourses,
    allCommissioned,
    totalFlatValue,
    rows,
    handleSave: saveCommission,
  } = useCommissionData();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<ModalInitial | null>(null);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        (r.commissionCurrency || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  function openAdd() {
    setModalInitial(null);
    setModalOpen(true);
  }

  function openEdit(row: CommissionRow) {
    setModalInitial({
      kind: row.kind,
      univId: row.univId,
      courseId: row.courseId,
      commissionType: row.commissionType,
      commissionValue: row.commissionValue,
      commissionCurrency: row.commissionCurrency,
      partnershipAmount: row.partnershipAmount,
    });
    setModalOpen(true);
  }

  async function handleSave(
    univId: string,
    courseId: string,
    commissionType: string,
    commissionValue: string,
    commissionCurrency: string,
    partnershipAmount: string
  ) {
    const saved = await saveCommission(
      univId,
      courseId,
      commissionType,
      commissionValue,
      commissionCurrency,
      partnershipAmount
    );
    if (saved) {
      setModalOpen(false);
      setModalInitial(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <CommissionHeader onAdd={openAdd} />

      <CommissionStats
        allCommissionedCount={allCommissioned.length}
        commissionedCount={commissioned.length}
        commissionedCoursesCount={commissionedCourses.length}
        totalFlatValue={totalFlatValue}
      />

      <CommissionSearch value={search} onChange={setSearch} />

      <CommissionTable rows={rows} filteredRows={filteredRows} onEdit={openEdit} />

      <CommissionInfoBox />

      {modalOpen && (
        <CommissionModal
          universities={universities}
          courses={courses}
          initial={modalInitial}
          saving={saving}
          onClose={() => {
            if (!saving) setModalOpen(false);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
