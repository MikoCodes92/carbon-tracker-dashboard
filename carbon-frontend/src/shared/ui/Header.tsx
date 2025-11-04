// src/shared/ui/Header.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* ----------------------------- Types ----------------------------- */
type NavItem = { label: string; href: string };

/* ------------------------- Basic constants ------------------------ */
const NAV_ITEMS: NavItem[] = [{ label: "Home", href: "/" }];

const STYLE_ID = "app-header-styles";

/* --------------------------- Utilities --------------------------- */
const isDialogSupported =
  typeof window !== "undefined" && "HTMLDialogElement" in window;

function injectStylesOnce() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.innerHTML = `
/* minimal, scoped header styles */
.app-header { position: sticky; top: 0; z-index: 60; backdrop-filter: blur(6px); background: rgba(255,255,255,0.95); border-bottom: 1px solid rgba(15,23,42,0.06); }
.app-header .container { max-width: 1400px; margin: 0 auto; padding: 0 16px; display:flex; align-items:center; height:64px; justify-content:space-between; gap:12px; }
.app-header .brand { display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; }
.app-header .brand .logo { font-weight:700; padding:6px 10px; border-radius:6px; background:linear-gradient(90deg,#4f46e5,#06b6d4); color:white; font-size:0.9rem; }
.app-header nav.desktop { display:none; gap:18px; align-items:center; }
.app-header .controls { display:flex; align-items:center; gap:8px; }
.app-header input[type="search"] { border:1px solid rgba(15,23,42,0.06); padding:8px 10px 8px 36px; border-radius:8px; min-width:220px; }
.app-header .search-wrapper { position:relative; display:block; }
.app-header .search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); opacity:0.6; pointer-events:none; }
.app-header button.icon { background:transparent; border:0; padding:8px; border-radius:8px; cursor:pointer; }
.app-header .select { padding:6px 10px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); }
.app-header .mobile-dialog { border:0; padding:0; }
.app-header .drawer { width:320px; max-width:100%; height:100vh; background:var(--drawer-bg,#fff); color:inherit; box-shadow: -6px 0 24px rgba(2,6,23,0.08); display:flex; flex-direction:column; }
.app-header .drawer .panel { padding:16px; overflow:auto; }
.app-header .drawer .close { margin-left:auto; }
.app-header a.nav-link { color:inherit; text-decoration:none; font-weight:500; padding: 8px 12px; border-radius: 6px; transition: all 0.2s ease; }
.app-header a.nav-link:hover { background: rgba(0, 0, 0, 0.04); }
.app-header .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.app-header .logout-btn { background: linear-gradient(135deg, #ff6b6b, #ee5a52); border: none; color: white; font-weight: 500; box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4); transition: all 0.2s ease; }
.app-header .logout-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5); background: linear-gradient(135deg, #ff5252, #e53935); color: white; }

@media (min-width: 720px) {
  .app-header nav.desktop { display:flex; }
  .app-header .mobile-toggle { display:none; }
  .app-header input[type="search"] { min-width:360px; }
}

/* respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .app-header .drawer { transition: none !important; }
}
`;
  document.head.appendChild(style);
}

/* lightweight debounce */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 250) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - setTimeout returns number in browsers
    t = window.setTimeout(() => fn(...args), wait);
  };
}

/* -------------------------- Inline SVGs -------------------------- */
const IconSearch = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
    />
  </svg>
);
const IconMenu = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      d="M4 7h16M4 12h16M4 17h16"
    />
  </svg>
);
const IconClose = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      d="M18 6L6 18M6 6l12 12"
    />
  </svg>
);
const IconLogout = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    focusable="false"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
    />
  </svg>
);

/* --------------------------- Component --------------------------- */
export function Header(): JSX.Element {
  // inject minimal styles once
  useEffect(() => injectStylesOnce(), []);

  // search: minimal internal state; debounce the "search" handler
  const [query, setQuery] = useState("");
  const onSearch = useCallback((q: string) => {
    // hook point: replace this with actual search dispatcher
    // keep this side-effect minimal (no rerenders)
    // eslint-disable-next-line no-console
    console.debug("search:", q);
  }, []);
  const debouncedSearch = useMemo(() => debounce(onSearch, 300), [onSearch]);

  // drawer: use native dialog when available
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const drawerFallbackRef = useRef<HTMLDivElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // memoize nav items to avoid recreating on each render
  const nav = useMemo(() => NAV_ITEMS, []);

  // open drawer (prefer dialog.showModal)
  const openDrawer = useCallback(() => {
    if (isDialogSupported && dialogRef.current) {
      try {
        // showModal throws if already open
        if (!dialogRef.current.open) dialogRef.current.showModal();
      } catch {
        dialogRef.current.show(); // fallback
      }
    } else {
      setDrawerOpen(true);
      // lock scroll
      document.body.style.overflow = "hidden";
    }
  }, []);

  // close drawer
  const closeDrawer = useCallback(() => {
    if (isDialogSupported && dialogRef.current) {
      try {
        if (dialogRef.current.open) dialogRef.current.close();
      } catch {
        dialogRef.current.close();
      }
    } else {
      setDrawerOpen(false);
      document.body.style.overflow = "";
    }
  }, []);

  // when native dialog closes, ensure body scroll restored
  useEffect(() => {
    if (!isDialogSupported || !dialogRef.current) return;
    const dlg = dialogRef.current;
    const onClose = () => {
      // restore scroll if needed
      document.body.style.overflow = "";
    };
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  // fallback: close on outside click for non-dialog
  useEffect(() => {
    if (isDialogSupported) return;
    const onClick = (e: MouseEvent) => {
      if (!drawerFallbackRef.current) return;
      if (!drawerFallbackRef.current.contains(e.target as Node)) {
        // click outside -> close
        setDrawerOpen(false);
        document.body.style.overflow = "";
      }
    };
    if (drawerOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [drawerOpen]);

  // keyboard accessibility: ESC to close for fallback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (!isDialogSupported && drawerOpen)
      document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // search input handler
  const handleSearchChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(evt.target.value);
      debouncedSearch(evt.target.value);
    },
    [debouncedSearch]
  );

  // logout handler
  const handleLogout = useCallback(() => {
    // Add your logout logic here
    console.log("Logging out...");
    // Example: clear auth tokens, redirect to login, etc.
    // window.location.href = '/login';
  }, []);

  return (
    <header className="app-header" role="banner" aria-label="Main header">
      <div className="container" role="navigation" aria-label="Top navigation">
        <a className="brand" href="/" title="Home">
          <span className="logo" aria-hidden>
            ECO
          </span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>CarbonTracker</span>
        </a>

        {/* desktop nav (responsive) */}
        <nav className="desktop" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.href} className="nav-link" href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>

        {/* center: search (desktop) */}
        <div className="search-wrapper" aria-hidden={false}>
          <span className="search-icon" aria-hidden>
            <IconSearch />
          </span>
          <input
            type="search"
            inputMode="search"
            placeholder="Search..."
            aria-label="Search the site"
            value={query}
            onChange={handleSearchChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // immediate search on Enter
                debouncedSearch.flush?.(); // optional if debounced has flush
                onSearch(query);
              }
            }}
            // minimal attributes for accessibility & performance
          />
        </div>

        {/* right controls */}
        <div className="controls" aria-hidden={false}>
          {/* language select (native) */}
          <label className="sr-only" htmlFor="hdr-lang">
            Language
          </label>
          <select
            id="hdr-lang"
            className="select"
            value="EN"
            onChange={() => {
              /* stub - wire to i18n */
            }}
          >
            <option value="EN">EN</option>
            <option value="ES">ES</option>
            <option value="FR">FR</option>
            <option value="DE">DE</option>
          </select>

          {/* logout button */}
          <button
            type="button"
            aria-label="Logout"
            className="logout-btn"
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconLogout size={16} />
            <span>Logout</span>
          </button>

          {/* mobile toggle */}
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls="mobile-drawer"
            aria-expanded={isDialogSupported ? undefined : drawerOpen}
            className="mobile-toggle icon"
            onClick={openDrawer}
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {/* Mobile drawer: use native <dialog> when available, but fall back to div */}
      {isDialogSupported ? (
        <dialog
          id="mobile-drawer"
          ref={dialogRef}
          className="mobile-dialog"
          aria-label="Mobile menu"
        >
          <div className="drawer" role="document" aria-modal="true">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderBottom: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <strong style={{ fontSize: 16 }}>Menu</strong>
              <button
                onClick={() => dialogRef.current?.close()}
                aria-label="Close menu"
                className="close icon"
              >
                <IconClose />
              </button>
            </div>
            <div className="panel" role="menu">
              <nav aria-label="mobile primary">
                {nav.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    role="menuitem"
                    onClick={() => dialogRef.current?.close()}
                    style={{
                      display: "block",
                      padding: "10px 0",
                      textDecoration: "none",
                    }}
                  >
                    {n.label}
                  </a>
                ))}
              </nav>

              <div style={{ marginTop: 16 }}>
                <label
                  htmlFor="mobile-search"
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "rgba(0,0,0,0.6)",
                  }}
                >
                  Search
                </label>
                <input
                  id="mobile-search"
                  type="search"
                  placeholder="Search..."
                  defaultValue={query}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                  }}
                />
              </div>

              {/* Mobile Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "10px",
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <IconLogout size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </dialog>
      ) : (
        drawerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            ref={drawerFallbackRef}
            style={{ position: "fixed", inset: 0, zIndex: 70 }}
          >
            {/* overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
              }}
              onClick={closeDrawer}
            />
            {/* panel */}
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                width: 320,
                maxWidth: "100%",
                background: "#fff",
                boxShadow: "-6px 0 24px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <strong style={{ fontSize: 16 }}>Menu</strong>
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="close icon"
                >
                  <IconClose />
                </button>
              </div>

              <div style={{ padding: 16, overflow: "auto" }}>
                <nav>
                  {nav.map((n) => (
                    <a
                      key={n.href}
                      href={n.href}
                      style={{
                        display: "block",
                        padding: "10px 0",
                        textDecoration: "none",
                      }}
                      onClick={closeDrawer}
                    >
                      {n.label}
                    </a>
                  ))}
                </nav>

                <div style={{ marginTop: 16 }}>
                  <label
                    htmlFor="mobile-search-fallback"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Search
                  </label>
                  <input
                    id="mobile-search-fallback"
                    type="search"
                    placeholder="Search..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                    }}
                  />
                </div>

                {/* Mobile Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "10px",
                    background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <IconLogout size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </header>
  );
}
