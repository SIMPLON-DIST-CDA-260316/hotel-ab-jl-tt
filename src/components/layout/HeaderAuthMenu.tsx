"use client";

import Link from "next/link";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function HeaderAuthMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menu connexion"
        >
          <UserIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-48 flex-col gap-2 p-3">
        <Button variant="ghost" size="sm" asChild className="w-full justify-start">
          <Link href="/sign-in">Se connecter</Link>
        </Button>
        <Button size="sm" asChild className="w-full justify-start">
          <Link href="/sign-up">Créer un compte</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
