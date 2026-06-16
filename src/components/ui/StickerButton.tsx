import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "cheese" | "tomato" | "basil" | "sky" | "plum" | "dough" | "cream" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  cheese: "bg-cheese text-ink hover:bg-cheeseLight",
  tomato: "bg-tomato text-white hover:bg-tomatoDark",
  basil: "bg-basil text-white hover:bg-basilDark",
  sky: "bg-sky text-white hover:brightness-95",
  plum: "bg-plum text-white hover:brightness-95",
  dough: "bg-dough text-white hover:bg-doughDark",
  cream: "bg-cream text-ink hover:bg-creamdeep",
  ghost: "bg-white/70 text-ink hover:bg-white",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-[40px]",
  md: "px-6 py-3 text-base min-h-[52px]",
  lg: "px-8 py-4 text-lg min-h-[60px]",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const StickerButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "cheese", size = "md", className, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={cn("sticker-btn no-select", VARIANT[variant], SIZE[size], className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
StickerButton.displayName = "StickerButton";
export default StickerButton;
