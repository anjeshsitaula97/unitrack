"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AddPartnerForm from "./partnership/AddPartnerForm";
import PartnersGrid from "./partnership/PartnersGrid";
import PartnershipHeader from "./partnership/PartnershipHeader";
import PartnershipStats from "./partnership/PartnershipStats";
import PartnershipToolbar from "./partnership/PartnershipToolbar";
import PartnershipsTable from "./partnership/PartnershipsTable";
import type { NewPartner, Partner, Tab, Univ } from "./partnership/types";

function emptyPartner(): NewPartner {
  return {
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    countries: [],
  };
}

export default function PartnershipContent() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [universities, setUniversities] = useState<Univ[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("partnerships");
  const [search, setSearch] = useState("");
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState<NewPartner>(emptyPartner);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const [partnersRes, univRes] = await Promise.all([
          fetch("/api/partners", { signal: controller.signal }),
          fetch("/api/universities?perPage=500&status=Active", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        if (partnersRes.ok) {
          const p = await partnersRes.json();
          setPartners(Array.isArray(p) ? p : []);
        }
        if (univRes.ok) {
          const u = await univRes.json();
          const list = Array.isArray(u) ? u : u.data || [];
          setUniversities(list);
        }
      } catch {
        if (controller.signal.aborted) return;
        toast.error("Failed to load partnership data");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const addPartnerInFlightRef = useRef(false);

  const handleAddPartner = async () => {
    if (addPartnerInFlightRef.current) return;
    if (!newPartner.name) {
      toast.error("Partner name is required");
      return;
    }
    if (newPartner.countries.length === 0) {
      toast.error("Select at least one country");
      return;
    }
    addPartnerInFlightRef.current = true;
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      const data = await res.json();
      if (res.ok) {
        setPartners([data, ...partners]);
        setNewPartner(emptyPartner());
        setShowAddPartner(false);
        toast.success("Partner added successfully");
      } else {
        toast.error(data.error || "Failed to add partner");
      }
    } catch {
      toast.error("Error adding partner");
    } finally {
      addPartnerInFlightRef.current = false;
    }
  };

  const partneredUniversities = useMemo(
    () => universities.filter((u) => u.partnerId),
    [universities]
  );

  const totalPartnershipAmount = useMemo(
    () => partneredUniversities.reduce((sum, u) => sum + (Number(u.partnershipAmount) || 0), 0),
    [partneredUniversities]
  );

  const partnerStudentCount = useMemo(
    () => partners.reduce((sum, p) => sum + (p._count?.students || 0), 0),
    [partners]
  );

  const universityCountByPartner = useMemo(() => {
    const map: Record<string, number> = {};
    partneredUniversities.forEach((u) => {
      if (u.partnerId) map[u.partnerId] = (map[u.partnerId] || 0) + 1;
    });
    return map;
  }, [partneredUniversities]);

  const filteredPartnerships = useMemo(() => {
    if (!search) return partneredUniversities;
    const q = search.toLowerCase();
    return partneredUniversities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        u.partner?.name?.toLowerCase().includes(q)
    );
  }, [partneredUniversities, search]);

  const filteredPartners = useMemo(() => {
    if (!search) return partners;
    const q = search.toLowerCase();
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contactPerson?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
    );
  }, [partners, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin size-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <PartnershipHeader
        partnerCount={partners.length}
        partneredUniversityCount={partneredUniversities.length}
        showAddPartner={showAddPartner}
        onToggleAddPartner={() => setShowAddPartner(!showAddPartner)}
      />

      {showAddPartner && (
        <AddPartnerForm
          partner={newPartner}
          onChange={setNewPartner}
          onClose={() => setShowAddPartner(false)}
          onCreate={handleAddPartner}
        />
      )}

      {/* Stats strip */}
      <PartnershipStats
        partnerCount={partners.length}
        partneredUniversityCount={partneredUniversities.length}
        studentCount={partnerStudentCount}
        totalAmount={totalPartnershipAmount}
      />

      {/* Search + Tabs */}
      <PartnershipToolbar
        tab={tab}
        onTabChange={setTab}
        search={search}
        onSearchChange={setSearch}
      />

      {tab === "partnerships" ? (
        <PartnershipsTable universities={filteredPartnerships} />
      ) : (
        <PartnersGrid
          partners={filteredPartners}
          universityCountByPartner={universityCountByPartner}
        />
      )}
    </div>
  );
}
