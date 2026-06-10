"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCreateBid } from "@/lib/api/bids";
import { useContacts } from "@/lib/api/contacts";
import { useContactBooks } from "@/lib/api/contact-books";
import type { Proposal } from "@/lib/api/proposals";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  pitch: z.string().min(10, "Minimo 10 caracteres").max(1000),
  contactBookId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  proposal: Proposal;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function BidDialog({ proposal, open, onOpenChange }: Props) {
  const createBid = useCreateBid(proposal.id);
  const { data: contacts = [] } = useContacts();
  const { data: books = [] } = useContactBooks();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const onSubmit = (values: FormValues) => {
    createBid.mutate(
      {
        pitch: values.pitch,
        contactBookId: values.contactBookId || undefined,
        contactIds: selectedContacts.length > 0 ? selectedContacts : undefined,
      },
      {
        onSuccess: () => {
          reset();
          setSelectedContacts([]);
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onOpenChange(false);
          }, 1500);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={`Postular a: ${proposal.title}`}>
      {success ? (
        <div className="py-8 text-center">
          <p className="text-lg font-semibold text-emerald-600">Postulacion enviada!</p>
          <p className="mt-1 text-sm text-muted-foreground">La empresa recibira tu propuesta.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Info propuesta */}
          <div className="rounded-lg bg-secondary/50 p-3 text-sm space-y-1">
            <p><span className="font-medium">Empresa:</span> {proposal.company.legalName}</p>
            <p><span className="font-medium">Contactos buscados:</span> {proposal.contactsNeeded}</p>
            {proposal.pricePerContact && (
              <p><span className="font-medium">Precio:</span> ${proposal.pricePerContact.toLocaleString("es-CL")} / contacto</p>
            )}
          </div>

          {/* Pitch */}
          <div className="space-y-1.5">
            <Label htmlFor="bd-pitch">Tu propuesta * (min 10 chars)</Label>
            <Textarea id="bd-pitch" rows={4}
              placeholder="Por que tus contactos son ideales para esta propuesta?"
              {...register("pitch")} />
            {errors.pitch && <p className="text-xs text-destructive">{errors.pitch.message}</p>}
          </div>

          {/* Lista de contactos opcional */}
          {books.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="bd-book">Desde lista (opcional)</Label>
              <select id="bd-book" {...register("contactBookId")}
                className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Seleccionar lista...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Seleccion individual de contactos */}
          {contacts.length > 0 && (
            <div className="space-y-1.5">
              <Label>O selecciona contactos individuales</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border divide-y">
                {contacts.map((c) => (
                  <label key={c.id}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-secondary/50">
                    <input type="checkbox"
                      checked={selectedContacts.includes(c.id)}
                      onChange={() => toggleContact(c.id)}
                      className="rounded border" />
                    <span className="text-sm">{c.firstName} {c.lastName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.age} anos</span>
                  </label>
                ))}
              </div>
              {selectedContacts.length > 0 && (
                <p className="text-xs text-muted-foreground">{selectedContacts.length} seleccionado(s)</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={createBid.isPending}>
              {createBid.isPending && <Loader2 className="animate-spin" />}
              Enviar postulacion
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
