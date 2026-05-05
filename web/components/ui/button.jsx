import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const variants = {
	default: "bg-[var(--violet)] text-white shadow-[0_14px_30px_rgba(95,46,234,.22)] hover:bg-[var(--violet-2)]",
	secondary: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-strong)]",
	ghost: "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
};

export function Button({ className, variant = "default", asChild = false, ...props }) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			className={cn(
				"inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:pointer-events-none disabled:opacity-60",
				variants[variant],
				className
			)}
			{...props}
		/>
	);
}
