"use client";

// Sign In — ported from designs/SignIn-SHARE.html.
// Markup, class names and inline SVGs are reproduced as-is; signin.css is the
// reference <style> block copied verbatim. The vanilla-JS IIFE is reimplemented
// with React state, keeping the same thresholds, timings and copy.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  forgotPassword,
  resendOtp,
  revealMyPerk,
  signin as apiSignin,
  signup as apiSignup,
  verifyOtp,
} from "../../lib/api";
import { saveSession } from "../../lib/session";
import "./signin.css";

// Maps a server-side validation field name onto the id of the field block that
// should turn red. The backend reports details: [{ field, message }].
const FIELD_IDS = {
  in: { email: "fi-email", password: "fi-pass" },
  up: { fullName: "fu-name", email: "fu-email", password: "fu-pass" },
};

const STRENGTH_PCT = [6, 30, 55, 80, 100];
const STRENGTH_COLS = ["#e3e1d7", "#d0492f", "#e0b341", "#97c459", "#639922"];
const STRENGTH_LABS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_IDLE = "Use 8+ characters with a number & symbol.";

const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function scoreOf(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s;
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24">
    <path
      fill="#111"
      d="M16.36 12.9c-.02-2.02 1.65-2.99 1.72-3.04-0.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.3 2-1.4 2.43-.36 6.02 1 7.99.67.96 1.46 2.04 2.5 2 1-.04 1.38-.65 2.6-.65 1.2 0 1.55.65 2.6.63 1.08-.02 1.76-.98 2.42-1.95.76-1.11 1.07-2.19 1.09-2.25-.02-.01-2.09-.8-2.11-3.17zM14.6 6.7c.55-.67.92-1.6.82-2.53-.79.03-1.76.53-2.33 1.19-.51.59-.96 1.54-.84 2.44.88.07 1.79-.45 2.35-1.1z"
    />
  </svg>
);

const GiftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "1em", height: "1em", verticalAlign: "-.12em" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M5 12v9h14v-9" />
    <path d="M12 8v13" />
    <path d="M12 8S10.7 3.5 8.4 4.3 12 8 12 8zM12 8s1.3-4.5 3.6-3.7S12 8 12 8z" />
  </svg>
);

const Socials = () => (
  <div className="socials">
    <button className="soc" type="button">
      <GoogleIcon />
      Google
    </button>
    <button className="soc" type="button">
      <AppleIcon />
      Apple
    </button>
  </div>
);

export default function SignInView() {
  // "tabs" = sign-in/create-account forms, then the OTP step, then success.
  const [stage, setStage] = useState("tabs");
  const [tab, setTab] = useState("in");

  const [inEmail, setInEmail] = useState("");
  const [inPass, setInPass] = useState("");
  const [upName, setUpName] = useState("");
  const [upEmail, setUpEmail] = useState("");
  const [upPass, setUpPass] = useState("");
  const [tos, setTos] = useState(false);
  // Sent to the server: it decides the refresh-token lifetime from this.
  const [remember, setRemember] = useState(true);

  const [bad, setBad] = useState({});
  const [hintIn, setHintIn] = useState("");
  const [hintUp, setHintUp] = useState("");
  const OTP_HINT_DEFAULT = "Enter the 6-digit code we sent.";
  const [hintOtp, setHintOtp] = useState(OTP_HINT_DEFAULT);
  const [loading, setLoading] = useState(null); // "in" | "up" | "otp"

  const [showInPass, setShowInPass] = useState(false);
  const [showUpPass, setShowUpPass] = useState(false);
  // Bar starts at width 0 (CSS) and only picks up the 6% floor once typed in.
  const [strength, setStrength] = useState(null);

  const [mascot, setMascot] = useState("none");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpEmail, setOtpEmail] = useState("your email");
  const [pendingT, setPendingT] = useState("in");
  const [resendLeft, setResendLeft] = useState(0);

  const [perk, setPerk] = useState(null);
  const [perkHint, setPerkHint] = useState(null);

  // Held in a ref, not state: the scratch-card effect is set up once and would
  // otherwise capture a stale token.
  const tokenRef = useRef(null);
  const otpRefs = useRef([]);
  const verifyRef = useRef(null);
  const inPassRef = useRef(null);
  const upPassRef = useRef(null);
  const perkCvRef = useRef(null);
  const cfRef = useRef(null);

  const show = useCallback((t) => {
    setStage("tabs");
    setTab(t);
  }, []);

  /* ---------- resend countdown: 30 → 1, then a link ---------- */
  useEffect(() => {
    if (resendLeft <= 0) return undefined;
    const id = setTimeout(() => setResendLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendLeft]);

  /* ---------- confetti ---------- */
  const burst = useCallback(() => {
    const acv = cfRef.current;
    if (!acv) return;
    const x = acv.getContext("2d");
    acv.width = window.innerWidth;
    acv.height = window.innerHeight;
    const P = [];
    const cols = ["#639922", "#97c459", "#e0b341", "#fff", "#6fb0d6"];
    for (let i = 0; i < 130; i++) {
      P.push({
        x: window.innerWidth * 0.66,
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 3,
        r: 3 + Math.random() * 3,
        c: cols[i % cols.length],
        a: 1,
      });
    }
    (function loop() {
      x.clearRect(0, 0, acv.width, acv.height);
      let al = false;
      P.forEach((p) => {
        p.vy += 0.3;
        p.x += p.vx;
        p.y += p.vy;
        p.a -= 0.009;
        if (p.a > 0) {
          al = true;
          x.globalAlpha = Math.max(0, p.a);
          x.fillStyle = p.c;
          x.fillRect(p.x, p.y, p.r, p.r);
        }
      });
      x.globalAlpha = 1;
      if (al) requestAnimationFrame(loop);
    })();
  }, []);

  /* ---------- scratch card ---------- */
  useEffect(() => {
    if (!perk) return undefined;
    let cleanup = null;
    // Reference waits ~60ms after un-hiding so the card has been laid out.
    const start = setTimeout(() => {
      const cv = perkCvRef.current;
      if (!cv) return;
      const r = cv.parentElement.getBoundingClientRect();
      cv.width = r.width;
      cv.height = r.height;
      const x = cv.getContext("2d");
      const g = x.createLinearGradient(0, 0, cv.width, 0);
      g.addColorStop(0, "#c2cbb2");
      g.addColorStop(1, "#d7ddcb");
      x.fillStyle = g;
      x.fillRect(0, 0, cv.width, cv.height);
      x.fillStyle = "rgba(13,13,12,.45)";
      x.font = "bold 12px 'Space Mono',monospace";
      x.textAlign = "center";
      x.fillText("SCRATCH TO REVEAL", cv.width / 2, cv.height / 2 + 4);

      let down = false;
      let fin = false;
      const pos = (e) => {
        const b = cv.getBoundingClientRect();
        const p = e.touches ? e.touches[0] : e;
        return { x: p.clientX - b.left, y: p.clientY - b.top };
      };
      const chk = () => {
        if (fin) return;
        const d = x.getImageData(0, 0, cv.width, cv.height).data;
        let c = 0;
        let n = 0;
        for (let i = 3; i < d.length; i += 160) {
          n++;
          if (d[i] === 0) c++;
        }
        if (c / n > 0.42) {
          fin = true;
          cv.style.transition = "opacity .4s";
          cv.style.opacity = "0";
          setPerkHint("Applied to your first booking — enjoy!");
          burst();
          // Persist the reveal so it survives a reload.
          if (tokenRef.current) {
            revealMyPerk(tokenRef.current).catch(() => {
              // The gift is already on the account; a failed sync is not worth
              // interrupting the moment for.
            });
          }
        }
      };
      const scr = (e) => {
        if (!down) return;
        const pt = pos(e);
        x.globalCompositeOperation = "destination-out";
        // Must be opaque. The reference left fillStyle at the label's
        // rgba(13,13,12,.45), so each stroke only removed 45% of the alpha and
        // the "pixels at exactly alpha 0" test below could never pass - the card
        // was unscratchable no matter how long you rubbed it.
        x.fillStyle = "#000";
        x.beginPath();
        x.arc(pt.x, pt.y, 20, 0, 7);
        x.fill();
        chk();
      };
      const onDown = (e) => {
        down = true;
        scr(e);
      };
      const onUp = () => {
        down = false;
      };
      cv.addEventListener("pointerdown", onDown);
      cv.addEventListener("pointermove", scr);
      window.addEventListener("pointerup", onUp);
      cleanup = () => {
        cv.removeEventListener("pointerdown", onDown);
        cv.removeEventListener("pointermove", scr);
        window.removeEventListener("pointerup", onUp);
      };
    }, 60);
    return () => {
      clearTimeout(start);
      if (cleanup) cleanup();
    };
  }, [perk, burst]);

  /* ---------- flow ---------- */
  const finish = useCallback((t, serverPerk) => {
    setStage("done");
    // The gift is chosen and recorded server-side, so it survives a reload and
    // can actually be honoured against a booking.
    if (t === "up" && serverPerk) {
      setPerk(serverPerk.label);
      setPerkHint("");
    } else {
      setPerk(null);
      setPerkHint(null);
    }
  }, []);

  const showOtp = useCallback((t, email, challenge) => {
    setPendingT(t);
    setOtpEmail(email || "your email");
    setStage("otp");
    setOtp(["", "", "", "", "", ""]);
    setResendLeft(challenge?.resendAvailableInSeconds ?? 30);
    // With no mail provider wired up the API echoes the code when
    // EXPOSE_DEV_CODES is on, so local runs stay testable.
    setHintOtp(challenge?.devCode ? `Demo · your code is ${challenge.devCode}` : OTP_HINT_DEFAULT);
    requestAnimationFrame(() => otpRefs.current[0]?.focus());
  }, []);

  /** Paints server-side field errors onto the form. Returns true if any stuck. */
  const applyServerErrors = (err, t) => {
    const map = FIELD_IDS[t];
    const fields = err.fieldErrors();
    const next = { ...bad };
    let painted = false;
    for (const [field, id] of Object.entries(map)) {
      if (fields[field]) {
        next[id] = true;
        painted = true;
      }
    }
    setBad(next);
    if (fields.acceptTos && t === "up") {
      setHintUp(fields.acceptTos);
      painted = true;
    }
    return painted;
  };

  const submit = async (e, t) => {
    e.preventDefault();
    const email = t === "in" ? inEmail : upEmail;
    const pw = t === "in" ? inPass : upPass;
    const next = { ...bad };
    let ok = true;

    next[t === "in" ? "fi-email" : "fu-email"] = !emailOk(email);
    if (!emailOk(email)) ok = false;

    next[t === "in" ? "fi-pass" : "fu-pass"] = pw.length < 6;
    if (pw.length < 6) ok = false;

    if (t === "up") {
      next["fu-name"] = !upName.trim();
      if (!upName.trim()) ok = false;
      if (!tos) {
        setHintUp("Please accept the Terms to continue.");
        ok = false;
      } else {
        setHintUp("");
      }
    }
    setBad(next);
    if (!ok) return;

    const setHint = t === "in" ? setHintIn : setHintUp;
    setHint("");
    setLoading(t);
    try {
      const challenge =
        t === "in"
          ? await apiSignin({ email, password: pw, rememberMe: remember })
          : await apiSignup({ fullName: upName.trim(), email, password: pw, acceptTos: true });
      showOtp(t, email, challenge);
    } catch (err) {
      if (err instanceof ApiError) {
        // 422 carries per-field detail; anything else is a single message.
        if (!applyServerErrors(err, t)) setHint(err.message);
      } else {
        setHint("Something went wrong. Try again.");
      }
    } finally {
      setLoading(null);
    }
  };

  const verify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setHintOtp("Enter all 6 digits.");
      return;
    }
    setLoading("otp");
    try {
      const session = await verifyOtp({ email: otpEmail, code });
      tokenRef.current = session.accessToken;
      saveSession(session);
      finish(pendingT, session.perk ?? null);
    } catch (err) {
      // Wrong or expired codes come back with the attempts remaining, so the
      // server's message is more useful than anything invented here.
      setHintOtp(err instanceof ApiError ? err.message : "Could not verify that code.");
      setOtp(["", "", "", "", "", ""]);
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } finally {
      setLoading(null);
    }
  };

  /* ---------- OTP field behaviour ---------- */
  const otpInput = (idx, raw) => {
    const v = raw.replace(/[^0-9]/g, "").slice(0, 1);
    setOtp((prev) => {
      const nx = [...prev];
      nx[idx] = v;
      if (v && idx < 5) otpRefs.current[idx + 1]?.focus();
      if (nx.every((d) => d)) verifyRef.current?.focus();
      return nx;
    });
  };

  const otpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const otpPaste = (e, idx) => {
    e.preventDefault();
    const d = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    setOtp((prev) => {
      const nx = [...prev];
      for (let k = 0; k < d.length && idx + k < 6; k++) nx[idx + k] = d[k];
      return nx;
    });
    otpRefs.current[Math.min(idx + d.length, 5)]?.focus();
  };

  /* ---------- password field ↔ mascot ---------- */
  const passFocus = (isText) => setMascot(isText ? "peek" : "cover");
  const passBlur = () => setMascot("none");

  const toggleEye = (which) => {
    if (which === "in") {
      const nextIsText = !showInPass;
      setShowInPass(nextIsText);
      if (document.activeElement === inPassRef.current) setMascot(nextIsText ? "peek" : "cover");
    } else {
      const nextIsText = !showUpPass;
      setShowUpPass(nextIsText);
      if (document.activeElement === upPassRef.current) setMascot(nextIsText ? "peek" : "cover");
    }
  };

  const onUpPass = (v) => {
    setUpPass(v);
    const s = scoreOf(v);
    setStrength({
      width: `${STRENGTH_PCT[s]}%`,
      background: STRENGTH_COLS[s],
      label: v ? `Strength: ${STRENGTH_LABS[s]}` : STRENGTH_IDLE,
    });
  };

  const doResend = async () => {
    try {
      const challenge = await resendOtp(otpEmail);
      setResendLeft(challenge?.resendAvailableInSeconds ?? 30);
      setHintOtp(
        challenge?.devCode ? `New code sent · ${challenge.devCode}` : "A new code is on its way.",
      );
    } catch (err) {
      // A 429 carries the remaining cooldown, so mirror it in the countdown
      // instead of letting the link stay clickable.
      const retry = err instanceof ApiError ? err.details?.retryAfterSeconds : null;
      if (typeof retry === "number" && retry > 0) setResendLeft(retry);
      setHintOtp(err instanceof ApiError ? err.message : "Could not send a new code.");
    }
  };

  const doForgot = async (e) => {
    e.preventDefault();
    if (!emailOk(inEmail)) {
      setBad((b) => ({ ...b, "fi-email": true }));
      setHintIn("Enter your email first, then tap Forgot password.");
      return;
    }
    try {
      const result = await forgotPassword(inEmail);
      // The endpoint answers 202 whether or not the address is on file.
      setHintIn(
        result?.devToken
          ? `Reset link sent · token ${result.devToken.slice(0, 12)}…`
          : "Reset link sent — check your email.",
      );
    } catch (err) {
      setHintIn(err instanceof ApiError ? err.message : "Could not send a reset link.");
    }
  };

  const btn = (t, label) => (
    <button className={`sub-btn${loading === t ? " loading" : ""}`} type="submit">
      <span className="sp" />
      <span className="txt">{label}</span>
    </button>
  );

  return (
    <>
      <div className="auth">
        <div className="auth-visual">
          <div className="bg" style={{ backgroundImage: "url('/assets/signin-visual.jpg')" }} />
          <a className="av-logo" href="/">
            <span className="rings">
              <i />
              <i />
            </span>
            <b>events &amp; media</b>
          </a>
          <div className="av-mid">
            <p className="eyebrow">Welcome back</p>
            <h1>One request. Whole event covered.</h1>
            <div className="av-trust">
              <span>
                <b>4.9★</b> rating
              </span>
              <span>
                <b>320+</b> events
              </span>
              <span>
                <b>Vetted</b> local pros
              </span>
            </div>
          </div>
          <div className="av-quote">
            <div className="st">★★★★★</div>
            <p>&ldquo;Booked our whole backyard wedding in one request. It felt effortless.&rdquo;</p>
            <div className="who">Priya &amp; Marcus · Raleigh</div>
          </div>
        </div>

        <div className="auth-form">
          <div className="fc">
            <a className="fc-back" href="/">
              ← Back to site
            </a>

            <div className={`mascot${mascot === "none" ? "" : ` ${mascot}`}`} id="mascot" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle cx="30" cy="34" r="11" fill="#639922" />
                <circle cx="90" cy="34" r="11" fill="#639922" />
                <ellipse cx="60" cy="66" rx="42" ry="40" fill="#639922" />
                <ellipse cx="60" cy="70" rx="30" ry="27" fill="#7bb03a" />
                <g className="m-face">
                  <circle className="eye" cx="47" cy="62" r="6" fill="#0d0d0c" />
                  <circle className="eye" cx="73" cy="62" r="6" fill="#0d0d0c" />
                  <path
                    className="mouth"
                    d="M50 82 Q60 90 70 82"
                    stroke="#0d0d0c"
                    strokeWidth="3.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
                <g className="m-hands">
                  <circle className="hand l" cx="40" cy="112" r="14" fill="#4f7d1c" />
                  <circle className="hand r" cx="80" cy="112" r="14" fill="#4f7d1c" />
                </g>
              </svg>
            </div>

            <div
              className={`tabs${tab === "up" ? " up" : ""}`}
              id="tabs"
              style={stage === "tabs" ? undefined : { display: "none" }}
            >
              <div className="tab-ind" />
              <button className={tab === "in" ? "on" : undefined} data-t="in" onClick={() => show("in")}>
                Sign in
              </button>
              <button className={tab === "up" ? "on" : undefined} data-t="up" onClick={() => show("up")}>
                Create account
              </button>
            </div>

            {/* ---- sign in ---- */}
            <div className={`panel${stage === "tabs" && tab === "in" ? " on" : ""}`} id="panel-in">
              <h2>Sign in</h2>
              <p className="sub">Pick up where you left off.</p>
              <form id="formIn" noValidate onSubmit={(e) => submit(e, "in")}>
                <div className={`field${bad["fi-email"] ? " bad" : ""}`} id="fi-email">
                  <label>Email</label>
                  <div className="inp">
                    <input
                      type="email"
                      placeholder="you@email.com"
                      autoComplete="email"
                      value={inEmail}
                      onChange={(e) => setInEmail(e.target.value)}
                    />
                  </div>
                  <div className="err">Enter a valid email.</div>
                </div>
                <div className={`field${bad["fi-pass"] ? " bad" : ""}`} id="fi-pass">
                  <label>Password</label>
                  <div className="inp">
                    <input
                      ref={inPassRef}
                      type={showInPass ? "text" : "password"}
                      placeholder="Your password"
                      autoComplete="current-password"
                      value={inPass}
                      onChange={(e) => setInPass(e.target.value)}
                      onFocus={() => passFocus(showInPass)}
                      onBlur={passBlur}
                    />
                    <button
                      className="eye"
                      type="button"
                      aria-label="show"
                      style={{ color: showInPass ? "var(--accent)" : "var(--tx3)" }}
                      onClick={() => toggleEye("in")}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  <div className="err">Password must be at least 6 characters.</div>
                </div>
                <div className="row">
                  <label>
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />{" "}
                    Remember me
                  </label>
                  <a href="#" id="forgot" onClick={doForgot}>
                    Forgot password?
                  </a>
                </div>
                <div className="hint" id="hintIn">
                  {hintIn}
                </div>
                {btn("in", "Sign in")}
              </form>
              <div className="divider">or continue with</div>
              <Socials />
              <p className="swap">
                New to Events &amp; Media?{" "}
                <a data-goto="up" onClick={() => show("up")}>
                  Create an account
                </a>
              </p>
            </div>

            {/* ---- create account ---- */}
            <div className={`panel${stage === "tabs" && tab === "up" ? " on" : ""}`} id="panel-up">
              <h2>Create account</h2>
              <p className="sub">Start planning in minutes.</p>
              <form id="formUp" noValidate onSubmit={(e) => submit(e, "up")}>
                <div className={`field${bad["fu-name"] ? " bad" : ""}`} id="fu-name">
                  <label>Full name</label>
                  <div className="inp">
                    <input
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      value={upName}
                      onChange={(e) => setUpName(e.target.value)}
                    />
                  </div>
                  <div className="err">Please enter your name.</div>
                </div>
                <div className={`field${bad["fu-email"] ? " bad" : ""}`} id="fu-email">
                  <label>Email</label>
                  <div className="inp">
                    <input
                      type="email"
                      placeholder="you@email.com"
                      autoComplete="email"
                      value={upEmail}
                      onChange={(e) => setUpEmail(e.target.value)}
                    />
                  </div>
                  <div className="err">Enter a valid email.</div>
                </div>
                <div className={`field${bad["fu-pass"] ? " bad" : ""}`} id="fu-pass">
                  <label>Password</label>
                  <div className="inp">
                    <input
                      ref={upPassRef}
                      type={showUpPass ? "text" : "password"}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      value={upPass}
                      onChange={(e) => onUpPass(e.target.value)}
                      onFocus={() => passFocus(showUpPass)}
                      onBlur={passBlur}
                    />
                    <button
                      className="eye"
                      type="button"
                      aria-label="show"
                      style={{ color: showUpPass ? "var(--accent)" : "var(--tx3)" }}
                      onClick={() => toggleEye("up")}
                    >
                      <EyeIcon />
                    </button>
                  </div>
                  <div className="strength">
                    <i
                      id="strBar"
                      style={strength ? { width: strength.width, background: strength.background } : undefined}
                    />
                  </div>
                  <div className="strength-lab" id="strLab">
                    {strength ? strength.label : STRENGTH_IDLE}
                  </div>
                </div>
                <label className="tos">
                  <input type="checkbox" id="tos" checked={tos} onChange={(e) => setTos(e.target.checked)} />{" "}
                  <span>I agree to the Terms &amp; Privacy Policy.</span>
                </label>
                <div className="hint" id="hintUp">
                  {hintUp}
                </div>
                {btn("up", "Create account")}
              </form>
              <div className="divider">or sign up with</div>
              <Socials />
              <p className="swap">
                Already have an account?{" "}
                <a data-goto="in" onClick={() => show("in")}>
                  Sign in
                </a>
              </p>
            </div>

            {/* ---- OTP ---- */}
            <div className={`panel${stage === "otp" ? " on" : ""}`} id="panel-otp">
              <h2>Verify it&rsquo;s you</h2>
              <p className="sub">
                We sent a 6-digit code to <b id="otpEmail">{otpEmail}</b>.
              </p>
              <div className="otp" id="otp">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className={d ? "filled" : undefined}
                    value={d}
                    onChange={(e) => otpInput(i, e.target.value)}
                    onKeyDown={(e) => otpKeyDown(e, i)}
                    onPaste={(e) => otpPaste(e, i)}
                  />
                ))}
              </div>
              <div className="hint" id="hintOtp">
                {hintOtp}
              </div>
              <button
                ref={verifyRef}
                className={`sub-btn${loading === "otp" ? " loading" : ""}`}
                id="otpVerify"
                type="button"
                onClick={verify}
              >
                <span className="sp" />
                <span className="txt">Verify &amp; continue</span>
              </button>
              <p className="swap" id="resend">
                {/* Empty until the OTP step is first shown, as in the reference. */}
                {stage !== "otp" ? null : resendLeft > 0 ? (
                  `Resend code in ${resendLeft}s`
                ) : (
                  <a id="rsA" onClick={doResend}>
                    Resend code
                  </a>
                )}
              </p>
              <p className="swap">
                <a data-goto="in" onClick={() => show("in")}>
                  ← Use a different method
                </a>
              </p>
            </div>

            {/* ---- success ---- */}
            <div className={`done${stage === "done" ? " on" : ""}`} id="done">
              <div className="ck">✓</div>
              <h2 id="doneH">{pendingT === "in" ? "Welcome back!" : "Account created!"}</h2>
              <p id="doneP">
                {pendingT === "in"
                  ? "You’re signed in and ready to plan."
                  : "You’re all set — let’s build your event."}
              </p>
              <div className="perk" id="perk" style={perk ? { display: "block" } : { display: "none" }}>
                <div className="perk-under" id="perkUnder">
                  {perk ? (
                    <>
                      <GiftIcon /> Welcome gift: <b>{perk}</b>
                    </>
                  ) : (
                    <>🎁 Welcome gift</>
                  )}
                </div>
                <canvas className="perk-scratch" id="perkCv" ref={perkCvRef} />
              </div>
              <div
                className="perk-hint"
                id="perkHint"
                style={{
                  display: perkHint === null ? "none" : "block",
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                {perkHint}
              </div>
              <a className="sub-btn" href="/build" style={{ textDecoration: "none" }}>
                Continue →
              </a>
            </div>
          </div>
        </div>
      </div>
      <canvas
        id="authCf"
        ref={cfRef}
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }}
      />
    </>
  );
}
