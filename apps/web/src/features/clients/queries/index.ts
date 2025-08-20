'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'sonner';
import {
    createClient,
    updateClient,
    deleteClient,
    assignUserToClient,
    removeAssignment,
    getClientById,
    type ClientFormData,
    type AssignmentData,
    getClients,
    getClientAssignments,
    getClientProduct,
    getUsersForAssignment,
    getProducts
} from '../actions';
import { clientQueryKeys } from './keys';
import type { Product } from '@/features/capacity/types/capacity';

// Export query keys

/**
 * Hook to fetch all clients with details
 */
export function useClients() {
  return useQuery({
    queryKey: clientQueryKeys.list({}),
    queryFn: async () => {
      const result = await getClients();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: clientQueryKeys.detail(id),
    queryFn: async () => {
      const result = await getClientById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClientFormData) => createClient(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
        toast.success('Client created successfully!');
      } else {
        toast.error(`Failed to create client: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
}

/**
 * Hook to update an existing client
 */
export function useUpdateClient(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      updateClient(id, data),
    onSuccess: (result, { id }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(id) });
        if (showToast) {
          toast.success('Client updated successfully!');
        }
      } else {
        if (showToast) {
          toast.error(`Failed to update client: ${result.error}`);
        }
      }
    },
    onError: (error: Error) => {
      if (showToast) {
        toast.error(`Failed to update client: ${error.message}`);
      }
    },
  });
}

/**
 * Hook to delete a client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
        toast.success('Client deleted successfully!');
      } else {
        toast.error(`Failed to delete client: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
}

/**
 * Hook to assign a user (coach or CSC) to a client
 */
export function useAssignUserToClient(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;
  
  return useMutation({
    mutationFn: (data: AssignmentData) => assignUserToClient(data),
    onSuccess: (result, data) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(data.clientId) });
        if (showToast) {
          toast.success(result.message);
        }
      } else {
        if (showToast) {
          toast.error(`Failed to assign user: ${result.error}`);
        }
      }
    },
    onError: (error: Error) => {
      if (showToast) {
        toast.error(`Failed to assign user: ${error.message}`);
      }
    },
  });
}


/**
 * Hook to remove an assignment (coach or CSC) from a client
 */
export function useRemoveAssignment(options?: { showToast?: boolean }) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;
  
  return useMutation({
    mutationFn: (data: AssignmentData) => removeAssignment(data.clientId, data),
    onSuccess: (result, data) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: clientQueryKeys.detail(data.clientId) });
        if (showToast) {
          toast.success(result.message);
        }
      } else {
        if (showToast) {
          toast.error(`Failed to remove assignment: ${result.error}`);
        }
      }
    },
    onError: (error: Error) => {
      if (showToast) {
        toast.error(`Failed to remove assignment: ${error.message}`);
      }
    },
  });
}

/**
 * Utility function to calculate client statistics from client data (backwards compatibility)
 */
export function useClientStats(clients?: any[]) {
  return useMemo(() => {
    if (!clients || clients.length === 0) {
      return {
        total: 0,
        active: 0,
        onboarding: 0,
        atRisk: 0,
      };
    }

    const total = clients.length;
    const active = clients.filter(client => client.status === 'active').length;
    const onboarding = clients.filter(client => 
      client.onboarding_progress && client.onboarding_progress.percentage < 100
    ).length;
    const atRisk = clients.filter(client => {
      const renewalDate = client.renewal_date ? new Date(client.renewal_date) : null;
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      return renewalDate && renewalDate <= thirtyDaysFromNow;
    }).length;

    return {
      total,
      active,
      onboarding,
      atRisk,
    };
  }, [clients]);
}

/**
 * Hook to fetch coaches (backwards compatibility)
 */
export function useClientAssignments(clientId: string, options?: { enabled?: boolean }) {
  console.log("useClientAssignments", clientId);
  return useQuery({
    queryKey: ['client-assignments', clientId],
    queryFn: async () => {
      const result = await getClientAssignments(clientId);
      console.log(result.data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false && !!clientId,
  });
}

export function useClientProduct(clientId: string) {
  return useQuery({
    queryKey: ['client-product', clientId],
    queryFn: async () => {
      const result = await getClientProduct(clientId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch all users for assignment
 */
export function useUsersForAssignment() {
  return useQuery({
    queryKey: ['users-for-assignment'],
    queryFn: async () => {
      const result = await getUsersForAssignment();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch all products
 */
export function useProducts() {
  console.log("useProducts");
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const result = await getProducts();
      if (!result.success) {
        console.log("result.error", result.error);
        throw new Error(result.error);
      }
      console.log("result.data", result.data);
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Client type for backwards compatibility
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: 'active' | 'paused' | 'churned' | 'offboarded' ;
  created_at: string;
  updated_at?: string;
  product: Product;
  assignments?: Array<{
    id: string;
    user_id: string;
    assignment_type: string;
    start_date: string;
    end_date?: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role?: string;
    };
  }>;
}

// Export types for convenience
export type { ClientFormData, AssignmentData };