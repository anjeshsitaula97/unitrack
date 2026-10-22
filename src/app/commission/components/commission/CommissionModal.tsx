"use client";

import CommissionModalHeader from "./CommissionModalHeader";
import CommissionUniversityField from "./CommissionUniversityField";
import CommissionCourseField from "./CommissionCourseField";
import CommissionPartnershipField from "./CommissionPartnershipField";
import CommissionTypeSelector from "./CommissionTypeSelector";
import CommissionValueFields from "./CommissionValueFields";
import CommissionModalFooter from "./CommissionModalFooter";
import { useCommissionModalForm } from "./useCommissionModalForm";
import type { CommissionModalProps } from "./types";

export default function CommissionModal({
  universities,
  courses,
  initial,
  saving,
  onClose,
  onSave,
}: CommissionModalProps) {
  const form = useCommissionModalForm({ universities, courses, initial });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <CommissionModalHeader isEditing={!!initial} />

        <CommissionUniversityField
          universities={universities}
          value={form.univId}
          onChange={form.handleUnivChange}
        />

        {form.univId && (
          <CommissionCourseField
            courses={form.univCourses}
            value={form.courseId}
            onChange={form.setCourseId}
          />
        )}

        {form.univId && !form.isCourseLevel && (
          <CommissionPartnershipField
            value={form.partnershipAmount}
            onChange={form.setPartnershipAmount}
          />
        )}

        {form.univId && (
          <>
            <CommissionTypeSelector value={form.commissionType} onChange={form.handleTypeChange} />

            {form.commissionType !== "None" && (
              <CommissionValueFields
                type={form.commissionType}
                value={form.commissionValue}
                currency={form.commissionCurrency}
                onValueChange={form.setCommissionValue}
                onCurrencyChange={form.setCommissionCurrency}
              />
            )}
          </>
        )}

        <CommissionModalFooter
          saving={saving}
          disabled={form.valueInvalid}
          onClose={onClose}
          onSave={() =>
            onSave(
              form.univId,
              form.courseId,
              form.commissionType,
              form.commissionValue,
              form.commissionCurrency,
              form.partnershipAmount
            )
          }
        />
      </div>
    </div>
  );
}
