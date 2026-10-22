"use client";

import { Loader2 } from "lucide-react";
import ConsultanciesHeader from "./consultancies/ConsultanciesHeader";
import ConsultancyFormModal from "./consultancies/ConsultancyFormModal";
import ConsultancyTable from "./consultancies/ConsultancyTable";
import { useConsultancies } from "./consultancies/useConsultancies";

export default function ConsultanciesContent() {
  const {
    consultancies,
    isLoading,
    activeId,
    modalOpen,
    setModalOpen,
    editing,
    form,
    setForm,
    isSaving,
    isUploading,
    busyId,
    fileInputRef,
    openCreate,
    openEdit,
    handleLogoUpload,
    handleSave,
    handleDelete,
    switchTo,
    isActive,
  } = useConsultancies();

  return (
    <div className="animate-fade-in relative block min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      )}

      <ConsultanciesHeader count={consultancies.length} onCreate={openCreate} />

      <ConsultancyTable
        consultancies={consultancies}
        isLoading={isLoading}
        activeId={activeId}
        busyId={busyId}
        onSwitch={switchTo}
        onEdit={openEdit}
        onDelete={handleDelete}
        isActive={isActive}
      />

      {modalOpen && (
        <ConsultancyFormModal
          editing={editing}
          form={form}
          setForm={setForm}
          isSaving={isSaving}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onLogoUpload={handleLogoUpload}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
