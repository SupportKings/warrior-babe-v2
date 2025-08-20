"use client";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { CheckIcon, UserIcon } from "lucide-react";
import type { Client } from "@/features/clients/queries/getClients";

interface ClientSelectorProps {
  clients: Client[];
  value?: string;
  onChange?: (clientId: string) => void;
  placeholder?: string;
  showNoClient?: boolean;
}

export const ClientSelector = ({
  clients,
  value,
  onChange,
  placeholder = "Select client",
  showNoClient = true,
}: ClientSelectorProps) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedClient = React.useMemo(() => {
    if (!value || value === "no-client") return null;
    return clients.find((c) => c.id === value) || null;
  }, [value, clients]);

  const allOptions = React.useMemo(
    () => [
      ...(showNoClient
        ? [{
            id: "no-client",
            first_name: "No",
            last_name: "Client",
            email: "",
            status: null,
          } as Client]
        : []),
      ...clients,
    ],
    [clients, showNoClient]
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return allOptions;

    const lowerSearch = searchValue.toLowerCase();
    return allOptions.filter((option) => {
      const fullName = `${option.first_name} ${option.last_name}`.toLowerCase();
      const email = option.email?.toLowerCase() || "";
      return fullName.includes(lowerSearch) || email.includes(lowerSearch);
    });
  }, [searchValue, allOptions]);

  // Group clients by status
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, typeof filteredOptions> = {};
    
    filteredOptions.forEach((option) => {
      if (option.id === "no-client") {
        if (!groups["no-client"]) groups["no-client"] = [];
        groups["no-client"].push(option);
      } else {
        const status = option.status || "active";
        if (!groups[status]) groups[status] = [];
        groups[status].push(option);
      }
    });

    return groups;
  }, [filteredOptions]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatClientName = (client: Client) => {
    return `${client.first_name} ${client.last_name}`;
  };

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Select client"
          variant="ghost"
          size="sm"
          className="h-8 w-fit px-2 font-medium text-[0.8125rem] text-primary leading-normal"
        >
          {selectedClient ? (
            <>
              <Avatar className="mr-2 h-5 w-5">
                <AvatarFallback className="text-[0.625rem]">
                  {getInitials(selectedClient.first_name, selectedClient.last_name)}
                </AvatarFallback>
              </Avatar>
              <span>{formatClientName(selectedClient)}</span>
            </>
          ) : (
            <>
              <UserIcon className="mr-2 size-4" aria-hidden="true" />
              {placeholder}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[300px] rounded-lg p-0"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        sideOffset={6}
      >
        <Command className="rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-[0.8125rem] leading-normal"
            placeholder="Search clients..."
          />
          <CommandList>
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-muted-foreground text-sm">
                No clients found
              </div>
            ) : (
              Object.entries(groupedOptions).map(([status, statusClients]) => (
                <CommandGroup 
                  key={status} 
                  heading={
                    status === "no-client" 
                      ? "" 
                      : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
                  }
                >
                  {statusClients.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={formatClientName(option)}
                      onSelect={() => {
                        onChange?.(option.id);
                        setOpenPopover(false);
                        setSearchValue("");
                      }}
                      className="group flex w-full items-center justify-between rounded-md text-[0.8125rem] text-primary leading-normal"
                    >
                      <div className="flex items-center">
                        {option.id === "no-client" ? (
                          <div className="mr-2 h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <Avatar className="mr-2 h-6 w-6">
                            <AvatarFallback className="text-[0.625rem]">
                              {getInitials(option.first_name, option.last_name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{formatClientName(option)}</span>
                          {option.email && (
                            <span className="text-muted-foreground text-xs">
                              {option.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {(selectedClient?.id === option.id ||
                          (!selectedClient && option.id === "no-client")) && (
                          <CheckIcon
                            aria-label="Check"
                            className="mr-3 size-4 text-primary"
                          />
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};