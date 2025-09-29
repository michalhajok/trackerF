"use client";

import Link from "next/link";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Button } from "@/components/ui/Button";

export default function PortfoliosPage() {
  const { data, isLoading } = usePortfolios();

  if (isLoading) return <div>Ładowanie portfeli…</div>;

  console.log(data);

  if (!data) {
    return (
      <div>
        <h1>Moje Portfele</h1>
        <p>Nie masz jeszcze żadnych portfeli. Utwórz swój pierwszy portfel.</p>
        <Button>
          <Link href="/dashboard/portfolios/new">Utwórz nowy portfel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Moje Portfele</h1>
      <ul>
        {data?.map((p) => (
          <li key={p._id}>
            <Link href={`/dashboard/portfolios/${p._id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
      <Button>
        <Link href="/dashboard/portfolios/new">Utwórz nowy portfel</Link>
      </Button>
    </div>
  );
}
