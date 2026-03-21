export function OfficialFooter() {
  const row1 = ["About Wells Fargo", "Online Access Agreement", "Privacy, Cookies, Security & Legal", "Do not sell or share my personal information", "Notice of Data Collection"];
  const row2 = ["Report Email Fraud", "Security Center", "Sitemap", "Give Us Feedback"];

  return (
    <footer style={{ backgroundColor: "#f2f2ee", borderTop: "1px solid #ddd", marginTop: "auto", padding: "18px 0 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 0", marginBottom: 8 }}>
          {row1.map((link, i) => (
            <span key={link} style={{ display: "flex", alignItems: "center" }}>
              <a href="#" style={{ fontSize: 13, color: "#333", textDecoration: "none", padding: "2px 0" }}
                onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
              >{link}</a>
              {i < row1.length - 1 && <span style={{ margin: "0 8px", color: "#aaa", fontSize: 13 }}>|</span>}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 0", marginBottom: 14 }}>
          {row2.map((link, i) => (
            <span key={link} style={{ display: "flex", alignItems: "center" }}>
              <a href="#" style={{ fontSize: 13, color: "#333", textDecoration: "none", padding: "2px 0" }}
                onMouseOver={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseOut={e => (e.currentTarget.style.textDecoration = "none")}
              >{link}</a>
              {i < row2.length - 1 && <span style={{ margin: "0 8px", color: "#aaa", fontSize: 13 }}>|</span>}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#555" }}>© 1999 - 2026 Wells Fargo. All rights reserved. NMLSR ID 399801</p>
      </div>
    </footer>
  );
}

export function DesktopDisclosure() {
  return (
    <div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 0 32px" }}>
      <div style={{ backgroundColor: "#fff", border: "1px solid #ccc", padding: "16px 20px", marginBottom: 16, fontSize: 13.5, lineHeight: 1.55 }}>
        <p style={{ fontWeight: 700, marginBottom: 10 }}>Investment and Insurance Products are:</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Not Insured by the FDIC or Any Federal Government Agency",
            "Not a Deposit or Other Obligation of, or Guaranteed by, the Bank or Any Bank Affiliate",
            "Subject to Investment Risks, Including Possible Loss of the Principal Amount Invested",
          ].map(item => (
            <li key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 11, marginTop: 2, flexShrink: 0 }}>■</span>
              <strong>{item}</strong>
            </li>
          ))}
        </ul>
      </div>
      <p style={{ fontSize: 13, color: "#222" }}>Deposit products offered by Wells Fargo Bank, N.A. Member FDIC.</p>
    </div>
  );
}
