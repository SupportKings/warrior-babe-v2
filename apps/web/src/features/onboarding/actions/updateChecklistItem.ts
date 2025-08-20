"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function updateChecklistItem(
  itemId: string,
  updates: {
    title?: string;
    description?: string;
    is_required?: boolean;
  }
) {
  const session = await getUser();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("checklist_items")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("Error updating checklist item:", error);
    throw new Error(`Failed to update checklist item: ${error.message}`);
  }

  return data;
}

export async function deleteChecklistItem(itemId: string) {
  const session = await getUser();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // First delete related progress items
  await supabase
    .from("client_onboarding_progress")
    .delete()
    .eq("checklist_item_id", itemId);

  // Then delete the checklist item
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error deleting checklist item:", error);
    throw new Error(`Failed to delete checklist item: ${error.message}`);
  }

  return { success: true };
}

export async function addChecklistItem(
  clientId: string,
  templateId: string,
  item: {
    title: string;
    description?: string;
    is_required?: boolean;
    sort_order?: number;
  }
) {
  const session = await getUser();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Create the checklist item
  const { data: newItem, error: itemError } = await supabase
    .from("checklist_items")
    .insert([
      {
        title: item.title,
        description: item.description ?? null,
        is_required: item.is_required ?? false,
        sort_order: item.sort_order ?? 0,
        template_id: templateId,
      }
    ])
    .select()
    .single();

  if (itemError) {
    console.error("Error creating checklist item:", itemError);
    throw new Error(`Failed to create checklist item: ${itemError.message}`);
  }

  // Create progress entry for this client
  const { error: progressError } = await supabase
    .from("client_onboarding_progress")
    .insert({
      client_id: clientId,
      checklist_item_id: newItem.id,
      is_completed: false,
      created_at: new Date().toISOString(),
    });

  if (progressError) {
    console.error("Error creating progress entry:", progressError);
    throw new Error(`Failed to create progress entry: ${progressError.message}`);
  }

  return newItem;
}