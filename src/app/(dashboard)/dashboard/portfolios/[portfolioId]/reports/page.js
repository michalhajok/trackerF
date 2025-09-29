"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const { portfolioId } = useParams();
  const { data: reports, isLoading } = useQuery(["reports", portfolioId], () =>
    api.get(`/portfolios/${portfolioId}/reports`).then((r) => r.data)
  );

  if (isLoading) return <div>Ładowanie raportów...</div>;

  return (
    <div>
      <h2>Raporty</h2>
      <ul>
        {reports.map((r) => (
          <li key={r._id}>
            {r.name}{" "}
            <Button asChild>
              <a
                href={`/api/portfolios/${portfolioId}/reports/${r._id}/download`}
              >
                Pobierz
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
