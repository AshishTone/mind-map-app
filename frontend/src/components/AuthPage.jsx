import { useState } from "react";

export function AuthPage({ onLogin, onSignup, isLoading, error }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });

  const submit = (event) => {
    event.preventDefault();
    const action = mode === "login" ? onLogin : onSignup;
    action(form);
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">Concept Revision Workspace</p>
          <h1>Build, save, and expand mind maps from any topic.</h1>
          <p>
            Sign in to create editable graph-based study maps, revisit saved maps, and generate a
            comprehensive first draft with Gemini.
          </p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="mode-switch">
            <button
              type="button"
              className={mode === "login" ? "mode-active" : ""}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={mode === "signup" ? "mode-active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <label className="field">
            <span>Username</span>
            <input
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="Enter username"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter password"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
}
