"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Contact, Plus, Trash2, Search } from "lucide-react";
import { useContactBooks, useContactBookContacts, useAddContactToBook, useRemoveContactFromBook } from "@/lib/api/contact-books";
import { useContacts } from "@/lib/api/contacts";
import type { Contact as ContactType } from "@/lib/api/contacts";
import { useDebounced } from "@/lib/hooks";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ListaDetailPage() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;

  const { data: books = [] } = useContactBooks();
  const { data: bookContacts = [], isLoading } = useContactBookContacts(bookId);
  const { data: allContacts = [] } = useContacts();
  const addMut = useAddContactToBook();
  const removeMut = useRemoveContactFromBook();

  const book = books.find((b) => b.id === bookId);

  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<ContactType | null>(null);
  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);

  const bookContactIds = useMemo(() => new Set(bookContacts.map((c) => c.id)), [bookContacts]);

  const available = useMemo(() => {
    const term = search.toLowerCase().trim();
    return allContacts.filter((c) => {
      if (bookContactIds.has(c.id)) return false;
      if (!term) return true;
      return `${c.firstName} ${c.lastName} ${c.email ?? ""}`.toLowerCase().includes(term);
    });
  }, [allContacts, bookContactIds, search]);

  return (
    <>
      <PageHeader
        title={book?.name ?? "Lista"}
        description={`${bookContacts.length} contacto(s)`}
      >
        <Button onClick={() => setAddOpen(true)}>
          <Plus /> Agregar contactos
        </Button>
      </PageHeader>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : bookContacts.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Sin contactos"
          description="Esta lista no tiene contactos aun."
          action={<Button size="sm" onClick={() => setAddOpen(true)}>Agregar contactos</Button>}
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
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookContacts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                  <TableCell>{c.age}</TableCell>
                  <TableCell className="hidden sm:table-cell">{c.email ?? "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.city ?? "—"}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => setRemoving(c)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog para agregar contactos */}
      <Dialog open={addOpen} onOpenChange={setAddOpen} title="Agregar contactos a la lista">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar contacto..." value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)} />
          </div>
          <div className="max-h-64 overflow-y-auto divide-y rounded-md border">
            {available.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {search ? "Sin resultados." : "Todos los contactos ya estan en esta lista."}
              </p>
            ) : (
              available.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">{c.firstName} {c.lastName}</span>
                  <Button size="sm" variant="outline"
                    disabled={addMut.isPending}
                    onClick={() => addMut.mutate({ bookId, contactId: c.id })}>
                    Agregar
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cerrar</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(v) => { if (!v) setRemoving(null); }}
        title="Quitar contacto"
        description={`Quitar a ${removing?.firstName} ${removing?.lastName} de esta lista?`}
        onConfirm={() => {
          if (removing) removeMut.mutate({ bookId, contactId: removing.id }, { onSuccess: () => setRemoving(null) });
        }}
      />
    </>
  );
}
