"use client";

import { useMemo, useState } from "react";
import { Contact, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useContacts, useDeleteContact, type Contact as ContactType } from "@/lib/api/contacts";
import { useDebounced } from "@/lib/hooks";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactoForm } from "@/components/contactos/contacto-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function LeadAgendaPage() {
  const { data: contacts = [], isLoading } = useContacts();
  const deleteContact = useDeleteContact();

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [crear, setCrear] = useState(false);
  const [editando, setEditando] = useState<ContactType | null>(null);
  const [eliminando, setEliminando] = useState<ContactType | null>(null);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    const sorted = [...contacts].sort((a, b) =>
      (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName)
    );
    if (!term) return sorted;
    return sorted.filter((c) =>
      normalize(`${c.firstName} ${c.lastName} ${c.email ?? ""} ${c.city ?? ""}`).includes(term)
    );
  }, [contacts, search]);

  return (
    <>
      <PageHeader title="Agenda" description={`${contacts.length} contacto(s)`}>
        <Button onClick={() => setCrear(true)}>
          <Plus /> Nuevo contacto
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Buscar por nombre, email, ciudad..."
          value={searchRaw}
          onChange={(e) => setSearchRaw(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Sin contactos"
          description={search ? "No se encontraron resultados." : "Agrega tu primer contacto para empezar."}
          action={!search ? <Button size="sm" onClick={() => setCrear(true)}>Agregar contacto</Button> : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Ciudad</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                  <TableCell>{c.age}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.email ?? "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.city ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditando(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEliminando(c)}
                        className="text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ContactoForm open={crear} onOpenChange={setCrear} />
      {editando && (
        <ContactoForm
          open={!!editando}
          onOpenChange={(v) => { if (!v) setEditando(null); }}
          contact={editando}
        />
      )}
      <ConfirmDialog
        open={!!eliminando}
        onOpenChange={(v) => { if (!v) setEliminando(null); }}
        title="Eliminar contacto"
        description={`Eliminar a ${eliminando?.firstName} ${eliminando?.lastName}? Esta accion no se puede deshacer.`}
        onConfirm={() => {
          if (eliminando) {
            deleteContact.mutate(eliminando.id, { onSuccess: () => setEliminando(null) });
          }
        }}
      />
    </>
  );
}
