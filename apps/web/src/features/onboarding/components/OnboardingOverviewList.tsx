"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { differenceInDays } from "date-fns";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  ClockIcon,
  EditIcon,
  MessageSquareIcon,
  PlusIcon,
  RocketIcon,
  SaveIcon,
  SparklesIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useAddChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "../hooks/useChecklistItemActions";
import { useOnboardingOverview } from "../hooks/useOnboardingOverview";
import { useUpdateChecklistProgress } from "../hooks/useUpdateChecklistProgress";

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  template_id?: string;
}

interface ProgressItem {
  id: string;
  checklistItemId: string;
  isCompleted: boolean;
  completedAt: string | null;
  notes: string | null;
  checklistItem: ChecklistItem;
}

interface OnboardingClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startDate: string;
  status: string | null;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  daysInOnboarding: number;
  progressItems: ProgressItem[];
}

export function OnboardingOverviewList() {
  const { data: clients, isLoading } = useOnboardingOverview();
  const { mutate: updateProgress } = useUpdateChecklistProgress();
  const { mutate: updateChecklistItem } = useUpdateChecklistItem();
  const { mutate: deleteChecklistItem } = useDeleteChecklistItem();
  const { mutate: addChecklistItem } = useAddChecklistItem();

  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>(
    {}
  );
  const [editingMode, setEditingMode] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<{
    [key: string]: { title: string; description: string };
  }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{
    itemId: string;
    title: string;
  } | null>(null);
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    is_required: false,
  });
  const [clientProgress, setClientProgress] = useState<{
    [key: string]: number;
  }>({});

  // Calculate progress for each client
  useEffect(() => {
    if (clients) {
      const progress: { [key: string]: number } = {};
      clients.forEach((client: OnboardingClient) => {
        const completed =
          client.progressItems?.filter((item) => item.isCompleted).length || 0;
        const total = client.progressItems?.length || 0;
        progress[client.id] =
          total > 0 ? Math.round((completed / total) * 100) : 0;
      });
      setClientProgress(progress);
    }
  }, [clients]);

  const toggleExpanded = (clientId: string) => {
    setExpandedClients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const handleChecklistToggle = (
    progressId: string,
    currentState: boolean,
    notes?: string,
    clientId?: string
  ) => {
    console.log("handleChecklistToggle called with:", {
      progressId,
      currentState,
      isCompleted: !currentState,
      notes,
    });

    updateProgress({
      progressId,
      isCompleted: !currentState,
      notes,
    });

    // Update local progress immediately for better UX
    if (clientId && clients) {
      const client = clients.find((c: OnboardingClient) => c.id === clientId);
      if (client) {
        const item = client.progressItems.find((p) => p.id === progressId);
        if (item) {
          item.isCompleted = !currentState;
          const completed = client.progressItems.filter(
            (p) => p.isCompleted
          ).length;
          const total = client.progressItems.length;
          setClientProgress((prev) => ({
            ...prev,
            [clientId]: total > 0 ? Math.round((completed / total) * 100) : 0,
          }));
        }
      }
    }
  };

  const startEditingNote = (progressId: string, currentNote: string) => {
    setEditingNotes((prev) => ({ ...prev, [progressId]: currentNote || "" }));
    setEditingMode((prev) => new Set(prev).add(progressId));
  };

  const saveNote = (progressId: string, isCompleted: boolean) => {
    const notes = editingNotes[progressId];
    updateProgress({
      progressId,
      isCompleted,
      notes,
    });
    setEditingMode((prev) => {
      const newSet = new Set(prev);
      newSet.delete(progressId);
      return newSet;
    });
  };

  const cancelEditingNote = (progressId: string) => {
    setEditingMode((prev) => {
      const newSet = new Set(prev);
      newSet.delete(progressId);
      return newSet;
    });
    setEditingNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[progressId];
      return newNotes;
    });
  };

  const startEditingItem = (
    itemId: string,
    title: string,
    description: string
  ) => {
    setEditingItems((prev) => ({
      ...prev,
      [itemId]: { title, description: description || "" },
    }));
  };

  const saveItemEdits = (itemId: string) => {
    const edits = editingItems[itemId];
    if (!edits) return;

    updateChecklistItem({
      itemId,
      updates: {
        title: edits.title,
        description: edits.description || null,
      },
    });

    setEditingItems((prev) => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });
  };

  const cancelItemEdit = (itemId: string) => {
    setEditingItems((prev) => {
      const newItems = { ...prev };
      delete newItems[itemId];
      return newItems;
    });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteChecklistItem(itemId);
    setDeleteConfirm(null);
  };

  const handleAddItem = (clientId: string) => {
    if (!newItem.title.trim()) {
      return;
    }

    const client = clients?.find((c: OnboardingClient) => c.id === clientId);
    const existingItem = client?.progressItems?.[0];

    if (!existingItem) return;

    // Get the template_id from an existing checklist item
    const templateId =
      existingItem.checklistItem?.template_id ||
      existingItem.checklistItem?.templateId;

    if (!templateId) {
      console.error("No template_id found in existing checklist items");
      return;
    }

    addChecklistItem({
      clientId,
      templateId,
      item: {
        title: newItem.title,
        description: newItem.description || undefined,
        is_required: newItem.is_required,
        sort_order: client.progressItems.length,
      },
    });

    setNewItem({ title: "", description: "", is_required: false });
    setAddingItem(null);
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "from-green-500 to-emerald-500";
    if (progress >= 75) return "from-blue-500 to-cyan-500";
    if (progress >= 50) return "from-purple-500 to-pink-500";
    if (progress >= 25) return "from-yellow-500 to-orange-500";
    return "from-gray-400 to-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "onboarding":
        return <RocketIcon className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2Icon className="h-4 w-4" />;
      default:
        return <CircleIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden py-0">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {clients?.map((client: OnboardingClient, index: number) => {
          const isExpanded = expandedClients.has(client.id);
          const progress = clientProgress[client.id] || 0;
          const completedCount =
            client.progressItems?.filter((item) => item.isCompleted).length ||
            0;
          const totalCount = client.progressItems?.length || 0;
          const daysInOnboarding = differenceInDays(
            new Date(),
            new Date(client.startDate)
          );

          return (
            <div key={client.id}>
              <Card className="group overflow-hidden rounded-lg border py-0">
                {/* Main Card Content */}
                <div
                  className="cursor-pointer bg-gradient-to-br from-background via-background to-muted/10 p-3"
                  onClick={() => toggleExpanded(client.id)}
                >
                  <div className="flex items-start gap-2">
                    {/* Avatar Section */}
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute inset-0 rounded-lg opacity-20 blur-lg",
                          `${getProgressColor(progress)}`
                        )}
                      />
                      <Avatar className="relative h-10 w-10 rounded-lg shadow">
                        <AvatarFallback
                          className={cn(
                            "rounded-lg font-semibold text-white text-xs",
                            `bg-gradient-to-br ${getProgressColor(progress)}`
                          )}
                        >
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Client Info Section */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">
                              {client.firstName} {client.lastName}
                            </h3>
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-4 px-1.5 py-0 text-[10px] capitalize",
                                client.status === "onboarding" &&
                                  "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                                client.status === "completed" &&
                                  "border-green-200 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                              )}
                            >
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">
                              {progress}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({completedCount}/{totalCount})
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(client.id);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="relative">
                          <Progress
                            value={progress}
                            className="h-1.5 bg-primary/20"
                          />
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-3 pt-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-950">
                                <CheckCircle2Icon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                              </div>
                              <span className="font-medium">
                                {completedCount}
                              </span>
                              <span className="text-muted-foreground">
                                Completed
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tasks completed</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="rounded-lg bg-yellow-100 p-1.5 dark:bg-yellow-950">
                                <ClockIcon className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <span className="font-medium">
                                {totalCount - completedCount}
                              </span>
                              <span className="text-muted-foreground">
                                Remaining
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tasks remaining</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Checklist Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t-2"
                    >
                      <div className="bg-gradient-to-b from-muted/30 to-background p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold text-lg">
                              Onboarding Checklist
                            </h4>
                          </div>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingItem(client.id);
                            }}
                            className="shadow-sm"
                          >
                            <PlusIcon className="mr-1.5 h-4 w-4" />
                            Add Task
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {client.progressItems?.map((item, itemIndex) => {
                            const isEditingNote = editingMode.has(item.id);
                            const isEditingItem =
                              editingItems[item.checklistItem.id];

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "group/item rounded-xl border-2 transition-all duration-200",
                                  item.isCompleted
                                    ? "border-muted bg-muted/30"
                                    : "border-border bg-background"
                                )}
                              >
                                <div className="p-4">
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={item.isCompleted}
                                      onCheckedChange={() =>
                                        handleChecklistToggle(
                                          item.id,
                                          item.isCompleted,
                                          item.notes || undefined,
                                          client.id
                                        )
                                      }
                                      className="mt-1"
                                    />

                                    <div className="flex-1 space-y-3">
                                      {isEditingItem ? (
                                        <div className="space-y-3">
                                          <Input
                                            value={isEditingItem.title}
                                            onChange={(e) =>
                                              setEditingItems((prev) => ({
                                                ...prev,
                                                [item.checklistItem.id]: {
                                                  ...prev[
                                                    item.checklistItem.id
                                                  ],
                                                  title: e.target.value,
                                                },
                                              }))
                                            }
                                            placeholder="Task title"
                                            className="font-medium"
                                          />
                                          <Textarea
                                            value={isEditingItem.description}
                                            onChange={(e) =>
                                              setEditingItems((prev) => ({
                                                ...prev,
                                                [item.checklistItem.id]: {
                                                  ...prev[
                                                    item.checklistItem.id
                                                  ],
                                                  description: e.target.value,
                                                },
                                              }))
                                            }
                                            placeholder="Description (optional)"
                                            className="min-h-[80px] text-sm"
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={() =>
                                                saveItemEdits(
                                                  item.checklistItem.id
                                                )
                                              }
                                            >
                                              <SaveIcon className="mr-1.5 h-3.5 w-3.5" />
                                              Save
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                cancelItemEdit(
                                                  item.checklistItem.id
                                                )
                                              }
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                              <span
                                                className={cn(
                                                  "font-medium",
                                                  item.isCompleted &&
                                                    "text-muted-foreground line-through"
                                                )}
                                              >
                                                {item.checklistItem.title}
                                              </span>
                                              {item.checklistItem
                                                .isRequired && (
                                                <Badge
                                                  variant="secondary"
                                                  className="px-1.5 py-0 text-xs"
                                                >
                                                  Required
                                                </Badge>
                                              )}
                                            </div>
                                            {item.checklistItem.description && (
                                              <p
                                                className={cn(
                                                  "mt-1 text-muted-foreground text-sm",
                                                  item.isCompleted &&
                                                    "line-through"
                                                )}
                                              >
                                                {item.checklistItem.description}
                                              </p>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-1">
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                startEditingItem(
                                                  item.checklistItem.id,
                                                  item.checklistItem.title,
                                                  item.checklistItem
                                                    .description || ""
                                                );
                                              }}
                                            >
                                              <EditIcon className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-8 w-8"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm({
                                                  itemId: item.checklistItem.id,
                                                  title:
                                                    item.checklistItem.title,
                                                });
                                              }}
                                            >
                                              <Trash2Icon className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Notes Section */}
                                      {(item.notes || isEditingNote) && (
                                        <div className="border-t pt-3">
                                          {isEditingNote ? (
                                            <div className="flex gap-2">
                                              <Textarea
                                                value={
                                                  editingNotes[item.id] || ""
                                                }
                                                onChange={(e) =>
                                                  setEditingNotes((prev) => ({
                                                    ...prev,
                                                    [item.id]: e.target.value,
                                                  }))
                                                }
                                                placeholder="Add notes..."
                                                className="min-h-[80px] text-sm"
                                              />
                                              <div className="flex flex-col gap-1">
                                                <Button
                                                  size="icon"
                                                  variant="default"
                                                  className="h-8 w-8"
                                                  onClick={() =>
                                                    saveNote(
                                                      item.id,
                                                      item.isCompleted
                                                    )
                                                  }
                                                >
                                                  <SaveIcon className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="outline"
                                                  className="h-8 w-8"
                                                  onClick={() =>
                                                    cancelEditingNote(item.id)
                                                  }
                                                >
                                                  <XIcon className="h-3.5 w-3.5" />
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="flex items-start gap-2">
                                              <MessageSquareIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                              <p className="flex-1 text-muted-foreground text-sm italic">
                                                {item.notes}
                                              </p>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  startEditingNote(
                                                    item.id,
                                                    item.notes || ""
                                                  );
                                                }}
                                              >
                                                <EditIcon className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {!item.notes && !isEditingNote && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            startEditingNote(item.id, "");
                                          }}
                                        >
                                          <MessageSquareIcon className="mr-1.5 h-3 w-3" />
                                          Add Note
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Add New Item Form */}
                          {addingItem === client.id && (
                            <div className="rounded-xl border-2 border-primary/30 border-dashed bg-primary/5 p-4">
                              <div className="space-y-3">
                                <Input
                                  value={newItem.title}
                                  onChange={(e) =>
                                    setNewItem((prev) => ({
                                      ...prev,
                                      title: e.target.value,
                                    }))
                                  }
                                  placeholder="Task title"
                                  className="font-medium"
                                  autoFocus
                                />
                                <Textarea
                                  value={newItem.description}
                                  onChange={(e) =>
                                    setNewItem((prev) => ({
                                      ...prev,
                                      description: e.target.value,
                                    }))
                                  }
                                  placeholder="Description (optional)"
                                  className="min-h-[80px] text-sm"
                                />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={newItem.is_required}
                                      onCheckedChange={(checked) =>
                                        setNewItem((prev) => ({
                                          ...prev,
                                          is_required: !!checked,
                                        }))
                                      }
                                    />
                                    <Label className="font-medium text-sm">
                                      Required task
                                    </Label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddItem(client.id)}
                                      disabled={!newItem.title.trim()}
                                    >
                                      <PlusIcon className="mr-1.5 h-4 w-4" />
                                      Add Task
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setAddingItem(null);
                                        setNewItem({
                                          title: "",
                                          description: "",
                                          is_required: false,
                                        });
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          );
        })}

        {(!clients || clients.length === 0) && (
          <Card className="p-12 py-12">
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-4">
                  <UserIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">No Active Onboardings</h3>
              <p className="mx-auto max-w-sm text-muted-foreground text-sm">
                Start onboarding new clients to see their progress here
              </p>
            </div>
          </Card>
        )}

        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Checklist Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirm?.title}"? This
                will remove it from all clients' onboarding progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteConfirm && handleDeleteItem(deleteConfirm.itemId)
                }
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
