import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Search, Briefcase, Code, CornerDownLeft } from "lucide-react";

// Define the shape of a user for the search component
interface SearchUser {
  id: string;
  name: string;
  role: string;
  techStack: string[];
}

interface UserSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: SearchUser[];
  onSelectUser: (userId: string) => void;
}

export function UserSearch({
  open,
  onOpenChange,
  users,
  onSelectUser,
}: UserSearchProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden shadow-2xl sm:max-w-3xl top-[20%] translate-y-0 border-slate-800 bg-slate-950">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Developers</DialogTitle>
        </DialogHeader>

        <Command className="w-full bg-slate-950 h-[500px] flex flex-col">
          {/* 1. Large Header Search Input */}
          <div className="flex items-center border-b border-slate-800 px-4">
            <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
            <CommandInput
              placeholder="Search developers by name, role, or skills..."
              className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 2. Scrollable Results List */}
          <CommandList className="flex-1 overflow-y-auto max-h-full p-2 bg-slate-950">
            <CommandEmpty className="py-10 text-center text-slate-500">
              <p className="text-lg font-semibold">No results found.</p>
              <p className="text-sm">Try searching for "React" or "Python".</p>
            </CommandEmpty>

            <CommandGroup
              heading="Developers"
              className="text-slate-400 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-slate-500"
            >
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={
                    user.name + " " + user.role + " " + user.techStack.join(" ")
                  }
                  onSelect={() => {
                    onSelectUser(user.id);
                    onOpenChange(false);
                  }}
                  // --- CSS FIXES FOR VISIBILITY ---
                  // 1. data-[selected='true']:bg-slate-800 -> Uses Dark Grey instead of Blue for selection
                  // 2. text-white -> Forces name to be white
                  className="cursor-pointer flex items-center gap-4 p-3 rounded-xl mb-2 aria-selected:bg-slate-800 data-[selected='true']:bg-slate-800 transition-colors group"
                >
                  {/* Avatar Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-blue-400 group-data-[selected='true']:bg-slate-700 group-data-[selected='true']:text-blue-300">
                    <User className="h-5 w-5" />
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <div className="flex items-center gap-3">
                      {/* Name: Always White */}
                      <span className="font-semibold text-base text-slate-100 group-data-[selected='true']:text-white">
                        {user.name}
                      </span>

                      {/* Role Badge: Blue Text on Dark BG */}
                      <span className="flex items-center text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {user.role}
                      </span>
                    </div>

                    {/* Tech Stack: Grey text on Dark BG */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Code className="w-3 h-3 text-slate-500" />
                      {user.techStack.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="text-xs text-slate-400 font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 group-data-[selected='true']:bg-slate-950 group-data-[selected='true']:text-slate-300 group-data-[selected='true']:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.techStack.length > 4 && (
                        <span className="text-xs text-slate-600 group-data-[selected='true']:text-slate-500">
                          +{user.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* "Select" Hint - Only visible on hover/select */}
                  <div className="hidden sm:flex items-center gap-2 text-slate-600 opacity-0 group-data-[selected='true']:opacity-100 transition-opacity">
                    <span className="text-xs font-medium">Select</span>
                    <CornerDownLeft className="h-3 w-3" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="my-2 border-slate-800" />

            <CommandGroup heading="Actions" className="text-slate-500">
              <CommandItem className="py-3 cursor-pointer aria-selected:bg-slate-800 data-[selected='true']:bg-slate-800 rounded-lg">
                <Search className="mr-2 h-4 w-4" />
                <span className="text-slate-300">Advanced Filter...</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
