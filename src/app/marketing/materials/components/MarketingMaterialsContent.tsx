"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/fetch-client";
import MarketingCreateModal from "./materials/MarketingCreateModal";
import MarketingFilters from "./materials/MarketingFilters";
import MarketingHeader from "./materials/MarketingHeader";
import MarketingRequestsList from "./materials/MarketingRequestsList";
import MarketingStats from "./materials/MarketingStats";
import type {
  CreateFormState,
  FilterState,
  MarketingRequest,
  MarketingUser,
} from "./materials/types";

export default function MarketingMaterialsContent() {
  const [requests, setRequests] = useState<MarketingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: "All",
    type: "All",
    priority: "All",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>({
    title: "",
    description: "",
    type: "Graphic Design",
    priority: "Medium",
    dueDate: "",
    assignedTo: "",
  });
  const [users, setUsers] = useState<MarketingUser[]>([]);
  const isCreatingRef = useRef(false);

  const fetchRequests = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status !== "All") params.append("status", filters.status);
        if (filters.type !== "All") params.append("type", filters.type);
        if (filters.priority !== "All") params.append("priority", filters.priority);
        if (filters.search) params.append("search", filters.search);

        const data = await api.get<{ requests?: MarketingRequest[] }>(
          `/api/marketing/requests?${params.toString()}`,
          { signal, showError: false }
        );
        if (signal?.aborted) return;
        if (data?.requests) setRequests(data.requests);
      } catch (error) {
        if (signal?.aborted) return;
        console.error("Failed to fetch requests:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      await fetchRequests(controller.signal);
    };
    load();
    return () => controller.abort();
  }, [fetchRequests]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<MarketingUser[] | { users: MarketingUser[] }>("/api/users", {
          showError: false,
        });
        if (cancelled) return;
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    setIsCreating(true);
    try {
      const res = await fetch("/api/marketing/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({
          title: "",
          description: "",
          type: "Graphic Design",
          priority: "Medium",
          dueDate: "",
          assignedTo: "",
        });
        fetchRequests();
      }
    } catch (error) {
      console.error("Failed to create request:", error);
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (requestId: number, status: string) => {
    try {
      const res = await fetch(`/api/marketing/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="space-y-6">
      <MarketingHeader onCreate={() => setShowCreateModal(true)} />

      <MarketingStats requests={requests} />

      <MarketingFilters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <MarketingRequestsList
        requests={requests}
        isLoading={isLoading}
        onCreate={() => setShowCreateModal(true)}
        onUpdateStatus={handleUpdateStatus}
        onDownload={handleDownload}
      />

      {showCreateModal && (
        <MarketingCreateModal
          createForm={createForm}
          setCreateForm={setCreateForm}
          users={users}
          isCreating={isCreating}
          onSubmit={handleCreateRequest}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
