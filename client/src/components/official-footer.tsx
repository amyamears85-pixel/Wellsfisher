export function OfficialFooter() {
  return (
    <footer className="bg-white border-t border-gray-300 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <nav className="flex flex-wrap items-center gap-y-2 text-[13px] text-[#1a5276] mb-3">
          {[
            "About Wells Fargo",
            "Online Access Agreement",
            "Privacy, Cookies, Security & Legal",
            "Do not sell or share my personal information",
            "Notice of Data Collection",
          ].map((link, i, arr) => (
            <span key={link} className="flex items-center">
              <a href="#" className="hover:underline text-[#1a5276]">{link}</a>
              {i < arr.length - 1 && <span className="mx-2 text-gray-400 select-none">|</span>}
            </span>
          ))}
        </nav>
        <nav className="flex flex-wrap items-center gap-y-2 text-[13px] text-[#1a5276] mb-4">
          {[
            "Report Email Fraud",
            "Security Center",
            "Sitemap",
            "Give Us Feedback",
          ].map((link, i, arr) => (
            <span key={link} className="flex items-center">
              <a href="#" className="hover:underline text-[#1a5276]">{link}</a>
              {i < arr.length - 1 && <span className="mx-2 text-gray-400 select-none">|</span>}
            </span>
          ))}
        </nav>
        <p className="text-[12px] text-gray-600">
          © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
        </p>
      </div>
    </footer>
  );
}

export function DesktopDisclosure() {
  return (
    <div className="w-full max-w-[660px] mx-auto px-4 pb-10">
      <div
        className="bg-white border border-gray-300 px-5 py-4 mb-4 text-[13.5px] text-[#1a1a1a]"
        style={{ lineHeight: 1.5 }}
      >
        <p className="font-bold mb-2">Investment and Insurance Products are:</p>
        <ul className="space-y-1.5">
          {[
            "Not Insured by the FDIC or Any Federal Government Agency",
            "Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate",
            "Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-[11px] shrink-0">■</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[13px] text-[#1a1a1a] px-1">
        Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
      </p>
    </div>
  );
}
