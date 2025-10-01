"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = createContext();

export function DialogProvider({ children }) {
  const [dialogs, setDialogs] = useState([]);

  const open = (id) => setDialogs((d) => [...d, id]);
  const close = (id) => setDialogs((d) => d.filter((x) => x !== id));

  return (
    <DialogContext.Provider value={{ dialogs, open, close }}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog(id) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be inside DialogProvider");
  return {
    isOpen: ctx.dialogs.includes(id),
    open: () => ctx.open(id),
    close: () => ctx.close(id),
  };
}

export function Dialog({ id, children, className }) {
  const { isOpen, close } = useDialog(id);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
        className
      )}
      onClick={close}
    >
      {children}
    </div>,
    document.body
  );
}

export function DialogContent({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          const { close } = useContext(DialogContext);
          close();
        }}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <X />
      </button>
      {children}
    </div>
  );
}

export function DialogHeader({ title, description, className }) {
  return (
    <div className={cn("mb-4", className)}>
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}

// Usage:

// In app/layout.js:
// import { DialogProvider } from "@/components/ui/Dialog";
// <DialogProvider>{children}</DialogProvider>

// In page:
// import { Dialog, DialogContent, DialogHeader, useDialog } from "@/components/ui/Dialog";
// const { open, close, isOpen } = useDialog("create-watchlist");
// <Button onClick={open}>Nowa</Button>
// <Dialog id="create-watchlist">
//   <DialogContent>
//     <DialogHeader title="Nowa watchlista" description="Opis" />
//     {/* form fields */}
//   </DialogContent>
// </Dialog>
