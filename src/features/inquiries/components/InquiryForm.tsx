"use client";

import { Suspense, useActionState } from "react";
import { notFound } from "next/navigation";
import Form from "next/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendInquiry } from "@/features/inquiries/actions/send-inquiry";
import { type FormState } from "@/features/inquiries/lib/send-inquiry-shema";
import { error } from "better-auth/api";

interface ContactFormProps {
  establishment: NonNullable<Awaited<{id: string}>>;
}

export function ContactForm({ establishment }: ContactFormProps) {
  const [formState, formAction, pending] = useActionState<FormState, FormData>(
    sendInquiry,
    {
      success: false,
      errors: null,
      values: {
        name: "",
        email: "",
        subject: undefined,
        establishment: establishment.id,
        message: "",
      },
    },
  );

  if (!establishment) {
    notFound();
  }

  const subjects = [
    { name: "complaint", text: "Je souhaite poser une réclamation" },
    {
      name: "extra_service",
      text: "Je souhaite commander un service supplémentaire",
    },
    { name: "suite_info", text: "Je souhaite en savoir plus sur une suite" },
    { name: "app_issue", text: "J'ai un souci avec cette application" },
  ];
  return (
    <Card className="w-full sm:max-w-md">
      <CardContent>
        <Form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="establishment"
            id="establishment"
            value={establishment.id}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" type="text"></Input>
            {formState.errors && (
              <FieldError>{formState.errors.name}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="" required></Input>
            {formState.errors && (
              <FieldError>{formState.errors.email[0]}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Objet</Label>
            <Select name="subject" defaultValue={formState?.values?.subject}>
              <SelectTrigger
                id="subject"
                className="max-w-[230px] min-w-[200px] sm:max-w-none"
              >
                <SelectValue placeholder="Choisir l'objet" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {subjects.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formState.errors && (
              <FieldError>{formState.errors.subject}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required></Textarea>
            {formState.errors && (
              <FieldError>{formState.errors.message}</FieldError>
            )}
          </div>
          <Button type="submit">Envoyer</Button>
          {formState.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <p className="font-semibold text-green-800">Message envoyé !</p>
              <p className="mt-1 text-sm text-green-700">
                Nous vous répondrons dans les plus brefs délais.
              </p>
            </div>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
