"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/features/auth/actions/register";
import { AUTH_ERROR_CODES } from "@/features/auth/lib/auth-error-codes";
import type {
  AuthActionState,
  RegisterFormValues,
} from "@/features/auth/types/auth.types";

const FORM_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.EMAIL_ALREADY_USED]: "Cette adresse email est déjà utilisée.",
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: "Une erreur inattendue s'est produite. Veuillez réessayer.",
};

const INITIAL_STATE: AuthActionState<RegisterFormValues> = { status: "idle" };

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, INITIAL_STATE);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleConfirmPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setConfirmPassword(event.target.value);
    if (event.target.value !== password) {
      event.target.setCustomValidity("Les mots de passe ne correspondent pas.");
    } else {
      event.target.setCustomValidity("");
    }
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
    if (confirmPassword && event.target.value !== confirmPassword) {
      // Re-validate confirm field when password changes
      const confirmInput = event.currentTarget
        .closest("form")
        ?.querySelector<HTMLInputElement>('[name="confirmPassword"]');
      confirmInput?.setCustomValidity("Les mots de passe ne correspondent pas.");
    }
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const formError = state.status === "error" ? state.formError : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {FORM_ERROR_MESSAGES[formError] ?? FORM_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          aria-describedby={fieldErrors?.firstName ? "firstName-error" : undefined}
        />
        {fieldErrors?.firstName ? (
          <p id="firstName-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.firstName}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lastName">Nom</Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          aria-describedby={fieldErrors?.lastName ? "lastName-error" : undefined}
        />
        {fieldErrors?.lastName ? (
          <p id="lastName-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.lastName}
          </p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          required
          value={password}
          onChange={handlePasswordChange}
          aria-describedby={fieldErrors?.password ? "password-error" : undefined}
        />
        {fieldErrors?.password ? (
          <p id="password-error" role="alert" className="text-xs text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Création..." : "Créer un compte"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/sign-in" className="text-primary underline hover:text-primary/80">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
