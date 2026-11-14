const DEFAULT_SUPABASE_URL = "https://qwtnzcitekqjrgrugtyp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_vhDVGQml3y0UvmHrtnVkGQ_tTGNL9Wl";

function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL)?.trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY)?.trim();

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_") ||
    supabaseAnonKey.includes("YOUR_")
  ) {
    return res.status(503).json({
      error: "Set SUPABASE_URL and SUPABASE_ANON_KEY in the deployment environment.",
    });
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (
      parsedUrl.protocol !== "https:" &&
      !(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost")
    ) {
      throw new Error("SUPABASE_URL must use HTTPS.");
    }
  } catch {
    return res.status(503).json({
      error: "SUPABASE_URL must be a valid Supabase project URL.",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ supabaseUrl, supabaseAnonKey });
}

module.exports = handler;
