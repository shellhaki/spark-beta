"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, children }) {
	return (
		<SelectPrimitive.Root value={value} onValueChange={onValueChange}>
			{children}
		</SelectPrimitive.Root>
	);
}

export function SelectTrigger({ className, children }) {
	return (
		<SelectPrimitive.Trigger
			className={cn(
				"flex h-11 w-full items-center justify-between rounded-md border border-[var(--line)] bg-[var(--field)] px-3 text-left text-sm text-[var(--ink)] outline-none transition focus:border-[var(--accent)]",
				className
			)}
		>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className="h-4 w-4 text-slate-400" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

export function SelectValue(props) {
	return <SelectPrimitive.Value {...props} />;
}

export function SelectContent({ className, children }) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(
					"z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel-strong)] p-1 text-[var(--ink)] shadow-xl backdrop-blur-xl",
					className
				)}
				position="popper"
				sideOffset={8}
			>
				<SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

export function SelectItem({ className, children, ...props }) {
	return (
		<SelectPrimitive.Item
			className={cn(
				"relative flex cursor-pointer select-none items-center rounded px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-[var(--accent-soft)] data-[highlighted]:text-[var(--ink)]",
				className
			)}
			{...props}
		>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator className="ml-auto">
				<Check className="h-4 w-4" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}
