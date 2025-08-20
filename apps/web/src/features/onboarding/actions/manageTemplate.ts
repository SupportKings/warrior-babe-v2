"use server";

import { createClient } from "@/utils/supabase/server";
import { getUser } from "@/queries/getUser";

interface TemplateItem {
  id?: string;
  name: string;
  is_active: boolean;
  type?: "client_cs_onboarding" | "client_coach_onboarding" | "client_offboarding" | "coach_onboarding";
}

export async function manageTemplate(items: TemplateItem[]) {
  const session = await getUser();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();
  
  const itemsToCreate = items.filter(item => !item.id);
  const itemsToUpdate = items.filter(item => item.id);
  
  const results = [];
  
  // Handle updates
  if (itemsToUpdate.length > 0) {
    for (const item of itemsToUpdate) {
      const { data, error } = await supabase
        .from("checklist_templates")
        .update({
          name: item.name,
          is_active: item.is_active,
          type: item.type,
        })
        .eq("id", item.id!)
        .select()
        .single();
      
      if (error) {
        console.error("Update error:", error);
        throw new Error(`Failed to update template: ${error.message}`);
      }
      
      results.push(data);
    }
  }
  
  // Handle inserts
  if (itemsToCreate.length > 0) {
    const { data, error } = await supabase
      .from("checklist_templates")
      .insert(
        itemsToCreate.map(item => ({
          name: item.name,
          is_active: item.is_active,
          type: item.type || "client_cs_onboarding",
        }))
      )
      .select();
    
    if (error) {
      console.error("Insert error:", error);
      throw new Error(`Failed to create templates: ${error.message}`);
    }
    
    results.push(...(data || []));
  }
  
  return { success: true, data: results };
}
