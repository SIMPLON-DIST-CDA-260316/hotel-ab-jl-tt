"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/features/auth/actions/login";
import { AUTH_ERROR_CODES } from "@/features/auth/lib/auth-error-codes";
import type {
  AuthActionState,
  LoginFormValues,
} from "@/features/auth/types/auth.types";

// Codes from server actions → user-facing messages (i18n-ready separation)
const FORM_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: "Email ou mot de passe incorrect.",
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: "Une erreur inattendue s'est produite. Veuillez réessayer.",
};

const INITIAL_STATE: AuthActionState<LoginFormValues> = { status: "idle" };

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(login, INITIAL_STATE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const formError = state.status === "error" ? state.formError : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {FORM_ERROR_MESSAGES[formError] ?? FORM_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
        />
        {fieldErrors?.email ? (
          <p id="email-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={fieldErrors?.password ? "password-error" : undefined}
        />
        {fieldErrors?.password ? (
          <p id="password-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/sign-up" className="text-primary underline hover:text-primary/80">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
