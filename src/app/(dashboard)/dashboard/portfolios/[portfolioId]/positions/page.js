"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Table, TableRow, TableCell } from "@/components/ui/Table";

export default function PositionsPage() {
  const { portfolioId } = useParams();
  const { data: positions, isLoading } = useQuery(
    ["positions", portfolioId],
    () =>
      api.get(`/portfolios/${portfolioId}/positions`).then((res) => res.data)
  );

  if (isLoading) return <div>Ładowanie pozycji...</div>;

  return (
    <div>
      <h2>Pozycje</h2>
      <Table>
        <thead>
          <tr>
            <TableCell>Symbol</TableCell>
            <TableCell>Wolumen</TableCell>
            <TableCell>Otwarcie</TableCell>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <TableRow key={pos._id}>
              <TableCell>{pos.symbol}</TableCell>
              <TableCell>{pos.volume}</TableCell>
              <TableCell>
                {new Date(pos.openTime).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
