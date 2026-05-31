'use client';

import React from 'react';

interface FormActionsProps {
  universityId?: string;
  onBack: () => void;
}

export default function FormActions({ universityId, onBack }: FormActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3 pb-6">
      <button type="button" onClick={onBack} className="btn-secondary">Cancel</button>
      <button type="submit" className="btn-primary px-8">
        {universityId ? 'Update University' : 'Add University'}
      </button>
    </div>
  );
}
