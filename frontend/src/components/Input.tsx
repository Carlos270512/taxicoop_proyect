import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, name, className = '', ...rest }: InputProps) {
  const inputId = id ?? name ?? label;

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`field-input${error ? ' has-error' : ''} ${className}`.trim()}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}
