"use client";

import * as React from "react";
import { cn } from "cn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const DESKTOP = "(min-width: 48rem)";

function abonner(callback: () => void) {
  const mql = window.matchMedia(DESKTOP);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useErDesktop() {
  return React.useSyncExternalStore(
    abonner,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

const ErDesktopContext = React.createContext(true);

function useErDesktopFraRot() {
  return React.useContext(ErDesktopContext);
}

interface RotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DelProps {
  className?: string;
  children?: React.ReactNode;
}

function ResponsiveDialog({ open, onOpenChange, children }: RotProps) {
  const erDesktop = useErDesktop();
  return (
    <ErDesktopContext.Provider value={erDesktop}>
      {erDesktop ? (
        <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
          {children}
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={(o) => onOpenChange(o)} showSwipeHandle>
          {children}
        </Drawer>
      )}
    </ErDesktopContext.Provider>
  );
}

function ResponsiveDialogContent({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  if (erDesktop) {
    return (
      <DialogContent className={cn("max-h-[85dvh] overflow-y-auto sm:max-w-xl", className)}>
        {children}
      </DialogContent>
    );
  }
  return <DrawerContent className={className}>{children}</DrawerContent>;
}

function ResponsiveDialogHeader({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  const Komponent = erDesktop ? DialogHeader : DrawerHeader;
  return <Komponent className={cn("text-left", className)}>{children}</Komponent>;
}

function ResponsiveDialogTitle({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  const Komponent = erDesktop ? DialogTitle : DrawerTitle;
  return <Komponent className={className}>{children}</Komponent>;
}

function ResponsiveDialogDescription({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  const Komponent = erDesktop ? DialogDescription : DrawerDescription;
  return <Komponent className={className}>{children}</Komponent>;
}

function ResponsiveDialogBody({ className, children }: DelProps) {
  return (
    <div className={cn("min-h-0 overflow-y-auto px-4 md:px-0 md:overflow-visible", className)}>
      {children}
    </div>
  );
}

function ResponsiveDialogFooter({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  const Komponent = erDesktop ? DialogFooter : DrawerFooter;
  return <Komponent className={cn("pt-4", className)}>{children}</Komponent>;
}

function ResponsiveDialogClose({ className, children }: DelProps) {
  const erDesktop = useErDesktopFraRot();
  const Komponent = erDesktop ? DialogClose : DrawerClose;
  return <Komponent className={className}>{children}</Komponent>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
};