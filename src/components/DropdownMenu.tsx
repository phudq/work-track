import React, { useState, createContext, useMemo, forwardRef } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingFocusManager,
  UseFloatingReturn,
  useId,
  useMergeRefs,
  FloatingPortal,
  Placement
} from "@floating-ui/react";

type ContextType = (
  ReturnType<typeof useInteractions> &
  UseFloatingReturn & {
    open: boolean;
    setOpen: (open: boolean) => void
  }
) | null;

const DropdownContext = createContext<ContextType>(null);

function useDropdownContext() {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownTrigger must be used within a DropdownMenu");
  }
  return context;
}

export function DropdownMenu({ children, placement }: { children: React.ReactNode, placement?: Placement }) {
  const [open, setOpen] = useState(false);

  const data = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement,
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: "end",
        padding: 5
      }),
      shift({ padding: 5 })
    ]
  });
  const context = data.context;


  const click = useClick(context, {});
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  const dropdownContext = useMemo(() => ({
    open,
    setOpen,
    ...data,
    ...interactions
  }), [open, setOpen, data]);

  return <DropdownContext.Provider value={dropdownContext}>
    {children}
  </DropdownContext.Provider>
}

export const DropdownTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLProps<HTMLElement> & { children: React.ReactNode }
>(({ children, ...props }, propRefs) => {
  const context = useDropdownContext();
  const childRef = (children as any).ref;

  const ref = useMergeRefs([context.refs.setReference, propRefs, childRef]);
  return <button
    ref={ref}
    data-state={context.open ? "open" : "closed"}
    {...context.getReferenceProps(props)}
  >{children}</button>
})

export const DropdownContent = forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement> & { children: React.ReactNode }
>(({ style, ...props }, propRefs) => {
  const { context: floatingContext, ...context } = useDropdownContext();
  const ref = useMergeRefs([context.refs.setFloating, propRefs]);

  if (!floatingContext.open) return null;

  return <FloatingPortal>
    <FloatingFocusManager context={floatingContext} modal={false}>
      <div
        ref={ref}
        style={{ ...context.floatingStyles, ...style }}
        {...context.getFloatingProps(props)}
      >{props.children}</div>
    </FloatingFocusManager>
  </FloatingPortal>
})
