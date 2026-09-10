"use client";

// Hand-rolled form fields shared by every admin create/edit form, styled to
// match SignInView's `.field` / `.err` / `.hint` idiom (see app/signin/signin.css)
// but namespaced `ad-*` so they can carry their own admin.css rules.

import { useState } from "react";

export function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
}) {
  return (
    <div className={`ad-field${error ? " bad" : ""}`}>
      <label>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(type === "number" ? (raw === "" ? "" : Number(raw)) : raw);
        }}
      />
      {error ? <div className="ad-err">{error}</div> : null}
    </div>
  );
}

export function TextAreaField({ label, value, onChange, error, rows = 4, disabled = false }) {
  return (
    <div className={`ad-field${error ? " bad" : ""}`}>
      <label>{label}</label>
      <textarea rows={rows} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      {error ? <div className="ad-err">{error}</div> : null}
    </div>
  );
}

/**
 * A textarea for a JSON-typed column (hero/sections/payload/configuration).
 * Keeps its own draft text so the field stays editable while invalid, parses
 * on every change and re-checks on blur, and only lifts a value up to the
 * parent once it parses — the parent's last-known-good value is what gets
 * submitted if the field is left mid-edit. Give this a `key` prop tied to the
 * record id when reusing it across records so it reinitialises its draft.
 */
export function JsonField({ label, value, onChange, error, rows = 8, disabled = false }) {
  const [text, setText] = useState(() => safeStringify(value));
  const [localError, setLocalError] = useState(null);

  function safeStringify(v) {
    try {
      return JSON.stringify(v === undefined ? null : v, null, 2);
    } catch {
      return "";
    }
  }

  function parse(raw) {
    const trimmed = raw.trim();
    if (trimmed === "") return { ok: true, value: null };
    try {
      return { ok: true, value: JSON.parse(trimmed) };
    } catch {
      return { ok: false };
    }
  }

  function handleChange(raw) {
    setText(raw);
    const result = parse(raw);
    if (result.ok) {
      setLocalError(null);
      onChange(result.value);
    } else {
      setLocalError("Not valid JSON.");
    }
  }

  function handleBlur() {
    const result = parse(text);
    setLocalError(result.ok ? null : "Not valid JSON.");
  }

  return (
    <div className={`ad-field${error || localError ? " bad" : ""}`}>
      <label>{label}</label>
      <textarea
        className="ad-json"
        rows={rows}
        value={text}
        disabled={disabled}
        spellCheck={false}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
      />
      {localError || error ? <div className="ad-err">{localError || error}</div> : null}
    </div>
  );
}

export function ToggleField({ label, checked, onChange, disabled = false }) {
  return (
    <label className={`ad-toggle${disabled ? " disabled" : ""}`}>
      <input
        type="checkbox"
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ad-toggle-track">
        <span className="ad-toggle-thumb" />
      </span>
      <span className="ad-toggle-label">{label}</span>
    </label>
  );
}

export function SubmitButton({ pending = false, children, disabled, ...rest }) {
  return (
    <button className={`ad-submit${pending ? " loading" : ""}`} type="submit" disabled={pending || disabled} {...rest}>
      <span className="ad-sp" />
      <span className="ad-txt">{children}</span>
    </button>
  );
}
