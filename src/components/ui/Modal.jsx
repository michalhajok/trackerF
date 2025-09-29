import { Fragment, useEffect } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  className,
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc, false);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc, false);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />

        {/* Modal panel */}
        <div
          className={cn(
            "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:p-6",
            sizes[size],
            className
          )}
        >
          {/* Close button */}
          {showCloseButton && (
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Header */}
          {(title || description) && (
            <div className="mb-6">
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900 pr-8">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
              )}
            </div>
          )}

          {/* Content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

const ModalHeader = ({ children, className }) => (
  <div className={cn("mb-6", className)}>{children}</div>
);

const ModalTitle = ({ children, className }) => (
  <h3 className={cn("text-lg font-medium leading-6 text-gray-900", className)}>
    {children}
  </h3>
);

const ModalDescription = ({ children, className }) => (
  <p className={cn("mt-2 text-sm text-gray-500", className)}>{children}</p>
);

const ModalContent = ({ children, className }) => (
  <div className={cn("", className)}>{children}</div>
);

const ModalFooter = ({ children, className }) => (
  <div
    className={cn(
      "mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
  >
    {children}
  </div>
);

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
};
export default Modal;
