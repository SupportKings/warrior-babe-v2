"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

export async function startOnboarding(clientId: string) {
  const session = await getUser();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Start a transaction-like operation
  try {
    // 1. Update client status to 'onboarding'
    const { error: clientError } = await supabase
      .from("clients")
      .update({
        status: "onboarding",
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId);

    if (clientError) {
      console.error("Error updating client status:", clientError);
      throw new Error(`Failed to update client status: ${clientError.message}`);
    }

    // 2. Get all active onboarding templates with their checklist items
    const { data: templates, error: templateError } = await supabase
      .from("checklist_templates")
      .select(
        `
				id,
				name,
				type
			`
      )
      .eq("is_active", true);

    if (templateError) {
      console.error("Error fetching templates:", templateError);
      throw new Error(`Failed to fetch templates: ${templateError.message}`);
    }


    let checklistItems = [];

    // If no existing items, create them
    if (!checklistItems.length) {
      for (const template of templates) {
        const { data: newItem, error: checklistItemsError } = await supabase
          .from("checklist_items")
          .insert({
            title: template.name,
            description: template.type,
            is_required: true,
            sort_order: 0,
            template_id: template.id,
          })
          .select()
          .single();

        if (checklistItemsError) {
          console.error("Error creating checklist items:", checklistItemsError);
          throw new Error(
            `Failed to create checklist items: ${checklistItemsError.message}`
          );
        }
        
        if (newItem) {
          checklistItems.push(newItem);
        }
      }
    }

    // Check for existing progress items to avoid duplicates
    const { data: existingProgress } = await supabase
      .from("client_onboarding_progress")
      .select("checklist_item_id")
      .eq("client_id", clientId);
    
    const existingItemIds = new Set(existingProgress?.map(p => p.checklist_item_id) || []);

    // Create progress items for checklist items that don't already exist
    const progressItems = [];
    for (const checklistItem of checklistItems) {
      if (!existingItemIds.has(checklistItem.id)) {
        progressItems.push({
          client_id: clientId,
          checklist_item_id: checklistItem.id,
          is_completed: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    if (progressItems.length > 0) {
      const { error: progressError } = await supabase
        .from("client_onboarding_progress")
        .insert(progressItems);

      if (progressError) {
        console.error("Error creating progress items:", progressError);
        throw new Error(
          `Failed to create progress items: ${progressError.message}`
        );
      }
    }

    return {
      success: true,
      message: `Onboarding started successfully. ${progressItems.length} checklist items assigned.`,
      itemsCreated: progressItems.length,
      totalItems: checklistItems.length
    };
  } catch (error) {
    console.error("Error in startOnboarding:", error);
    throw error;
  }
}
