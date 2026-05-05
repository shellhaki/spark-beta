import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
	return (
		<input
			className={cn(
				"h-[52px] w-full rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--soft)] focus:border-violet-300 focus:ring-4 focus:ring-violet-500/12",
				className
			)}
			{...props}
		/>
	);
}
