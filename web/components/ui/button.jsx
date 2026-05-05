import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variants = {
	default: "bg-[var(--ink)] text-[var(--bg)] hover:opacity-90",
	secondary: "border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:bg-[var(--panel-strong)]",
	ghost: "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--ink)]"
};

export function Button({ className, variant = "default", asChild = false, ...props }) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			className={cn(
				"inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-55",
				variants[variant],
				className
			)}
			{...props}
		/>
	);
}
