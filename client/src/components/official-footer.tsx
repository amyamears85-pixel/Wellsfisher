import { WellsFargoIcon } from "@/components/wells-fargo-logo";

export function OfficialFooter() {
  return (
    <footer className="bg-[#fafafa] border-t mt-auto">
      <div className="h-1.5 bg-gradient-to-r from-[#ffcd41] via-[#ffe066] to-[#ffcd41]" />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <div className="bg-gray-50 p-4 rounded border">
            <p className="font-semibold text-gray-800 mb-2">Investment and Insurance Products are:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Not Insured by the FDIC or Any Federal Government Agency</li>
              <li>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate</li>
              <li>Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested</li>
            </ul>
          </div>

          <p>
            Investment products and services are offered through Wells Fargo Advisors. Wells Fargo Advisors is a trade name used by Wells Fargo Clearing Services, LLC (WFCS) and Wells Fargo Advisors Financial Network, LLC, Members{' '}
            <a href="https://www.sipc.org" className="text-[#cd1409] hover:underline" data-testid="link-sipc">SIPC</a>, separate registered broker-dealers and non-bank affiliates of Wells Fargo & Company.
          </p>

          <p>
            1. Availability may be affected by your mobile carrier's coverage area. Your mobile carrier's message and data rates may apply. Fargo is only available on the smartphone versions of the Wells Fargo Mobile<sup>®</sup> app.
          </p>

          <p>
            Android, Google Play, Chrome, Pixel and other marks are trademarks of Google LLC.
          </p>

          <p>
            Apple, the Apple logo, Apple Pay, Apple Watch, Face ID, iCloud Keychain, iPad, iPad Pro, iPhone, iTunes, Mac, Safari, and Touch ID are trademarks of Apple Inc., registered in the U.S. and other countries. Apple Wallet is a trademark of Apple Inc. App Store is a service mark of Apple Inc.
          </p>

          <p>
            Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
          </p>

          <div className="flex items-center gap-2 py-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span className="font-semibold text-gray-800">Equal Housing Lender</span>
          </div>

          <div className="pt-2 border-t space-y-1 text-gray-500">
            <p>PM-09282026-7798034.1.1</p>
            <p>LRC-0325</p>
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WellsFargoIcon className="w-6 h-6" />
              <span className="text-sm font-medium text-gray-700" style={{ fontFamily: "Georgia, serif" }}>WELLS FARGO</span>
            </div>
            <p className="text-gray-500">© 1999 - 2026 Wells Fargo. NMLSR ID 399801</p>
          </div>
        </div>
      </div>
    </footer>
  );
}