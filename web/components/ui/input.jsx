import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
	return (
		<input
			className={cn(
				"h-11 w-full rounded-md border border-[var(--line)] bg-[var(--field)] px-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--soft)] focus:border-[var(--accent)]",
				className
			)}
			{...props}
		/>
	);
}
