// "use client";

// import { useState } from "react";
// import { useParams } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableHeader,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectOption } from "@/components/ui/select";
// import { Plus, Search, Eye, Edit, Trash2, Star, StarOff } from "lucide-react";
// import { useToast } from "@/contexts/ToastContext";
// import { useWatchlists } from "@/hooks/usePortfolios";

// export default function WatchlistsPage() {
//   const { portfolioId } = useParams();
//   const { toast } = useToast(); // lub { notify } - sprawdź co zwraca Twój kontekst
//   const [current, setCurrent] = useState(null);
//   const [showCreate, setShowCreate] = useState(false);
//   const [showAdd, setShowAdd] = useState(false);
//   const [filters, setFilters] = useState({
//     search: "",
//     sortBy: "symbol",
//     sortOrder: "asc",
//   });
//   const [newList, setNewList] = useState({ name: "", description: "" });
//   const [newItem, setNewItem] = useState({ symbol: "", notes: "" });

//   // Pobierz watchlisty przez React Query
//   const {
//     data: watchlists = [],
//     isLoading,
//     isError,
//   } = useWatchlists(portfolioId);

//   // Ustaw pierwszą watchlistę jako domyślną jeśli jeszcze nie wybrano
//   if (watchlists.length > 0 && !current) {
//     setCurrent(watchlists[0]);
//   }

//   // Filtrowane items z aktualnej watchlisty
//   const filteredItems =
//     current?.items
//       ?.filter((item) => {
//         if (
//           filters.search &&
//           !item.symbol.toLowerCase().includes(filters.search.toLowerCase())
//         ) {
//           return false;
//         }
//         return true;
//       })
//       .sort((a, b) => {
//         if (filters.sortBy === "symbol") {
//           return filters.sortOrder === "asc"
//             ? a.symbol.localeCompare(b.symbol)
//             : b.symbol.localeCompare(a.symbol);
//         }
//         if (filters.sortBy === "addedAt") {
//           return filters.sortOrder === "asc"
//             ? new Date(a.addedAt) - new Date(b.addedAt)
//             : new Date(b.addedAt) - new Date(a.addedAt);
//         }
//         return 0;
//       }) || [];

//   if (isLoading) return <p>Ładowanie watchlist...</p>;

//   if (isError) {
//     toast &&
//       toast({
//         title: "Błąd",
//         description: "Nie udało się pobrać watchlist",
//         variant: "destructive",
//       });
//     return <p>Błąd podczas ładowania watchlist</p>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Watchlisty</h1>

//         {/* Prosty modal zamiast Dialog */}
//         <Button onClick={() => setShowCreate(true)}>
//           <Plus className="mr-2" />
//           Nowa watchlista
//         </Button>
//       </div>

//       <div className="flex gap-6">
//         {/* Lista watchlist */}
//         <Card className="w-1/4">
//           <CardHeader>
//             <CardTitle>Moje watchlisty</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-2">
//             {watchlists.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 <p>Brak watchlist</p>
//                 <p className="text-sm">Utwórz pierwszą watchlistę</p>
//               </div>
//             ) : (
//               watchlists.map((list) => (
//                 <div
//                   key={list._id}
//                   className={`p-3 rounded-lg cursor-pointer transition-colors ${
//                     current?._id === list._id
//                       ? "bg-blue-50 border-blue-200 border"
//                       : "hover:bg-gray-50"
//                   }`}
//                   onClick={() => setCurrent(list)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <h3 className="font-medium">{list.name}</h3>
//                       <p className="text-sm text-gray-500">
//                         {list.items?.length || 0} instrumentów
//                       </p>
//                     </div>
//                     {list.isPublic ? (
//                       <StarOff className="h-4 w-4" />
//                     ) : (
//                       <Star className="h-4 w-4" />
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//         {/* Zawartość wybranej watchlisty */}
//         <Card className="flex-1">
//           {current ? (
//             <>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <div className="space-y-1">
//                   <CardTitle>{current.name}</CardTitle>
//                   {current.description && (
//                     <p className="text-sm text-gray-600">
//                       {current.description}
//                     </p>
//                   )}
//                 </div>
//                 <Button onClick={() => setShowAdd(true)} size="sm">
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </CardHeader>
//               <CardContent>
//                 {/* Filtry */}
//                 <div className="flex gap-2 mb-4">
//                   <div className="flex-1">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <Input
//                         placeholder="Szukaj po symbolu..."
//                         className="pl-10"
//                         value={filters.search}
//                         onChange={(e) =>
//                           setFilters((f) => ({ ...f, search: e.target.value }))
//                         }
//                       />
//                     </div>
//                   </div>
//                   <Select
//                     value={filters.sortBy}
//                     onChange={(e) =>
//                       setFilters((f) => ({ ...f, sortBy: e.target.value }))
//                     }
//                     name="sortBy"
//                   >
//                     <SelectOption value="symbol">Symbol</SelectOption>
//                     <SelectOption value="addedAt">Data dodania</SelectOption>
//                   </Select>
//                 </div>

//                 {/* Tabela */}
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Symbol</TableHead>
//                       <TableHead>Notatki</TableHead>
//                       <TableHead>Data dodania</TableHead>
//                       <TableHead className="text-right">Akcje</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredItems.length === 0 ? (
//                       <TableRow>
//                         <TableCell
//                           colSpan={4}
//                           className="text-center py-8 text-gray-500"
//                         >
//                           Brak instrumentów w tej watchliście
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       filteredItems.map((item) => (
//                         <TableRow key={item._id}>
//                           <TableCell className="font-bold">
//                             {item.symbol}
//                           </TableCell>
//                           <TableCell
//                             className="max-w-xs truncate"
//                             title={item.notes}
//                           >
//                             {item.notes || "-"}
//                           </TableCell>
//                           <TableCell>
//                             {new Date(item.addedAt).toLocaleDateString("pl-PL")}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <div className="flex justify-end gap-1">
//                               <Button variant="ghost" size="sm">
//                                 <Eye className="h-4 w-4" />
//                               </Button>
//                               <Button variant="ghost" size="sm">
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="text-red-600"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </>
//           ) : (
//             <CardContent className="p-8">
//               <div className="text-center text-gray-500">
//                 <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
//                 <h3 className="text-lg font-medium mb-2">Wybierz watchlistę</h3>
//                 <p>
//                   Wybierz watchlistę z lewej strony, aby zobaczyć jej zawartość
//                 </p>
//               </div>
//             </CardContent>
//           )}
//         </Card>
//       </div>

//       {/* Modal create list - prosty overlay */}
//       {showCreate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
//             <div>
//               <h2 className="text-lg font-semibold">Utwórz nową watchlistę</h2>
//               <p className="text-sm text-gray-600 mt-1">
//                 Dodaj nową watchlistę do śledzenia wybranych instrumentów
//               </p>
//             </div>
//             <Input
//               placeholder="Nazwa watchlisty"
//               value={newList.name}
//               onChange={(e) =>
//                 setNewList((n) => ({ ...n, name: e.target.value }))
//               }
//             />
//             <Input
//               placeholder="Opis (opcjonalny)"
//               value={newList.description}
//               onChange={(e) =>
//                 setNewList((n) => ({ ...n, description: e.target.value }))
//               }
//             />
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setShowCreate(false)}>
//                 Anuluj
//               </Button>
//               <Button
//                 onClick={() => {
//                   // TODO: Wywołaj API create
//                   console.log("Creating watchlist:", newList);
//                   setShowCreate(false);
//                   setNewList({ name: "", description: "" });
//                 }}
//               >
//                 Utwórz
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal add symbol */}
//       {showAdd && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
//             <div>
//               <h2 className="text-lg font-semibold">
//                 Dodaj symbol do watchlisty
//               </h2>
//               <p className="text-sm text-gray-600 mt-1">
//                 Dodaj nowy instrument do śledzenia
//               </p>
//             </div>
//             <Input
//               placeholder="Symbol (np. AAPL, MSFT)"
//               value={newItem.symbol}
//               onChange={(e) =>
//                 setNewItem((i) => ({
//                   ...i,
//                   symbol: e.target.value.toUpperCase(),
//                 }))
//               }
//             />
//             <Input
//               placeholder="Notatki (opcjonalne)"
//               value={newItem.notes}
//               onChange={(e) =>
//                 setNewItem((i) => ({ ...i, notes: e.target.value }))
//               }
//             />
//             <div className="flex justify-end gap-2">
//               <Button variant="outline" onClick={() => setShowAdd(false)}>
//                 Anuluj
//               </Button>
//               <Button
//                 onClick={() => {
//                   // TODO: Wywołaj API add item
//                   console.log(
//                     "Adding item:",
//                     newItem,
//                     "to watchlist:",
//                     current._id
//                   );
//                   setShowAdd(false);
//                   setNewItem({ symbol: "", notes: "" });
//                 }}
//               >
//                 Dodaj
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamic imports for performance
const WatchlistsManager = dynamic(
  () => import("@/components/features/Watchlists/WatchlistsManager"),
  {
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlists sidebar skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-100 animate-pulse rounded w-32"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 animate-pulse rounded"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist content skeleton */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-8 bg-gray-100 animate-pulse rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function WatchlistsPage() {
  const { portfolioId } = useParams();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-gray-600">
            Track and monitor your favorite instruments
          </p>
        </div>
      </div>

      <WatchlistsManager portfolioId={portfolioId} />
    </div>
  );
}
