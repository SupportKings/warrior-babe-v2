"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface ClientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  product_id?: string;
  renewal_date?: string;
  platform_link?: string;
  onboarding_notes?: string;
  status?: "active" | "paused" | "churned" | "offboarded";
  start_date?: string;
  end_date?: string;
  assignments?: AssignmentData[];
}

export interface AssignmentData {
  clientId: string;
  userId: string;
  assignmentType: "coach" | "csc";
  start_date?: string;
  end_date?: string;
}

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// Helper function to get Supabase client
async function getSupabase() {
  return await createSupabaseClient();
}

/**
 * Create a new client
 */
export async function createClient(data: ClientFormData) {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await getSupabase();

    // Create client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        product_id: data.product_id,
        renewal_date: data.renewal_date,
        platform_link: data.platform_link,
        onboarding_notes: data.onboarding_notes,
        status: data.status || "active",
        start_date: data.start_date || new Date().toISOString(),
        end_date: data.end_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id,
        churned_at: null,
      })
      .select()
      .single();

    if (clientError) {
      console.error("Error creating client:", clientError);
      throw new Error("Failed to create client");
    }

    // Create coach assignment if provided
    if (data.assignments && client) {
      for (const assignment of data.assignments) {
        const { error: coachError } = await supabase
          .from("client_assignments")
          .insert({
            client_id: client.id,
            user_id: assignment.userId,
            assignment_type: assignment.assignmentType,
            start_date: new Date().toISOString(),
            assigned_by: user.id,
          });

        if (coachError) {
          console.error("Error assigning coach:", coachError);
        }
      }
    }

    revalidatePath("/dashboard/clients");
    return { success: true, data: client };
  } catch (error) {
    console.error("Error in createClient:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Update an existing client
 */
export async function updateClient(
  clientId: string,
  data: Partial<ClientFormData>
) {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await getSupabase();
    // Update client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        product_id: data.product_id,
        renewal_date: data.renewal_date,
        platform_link: data.platform_link,
        onboarding_notes: data.onboarding_notes,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        updated_at: new Date().toISOString(),
        churned_at: data.status === "churned" ? new Date().toISOString() : null,
        paused_at: data.status === "paused" ? new Date().toISOString() : null,
        offboarded_at:
          data.status === "offboarded" ? new Date().toISOString() : null,
      })
      .eq("id", clientId)
      .select()
      .single();

    if (clientError) {
      console.error("Error updating client:", clientError);
      throw new Error("Failed to update client");
    }

    // Update assignments
    if (data.assignments && client) {
      for (const assignment of data.assignments) {
        const { error: assignmentError } = await supabase
          .from("client_assignments")
          .update({
            user_id: assignment.userId,
            assignment_type: assignment.assignmentType,
            start_date: assignment.start_date || new Date().toISOString(),
            end_date: assignment.end_date || null,
          })
          .eq("client_id", clientId)
          .eq("assignment_type", assignment.assignmentType)
          .eq("user_id", assignment.userId);

        if (assignmentError) {
          console.error("Error updating assignment:", assignmentError);
        }
      }
    }

    revalidatePath("/dashboard/clients");
    return { success: true, data: client };
  } catch (error) {
    console.error("Error in updateClient:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string) {
  try {
    await getAuthenticatedUser();
    const supabase = await getSupabase();

    // End all assignments first
    await supabase
      .from("client_assignments")
      .update({ end_date: new Date().toISOString() })
      .eq("client_id", clientId)
      .is("end_date", null);

    // Soft delete the client (update status to churned or add deleted_at field)
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .update({
        status: "churned",
        churned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        end_date: new Date().toISOString(),
      })
      .eq("id", clientId)
      .select()
      .single();

    if (clientError) {
      console.error("Error deleting client:", clientError);
      throw new Error("Failed to delete client");
    }

    revalidatePath("/dashboard/clients");
    return { success: true, data: client };
  } catch (error) {
    console.error("Error in deleteClient:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Assign coach or CSC to client
 */
export async function assignUserToClient(data: AssignmentData) {
  try {
    const user = await getAuthenticatedUser();
    const supabase = await getSupabase();

    // Create new assignment
    const { data: assignment, error: createError } = await supabase
      .from("client_assignments")
      .insert({
        client_id: data.clientId,
        user_id: data.userId,
        assignment_type: data.assignmentType,
        start_date: new Date().toISOString(),
        assigned_by: user.id,
      })
      .select(
        `
        *,
        user:users!client_assignments_user_id_fkey(
          id,
          name,
          email
        )
      `
      )
      .single();

    if (createError) {
      console.error("Error creating assignment:", createError);
      throw new Error("Failed to create assignment");
    }

    revalidatePath("/dashboard/clients");
    return {
      success: true,
      message: `Assignment created successfully`,
      data: assignment,
    };
  } catch (error) {
    console.error("Error in assignUserToClient:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Remove assignment (end date an active assignment)
 */
export async function removeAssignment(
  clientId: string,
  assignmentData: AssignmentData
) {
  try {
    await getAuthenticatedUser();
    const supabase = await getSupabase();

    const { error } = await supabase
      .from("client_assignments")
      .update({ end_date: new Date().toISOString() })
      .eq("client_id", clientId)
      .eq("assignment_type", assignmentData.assignmentType)
      .eq("user_id", assignmentData.userId)
      .is("end_date", null);

    if (error) {
      console.error("Error removing assignment:", error);
      throw new Error("Failed to remove assignment");
    }

    revalidatePath("/dashboard/clients");
    return {
      success: true,
      message: `Assignment removed successfully`,
    };
  } catch (error) {
    console.error("Error in removeAssignment:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Get clients with details (server function for initial data)
 */
export async function getClients() {
  try {
    const supabase = await getSupabase();

    const { data: clients, error } = await supabase
      .from("clients")
      .select(
        `*,
        product:products!clients_product_id_fkey(
          id,
          name,
          description
        ),
        assignments:client_assignments(
          id,
          user_id,
          assignment_type,
          start_date,
          end_date,
          user:user!client_assignments_user_id_fkey(
            id,
            name,
            email,
            image,
            role
          )
			  ),
        client_onboarding_progress:client_onboarding_progress(
          id,
          client_id,
          is_completed,
          completed_at
        )
        `
      )
      .order("created_at", { ascending: false });
    console.log("clients", clients);
    if (error) {
      console.error("Error fetching clients:", error);
      throw new Error("Failed to fetch clients");
    }

    return { success: true, data: clients };
  } catch (error) {
    console.error("Error in getClients:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Get single client with details
 */
export async function getClientById(clientId: string) {
  try {
    const supabase = await getSupabase();

    const { data: client, error } = await supabase
      .from("clients")
      .select(
        `*,
        product:products!clients_product_id_fkey(
          id,
          name,
          description
        ),
        assignments:client_assignments!client_assignments_client_id_fkey(
          id,
          user_id,
          assignment_type,
          start_date,
          end_date,
          user:user!client_assignments_user_id_fkey(
            id,
            name,
            email,
            image,
            role
          )
        ),
        client_onboarding_progress:client_onboarding_progress!client_onboarding_progress_client_id_fkey(
          id,
          client_id,
          is_completed,
          completed_at
        )
        `
      )
      .eq("id", clientId)
      .single();

    if (error) {
      console.error("Error fetching client:", error);
      throw new Error("Failed to fetch client");
    }
   
    return { success: true, data: client };
  } catch (error) {
    console.error("Error in getClientById:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function getClientAssignments(clientId: string) {
  try {
    const supabase = await getSupabase();

    const { data: assignments, error } = await supabase
      .from("client_assignments")
      .select(
        ` id,
          user_id,
          assignment_type,
          start_date,
          end_date,
          user:user!client_assignments_user_id_fkey(
            id,
            name,
            email,
            image,
            role
        )`
      )
      .eq("client_id", clientId);

    if (error) {
      console.error("Error fetching client assignments:", error);
      throw new Error("Failed to fetch client assignments");
    }

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error in getClientAssignments:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function getClientProduct(clientId: string) {
  try {
    const supabase = await getSupabase();

    const { data: product, error } = await supabase
      .from("products")
      .select(`*`)
      .eq("id", clientId);

    if (error) {
      console.error("Error fetching client product:", error);
      throw new Error("Failed to fetch client product");
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error in getClientProduct:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function getClientStats() {
  try {
    const supabase = await getSupabase();

    const { data: stats, error } = await supabase
      .from("clients")
      .select("status, count:id")
      .or(
        "status.eq.active,status.eq.paused,status.eq.churned,status.eq.offboarded"
      );

    if (error) {
      console.error("Error fetching client stats:", error);
      throw new Error("Failed to fetch client stats");
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error in getClientStats:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Get all users with their roles for team assignment
 */
export async function getUsersForAssignment() {
  try {
    const supabase = await getSupabase();

    const { data: users, error } = await supabase
      .from("user")
      .select(
        `
        id,
        name,
        email,
        image,
        role
      `
      )
      .order("name");

    if (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }

    return { success: true, data: users };
  } catch (error) {
    console.error("Error in getUsersForAssignment:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

/**
 * Get all products
 */
export async function getProducts() {
  try {
    const supabase = await getSupabase();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        is_active
      `
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
    console.log("products", products);
    return { success: true, data: products };
  } catch (error) {
    console.error("Error in getProducts:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
