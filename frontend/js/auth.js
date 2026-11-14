import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const page = document.body.dataset.page;
const statusMessage = document.querySelector("[data-status]");

function showStatus(message, isError = false) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", isError);
}

function setFormMode(mode) {
  const isSignup = mode === "signup";
  document.querySelector("[data-login-form]").hidden = isSignup;
  document.querySelector("[data-signup-form]").hidden = !isSignup;
  document.querySelector("[data-auth-intro]").textContent = isSignup
    ? "Create an account to keep your space stories close."
    : "Log in to continue exploring.";
  document.querySelector("#auth-title").textContent = isSignup
    ? "Join the mission"
    : "Welcome back";

  document.querySelectorAll("[data-show-form]").forEach((button) => {
    const active = button.dataset.showForm === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  showStatus("");
}

async function loadSupabase() {
  const response = await fetch("/api/config", { cache: "no-store" });
  const config = await response.json();
  if (!response.ok) {
    throw new Error(config.error || "Could not load Supabase configuration.");
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

async function start() {
  try {
    const supabase = await loadSupabase();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (page === "home") {
      const signedIn = Boolean(sessionData.session);
      document.querySelectorAll("[data-signed-in]").forEach((element) => {
        element.hidden = !signedIn;
      });
      document.querySelectorAll("[data-signed-out]").forEach((element) => {
        element.hidden = signedIn;
      });
      supabase.auth.onAuthStateChange((_event, session) => {
        const isSignedIn = Boolean(session);
        document.querySelectorAll("[data-signed-in]").forEach((element) => {
          element.hidden = !isSignedIn;
        });
        document.querySelectorAll("[data-signed-out]").forEach((element) => {
          element.hidden = isSignedIn;
        });
      });
    }

    if (page === "login") {
      document.querySelectorAll("[data-show-form]").forEach((button) => {
        button.addEventListener("click", () => setFormMode(button.dataset.showForm));
      });
      const initialMode =
        document.body.dataset.authMode ||
        (window.location.hash === "#signup" ? "signup" : "login");
      setFormMode(initialMode);

      document.querySelector("[data-login-form]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        showStatus("Signing in…");
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.get("email"),
            password: formData.get("password"),
          });
          if (error) return showStatus(error.message, true);
          window.location.assign("dashboard.html");
        } catch (error) {
          showStatus(error.message || "Sign-in failed. Please try again.", true);
        }
      });

      document.querySelector("[data-signup-form]").addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        showStatus("Creating your account…");
        try {
          const { data, error } = await supabase.auth.signUp({
            email: formData.get("email"),
            password: formData.get("password"),
            options: {
              data: { display_name: formData.get("displayName").trim() },
              emailRedirectTo: new URL("dashboard.html", window.location.href).href,
            },
          });
          if (error) return showStatus(error.message, true);
          if (data.session) {
            window.location.assign("dashboard.html");
            return;
          }
          showStatus("Account created. Check your email to confirm your address, then log in.");
        } catch (error) {
          showStatus(error.message || "Account creation failed. Please try again.", true);
        }
      });
    }

    if (page === "dashboard") {
      const user = sessionData.session?.user;
      if (!user) {
        window.location.replace("login.html");
        return;
      }

      const metadataName = user.user_metadata?.display_name;
      let displayName = metadataName || user.email || "Explorer";
      document.querySelector("[data-account-email]").textContent = user.email || "—";
      document.querySelector("[data-member-since]").textContent = formatDate(user.created_at);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) {
        showStatus(`Could not load your profile: ${profileError.message}`, true);
      } else if (profile?.display_name) {
        displayName = profile.display_name;
      }
      document.querySelector("[data-display-name]").textContent = displayName;
    }

    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        showStatus("Logging out…");
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          window.location.assign("/");
        } catch (error) {
          button.disabled = false;
          showStatus(error.message || "Log out failed. Please try again.", true);
        }
      });
    });
  } catch (error) {
    console.error("Authentication setup failed:", error);
    showStatus(error.message || "Authentication could not be initialized.", true);
  }
}

start();
