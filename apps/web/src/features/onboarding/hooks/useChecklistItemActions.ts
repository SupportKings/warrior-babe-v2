import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateChecklistItem, deleteChecklistItem, addChecklistItem } from "../actions/updateChecklistItem";
import { onboardingQueries } from "../queries";
import { toast } from "sonner";

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: any }) => {
      return await updateChecklistItem(itemId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingQueries.overview().queryKey });
      toast.success("Checklist item updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update checklist item");
    },
  });
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return await deleteChecklistItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingQueries.overview().queryKey });
      toast.success("Checklist item deleted");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete checklist item");
    },
  });
}

export function useAddChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, templateId, item }: { clientId: string; templateId: string; item: any }) => {
      return await addChecklistItem(clientId, templateId, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingQueries.overview().queryKey });
      toast.success("Checklist item added");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add checklist item");
    },
  });
}