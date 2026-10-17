import { COMPOUNDS } from "@/mock/properties";

import { CompoundDetail } from "./compound-detail";

export function generateStaticParams() {
  return COMPOUNDS.map((c) => ({ id: c.id }));
}

export default async function CompoundDetailPage({ params }: PageProps<"/admin/compounds/[id]">) {
  const { id } = await params;
  return <CompoundDetail id={id} />;
}
