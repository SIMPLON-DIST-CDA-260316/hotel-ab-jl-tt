"use client";

import { useActionState, useState } from "react";
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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [lastSuccess, setLastSuccess] = useState(false);

  if (formState.success && !lastSuccess) {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setLastSuccess(true);
  } else if (!formState.success && lastSuccess) {
    setLastSuccess(false);
  }

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
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {formState.errors?.name && (
              <FieldError>{formState.errors.name}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {formState.errors?.email && (
              <FieldError>{formState.errors.email[0]}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Objet</Label>
            <Select name="subject" value={subject || undefined} onValueChange={setSubject}>
              <SelectTrigger
                id="subject"
                className="max-w-[230px] min-w-[200px] sm:max-w-none"
              >
                <SelectValue placeholder="Choisir l'objet" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {subjects.map((subjectOption) => (
                    <SelectItem key={subjectOption.name} value={subjectOption.name}>
                      {subjectOption.text}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formState.errors?.subject && (
              <FieldError>{formState.errors.subject}</FieldError>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            {formState.errors?.message && (
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
