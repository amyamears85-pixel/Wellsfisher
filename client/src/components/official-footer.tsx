export function OfficialFooter() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="border-l-4 border-[#cd1409] pl-4 bg-gray-50 p-4">
            <p className="font-bold text-gray-900 mb-3">Investment and Insurance Products are:</p>
            <ul className="space-y-2 ml-1">
              <li className="flex items-start gap-2">
                <span className="text-[#cd1409] font-bold mt-0.5">■</span>
                <span><strong>Not Insured by the FDIC or Any Federal Government Agency</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#cd1409] font-bold mt-0.5">■</span>
                <span><strong>Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#cd1409] font-bold mt-0.5">■</span>
                <span><strong>Subject to Investment Risks, Including Possible <span className="bg-[#ffcd41]/50">Loss of the Principal Amount Invested</span></strong></span>
              </li>
            </ul>
          </div>

          <p className="text-gray-700">
            Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.
          </p>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4 py-4 border-t border-b border-gray-200">
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              About Wells Fargo
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Report Email Fraud
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Online Access Agreement
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Security Center
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Privacy, Cookies, Security & Legal
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Sitemap
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Do not sell or share my personal information
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Give Us Feedback
            </a>
            <a href="#" className="text-gray-700 hover:text-[#cd1409] hover:underline">
              Notice of Data Collection
            </a>
          </div>

          <p className="text-gray-500 text-center pt-2">
            © 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801
          </p>
        </div>
      </div>
    </footer>
  );
}