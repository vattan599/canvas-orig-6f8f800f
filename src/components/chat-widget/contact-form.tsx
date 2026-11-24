import { useEffect, useMemo, useState } from "react";
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";
import type { ChatState, ContactField } from "./types";

export function ContactForm(props: {
  fields: ContactField[];
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  compliance: any;
  showConsent: boolean;
  consentGiven: boolean;
  setConsentGiven: (v: boolean) => void;
  consentRequired: boolean;
  captchaRequired: boolean;
  requestState?: string | undefined;
  error: ChatState["error"];
  formError: string | null;
  detectedCountry?: string | null | undefined;
}) {
  const {
    fields,
    values,
    onChange,
    onSubmit,
    compliance,
    showConsent,
    consentGiven,
    setConsentGiven,
    consentRequired,
    captchaRequired,
    requestState,
    error,
    formError,
    detectedCountry,
  } = props;

  const submitting = requestState === "in_progress";
  const phoneError = error?.field === "phone" ? error.message : null;

  return (
    <form className="pl-form" onSubmit={onSubmit}>
      {fields.map((f) => (
        <div key={f.value} className="pl-field">
          <label htmlFor={`pl-${f.value}`}>
            {f.label}
            {f.required && <span className="pl-req"> *</span>}
          </label>
          {f.dataType === "TEXTAREA" ? (
            <textarea
              id={`pl-${f.value}`}
              placeholder={f.placeholder}
              required={f.required}
              value={values[f.value] ?? ""}
              onChange={(e) => onChange(f.value, e.target.value)}
            />
          ) : f.dataType === "PHONE" ? (
            <PhoneField
              field={f}
              value={values[f.value] ?? ""}
              onChange={onChange}
              detectedCountry={detectedCountry}
            />
          ) : (
            <input
              id={`pl-${f.value}`}
              type={f.dataType === "EMAIL" ? "email" : "text"}
              placeholder={f.placeholder}
              required={f.required}
              value={values[f.value] ?? ""}
              onChange={(e) => onChange(f.value, e.target.value)}
            />
          )}
        </div>
      ))}

      {phoneError && <p className="pl-field-err">{phoneError}</p>}
      {formError && <p className="pl-field-err">{formError}</p>}
      {error?.message && error.field !== "phone" && <p className="pl-field-err">{error.message}</p>}

      {showConsent && (
        <label className="pl-consent">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
          />
          <span>{compliance.consentText}</span>
        </label>
      )}
      {compliance.a2pMessage && <p className="pl-a2p">{compliance.a2pMessage}</p>}

      <button
        type="submit"
        className="pl-btn pl-btn-gold"
        disabled={submitting || captchaRequired || (consentRequired && !consentGiven)}
      >
        {submitting ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

function PhoneField(props: {
  field: ContactField;
  value: string;
  onChange: (k: string, v: string) => void;
  detectedCountry?: string | null | undefined;
}) {
  const { field, onChange, detectedCountry } = props;
  const [raw, setRaw] = useState("");
  const [country, setCountry] = useState<CountryCode>((detectedCountry as CountryCode) ?? "CA");
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!raw && detectedCountry) setCountry(detectedCountry as CountryCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedCountry]);

  const countries = useMemo(
    () =>
      getCountries()
        .map((c) => ({
          c,
          name: new Intl.DisplayNames(["en"], { type: "region" }).of(c) ?? c,
          dial: `+${getCountryCallingCode(c)}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const update = (text: string, c: CountryCode = country) => {
    setRaw(text);
    const p = parsePhoneNumberFromString(text, c);
    onChange(field.value, p?.isValid() ? p.number : "");
  };

  const dial = (c: CountryCode) => `+${getCountryCallingCode(c)}`;

  return (
    <div className="relative flex gap-2">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="pl-dial"
        onClick={() => setOpen((o) => !o)}
      >
        {dial(country)}
      </button>
      {open && (
        <div role="listbox" className="pl-listbox">
          <input
            autoFocus
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          {countries
            .filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
            .map((x) => (
              <div
                key={x.c}
                role="option"
                aria-selected={x.c === country}
                className="pl-listopt"
                onClick={() => {
                  setCountry(x.c);
                  setOpen(false);
                  update(raw, x.c);
                }}
              >
                {x.name} {x.dial}
              </div>
            ))}
        </div>
      )}
      <input
        type="tel"
        name={field.value}
        required={field.required}
        placeholder={field.placeholder}
        value={raw}
        onChange={(e) => update(e.target.value)}
        className="pl-tel"
      />
    </div>
  );
}
