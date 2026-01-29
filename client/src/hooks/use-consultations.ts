import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertConsultation, type InsertMessage } from "@shared/schema";

export function useConsultations(status?: "pending" | "active" | "completed") {
  return useQuery({
    queryKey: [api.consultations.list.path, status],
    queryFn: async () => {
      const url = new URL(api.consultations.list.path, window.location.origin);
      if (status) url.searchParams.append("status", status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch consultations");
      return api.consultations.list.responses[200].parse(await res.json());
    },
  });
}

export function useConsultation(id: number) {
  return useQuery({
    queryKey: [api.consultations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.consultations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch consultation");
      return api.consultations.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertConsultation) => {
      const validated = api.consultations.create.input.parse(data);
      const res = await fetch(api.consultations.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create consultation");
      return api.consultations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.consultations.list.path] });
    },
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertConsultation> & { id: number }) => {
      const validated = api.consultations.update.input.parse(data);
      const url = buildUrl(api.consultations.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update consultation");
      return api.consultations.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.consultations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.consultations.get.path, id] });
    },
  });
}

export function useMessages(consultationId: number) {
  return useQuery({
    queryKey: [api.messages.list.path, consultationId],
    queryFn: async () => {
      const url = buildUrl(api.messages.list.path, { id: consultationId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.messages.list.responses[200].parse(await res.json());
    },
    enabled: !!consultationId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ consultationId, ...data }: InsertMessage & { consultationId: number }) => {
      const validated = api.messages.create.input.parse(data);
      const url = buildUrl(api.messages.create.path, { id: consultationId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, { consultationId }) => {
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path, consultationId] });
    },
  });
}
