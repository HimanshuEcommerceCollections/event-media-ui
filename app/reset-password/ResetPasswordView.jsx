"use client";

// /reset-password?token=… — the other end of two mails: the password-reset
// link, and the vendor invite, which carries the same kind of token because an
// invited vendor's account is created with a random password nobody has seen.
//
// The token is read from window.location rather than useSearchParams() so this
// stays a plain client component with no Suspense boundary. It is never
// rendered on screen and never logged: it is a bearer credential for the few
// minutes it lives.
//
// A used or expired token is only detectable by trying it, so the form submits
// and paints whatever the server says rather than pre-validating anything.

import { useEffect, useState } from "react";
import { ApiError, resetPassword } from "../../lib/api";
import "./reset-password.css";

// Matches the backend's `password` schema (auth.schemas.ts) so the common
// mistakes are caught before a round trip; the server is still the authority.
function localPasswordError(value) {
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(value)) return "Include at least one letter.";
  if (!/[0-9]/.test(value) && !/[^A-Za-z0-9]/.test(value)) return "Include a number or a symbol.";
  return null;
}

const Logo = () => (
  <div className="rp-logo">
    <span className="rings">
      <i />
      <i />
    </span>
    <b>events &amp; media</b>
  </div>
);

export default function ResetPasswordView() {
  // undefined = not read yet (no localStorage/search on the server render),
  // "" = arrived with no token at all.
  const [token, setToken] = useState(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [hint, setHint] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    const passwordError = localPasswordError(password);
    if (passwordError) next.password = passwordError;
    if (confirm !== password) next.confirm = "Both passwords need to match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    setHint("");
    try {
      await resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        // 422s name the field they are about; everything else (an expired or
        // already-used link) is a message about the link itself.
        const fields = err.fieldErrors();
        if (Object.keys(fields).length > 0) {
          setErrors({ password: fields.password, confirm: undefined });
          if (fields.token) setHint(fields.token);
        } else {
          setHint(err.message);
        }
      } else {
        setHint("Something went wrong. Try again.");
      }
    } finally {
      setPending(false);
    }
  };

  if (done) {
    return (
      <div className="rp-page">
        <div className="rp-card rp-done">
          <Logo />
          <div className="ck">✓</div>
          <h1>Password set</h1>
          <p className="rp-sub">
            You can sign in with it now. We will still send a one-time code to your email — that is
            the second half of every sign-in here.
          </p>
          <a className="rp-btn" href="/signin" style={{ textDecoration: "none" }}>
            Go to sign in →
          </a>
        </div>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="rp-page">
        <div className="rp-card">
          <Logo />
          <h1>That link is incomplete</h1>
          <p className="rp-sub">
            This page needs the link from your email — the whole thing, including everything after
            the question mark. Ask for a fresh one if it has gone missing.
          </p>
          <a className="rp-btn" href="/signin" style={{ textDecoration: "none" }}>
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      <div className="rp-card">
        <Logo />
        <h1>Choose a password</h1>
        <p className="rp-sub">
          Set the password for your account. The link you followed works once and expires shortly,
          so finish this in one go.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <div className={`rp-field${errors.password ? " bad" : ""}`}>
            <label htmlFor="rp-pass">New password</label>
            <input
              id="rp-pass"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={token === undefined}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password ? <div className="rp-err">{errors.password}</div> : null}
          </div>

          <div className={`rp-field${errors.confirm ? " bad" : ""}`}>
            <label htmlFor="rp-confirm">Confirm password</label>
            <input
              id="rp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              disabled={token === undefined}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm ? <div className="rp-err">{errors.confirm}</div> : null}
          </div>

          <p className={`rp-hint${hint ? " error" : ""}`}>
            {hint || "At least 8 characters, with a letter and a number or symbol."}
          </p>

          <button className={`rp-btn${pending ? " loading" : ""}`} type="submit" disabled={pending || token === undefined}>
            <span className="sp" />
            <span>{pending ? "Saving…" : "Save password"}</span>
          </button>
        </form>

        <p className="rp-foot">
          Link expired? <a href="/signin">Ask for a new one</a>
        </p>
      </div>
    </div>
  );
}
