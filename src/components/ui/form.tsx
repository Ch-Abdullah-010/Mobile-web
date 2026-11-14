import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-lg border bg-surface px-3 text-sm text-content shadow-xs transition-colors placeholder:text-content-subtle focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:cursor-not-allowed disabled:bg-surface-sunken aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/30";

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("text-sm font-medium text-content", className)} {...props}>
      {children}
      {required ? <span className="ml-0.5 text-danger">*</span> : null}
    </label>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label?: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {hint && !error ? <p className="text-xs text-content-subtle">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseField, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseField, "min-h-24 py-2.5", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(baseField, "h-11 pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const id = props.id ?? props.name;
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-border-strong text-brand accent-[var(--brand)] focus:ring-2 focus:ring-brand/40",
          className
        )}
        {...props}
      />
      {label ? (
        <label htmlFor={id} className="text-sm text-content-muted">
          {label}
        </label>
      ) : null}
    </div>
  );
}
