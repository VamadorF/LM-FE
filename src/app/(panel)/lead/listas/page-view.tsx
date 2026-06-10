"use client";

import { useState } from "react";
import Link from "next/link";
import { ListChecks, Plus, Pencil, Trash2 } from "lucide-react";
import { useContactBooks, useDeleteContactBook, type ContactBook } from "@/lib/api/contact-books";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListaForm } from "@/components/listas/lista-form";

export default function LeadListasPage() {
  const { data: books = [], isLoading } = useContactBooks();
  const deleteMut = useDeleteContactBook();

  const [crear, setCrear] = useState(false);
  const [editando, setEditando] = useState<ContactBook | null>(null);
  const [eliminando, setEliminando] = useState<ContactBook | null>(null);

  return (
    <>
      <PageHeader title="Mis listas" description={`${books.length} lista(s)`}>
        <Button onClick={() => setCrear(true)}>
          <Plus /> Nueva lista
        </Button>
      </PageHeader>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : books.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Sin listas"
          description="Crea tu primera lista para agrupar contactos por categoria."
          action={<Button size="sm" onClick={() => setCrear(true)}>Crear lista</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{book.name}</p>
                  {book.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{book.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditando(book)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEliminando(book)}
                    className="text-destructive hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <Link href={`/lead/listas/${book.id}`}>
                <Button size="sm" variant="outline" className="w-full">
                  Ver contactos
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <ListaForm open={crear} onOpenChange={setCrear} />
      {editando && (
        <ListaForm
          open={!!editando}
          onOpenChange={(v) => { if (!v) setEditando(null); }}
          book={editando}
        />
      )}
      <ConfirmDialog
        open={!!eliminando}
        onOpenChange={(v) => { if (!v) setEliminando(null); }}
        title="Eliminar lista"
        description={`Eliminar la lista "${eliminando?.name}"? Esta accion no se puede deshacer.`}
        onConfirm={() => {
          if (eliminando) deleteMut.mutate(eliminando.id, { onSuccess: () => setEliminando(null) });
        }}
      />
    </>
  );
}
