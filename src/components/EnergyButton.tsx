import { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface EnergyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
}

const EnergyButton = ({ children, variant = "primary", className, ...props }: EnergyButtonProps) => {
  const variantStyles = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.8)]",
    secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_0_30px_hsl(var(--secondary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--secondary)/0.8)]",
    accent: "bg-accent hover:bg-accent/90 text-accent-foreground shadow-[0_0_30px_hsl(var(--accent)/0.5)] hover:shadow-[0_0_50px_hsl(var(--accent)/0.8)]",
  };

  return (
    <button
      className={cn(
        "relative px-8 py-4 rounded-lg font-bold text-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:-translate-y-1",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default EnergyButton;
