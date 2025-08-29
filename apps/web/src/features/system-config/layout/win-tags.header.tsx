"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tag } from "lucide-react";
import Link from "next/link";

export function WinTagsHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="font-medium text-[13px]">Win Tags</h1>
      </div>
      <Link href="#">
        <Button>
          <Tag className="mr-2 h-4 w-4" />
          Add Win Tag
        </Button>
      </Link>
    </header>
  );
}
