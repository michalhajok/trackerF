"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useWatchlists } from "@/hooks/usePortfolios";
import WatchlistsSidebar from "./WatchlistsSidebar";
import WatchlistContent from "./WatchlistContent";
import CreateWatchlistModal from "./CreateWatchlistModal";
import AddSymbolModal from "./AddSymbolModal";

export default function WatchlistsManager({ portfolioId }) {
  const toastContext = useToast(); // Pobierz cały obiekt
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSymbolModal, setShowAddSymbolModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: watchlists = [],
    isLoading,
    isError,
    refetch,
  } = useWatchlists(portfolioId);

  // Auto-select first watchlist if none selected
  if (watchlists.length > 0 && !selectedWatchlist) {
    setSelectedWatchlist(watchlists[0]);
  }

  const handleWatchlistSelect = (watchlist) => {
    setSelectedWatchlist(watchlist);
  };

  // ✅ UNIWERSALNA FUNKCJA TOAST
  const showToast = (title, message, type = "info") => {
    try {
      // Sprawdź różne możliwe API toastów
      if (toastContext?.toast) {
        // ShadcnUI style
        toastContext.toast({
          title,
          description: message,
          variant: type === "error" ? "destructive" : "default",
        });
      } else if (toastContext?.notify) {
        // Custom notify style
        toastContext.notify({
          title,
          message,
          type,
        });
      } else if (typeof toastContext === "function") {
        // Direct function call
        toastContext({
          title,
          description: message,
          variant: type === "error" ? "destructive" : "default",
        });
      } else {
        // Fallback to console
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
      }
    } catch (error) {
      console.error("Toast error:", error);
      console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
  };

  const handleCreateWatchlist = async (data) => {
    try {
      // TODO: Implement create watchlist API call
      showToast("Sukces", "Watchlista została utworzona", "success");
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      showToast("Błąd", "Nie udało się utworzyć watchlisty", "error");
    }
  };

  const handleAddSymbol = async (data) => {
    try {
      // TODO: Implement add symbol API call
      showToast("Sukces", "Symbol został dodany do watchlisty", "success");
      setShowAddSymbolModal(false);
      refetch();
    } catch (error) {
      showToast("Błąd", "Nie udało się dodać symbolu", "error");
    }
  };

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Nie udało się pobrać watchlist</p>
          <Button onClick={refetch} className="mt-4">
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Watchlists Sidebar */}
      <WatchlistsSidebar
        watchlists={watchlists}
        selectedWatchlist={selectedWatchlist}
        onWatchlistSelect={handleWatchlistSelect}
        onCreateWatchlist={() => setShowCreateModal(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
      />

      {/* Watchlist Content */}
      <div className="lg:col-span-2">
        {selectedWatchlist ? (
          <WatchlistContent
            watchlist={selectedWatchlist}
            onAddSymbol={() => setShowAddSymbolModal(true)}
            onRefresh={refetch}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No watchlist selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Select a watchlist from the sidebar or create a new one to get
                  started.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Watchlist
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CreateWatchlistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateWatchlist}
      />

      <AddSymbolModal
        isOpen={showAddSymbolModal}
        onClose={() => setShowAddSymbolModal(false)}
        onSubmit={handleAddSymbol}
        watchlist={selectedWatchlist}
      />
    </div>
  );
}
