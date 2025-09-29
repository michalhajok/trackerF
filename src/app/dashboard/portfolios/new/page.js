// src/app/(dashboard)/dashboard/portfolios/new/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreatePortfolio } from "@/hooks/usePortfolios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function NewPortfolioPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [broker, setBroker] = useState("MANUAL");
  const [currency, setCurrency] = useState("USD");
  const [accountId, setAccountId] = useState("");

  const { mutate, isLoading, isError, error } = useCreatePortfolio();

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(
      { name, description, broker, currency, brokerConfig: { accountId } },
      {
        onSuccess: () => {
          router.push("/dashboard/portfolios");
        },
      }
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Nowe Portfolio</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 font-medium">
            Nazwa*
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Opis
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="broker" className="block mb-1 font-medium">
            Broker*
          </label>
          <select
            id="broker"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
          >
            <option value="MANUAL">MANUAL</option>
            <option value="XTB">XTB</option>
            <option value="PKO">PKO</option>
            <option value="BINANCE">BINANCE</option>
            <option value="BYBIT">BYBIT</option>
            <option value="ING">ING</option>
          </select>
        </div>
        <div>
          <label htmlFor="accountId">Account ID*</label>
          <Input
            id="accountId"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="np. 12345678"
            required
          />
        </div>

        <div>
          <label htmlFor="currency" className="block mb-1 font-medium">
            Waluta*
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="PLN">PLN</option>
            <option value="GBP">GBP</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
          </select>
        </div>
        {isError && (
          <div className="text-red-600">
            {error.message || "Błąd tworzenia"}
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Tworzenie…" : "Utwórz Portfolio"}
        </Button>
      </form>
    </div>
  );
}
