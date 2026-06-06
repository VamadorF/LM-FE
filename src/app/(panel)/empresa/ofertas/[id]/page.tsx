import EmpresaOfertaDetailPage from "./page-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <EmpresaOfertaDetailPage ofertaId={id} />;
}
