"use client"

export default function BrutalistHomePage() {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#FFFFFF",
      color: "#000000",
      fontFamily: "Times New Roman, Georgia, serif",
      margin: 0,
      padding: 0,
    }}>
      {/* HERO SECTION */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        borderBottom: "4px solid #000000",
        position: "relative",
      }}>
        {/* Warning Banner */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#000000",
          color: "#FFFFFF",
          padding: "12px",
          textAlign: "center",
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "14px",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>
          0% PLATFORM FEES. 100% GOES TO CREATORS.
        </div>

        {/* TIPZ with ZEC logo as Z */}
        <h1 style={{
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "clamp(80px, 20vw, 200px)",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          lineHeight: 0.85,
          margin: 0,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          TIP<img
            src="/zec/brandmark-black.svg"
            alt="Z"
            style={{
              height: "0.75em",
              width: "auto",
              verticalAlign: "baseline",
              marginLeft: "-0.05em",
            }}
          />
        </h1>

        <div style={{
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "clamp(24px, 5vw, 48px)",
          fontWeight: 900,
          textTransform: "uppercase",
          marginTop: "20px",
          backgroundColor: "#FFFF00",
          padding: "10px 30px",
          border: "4px solid #000000",
        }}>
          PRIVATE TIPS. KEEP 100%.
        </div>

        <p style={{
          fontSize: "clamp(18px, 3vw, 28px)",
          maxWidth: "800px",
          textAlign: "center",
          marginTop: "40px",
          lineHeight: 1.4,
        }}>
          PayPal takes 2.9% + $0.30 per tip. Patreon takes 8-12%. Ko-fi takes 5%.
          <strong style={{ backgroundColor: "#000000", color: "#FFFFFF", padding: "2px 10px" }}>
            TIPZ takes 0%.
          </strong>
          <br/><br/>
          Receive tips privately. Keep everything you earn. Just you and your supporters.
        </p>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "40px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <button style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "20px",
            fontWeight: 900,
            textTransform: "uppercase",
            backgroundColor: "#000000",
            color: "#FFFFFF",
            border: "4px solid #000000",
            padding: "20px 40px",
            cursor: "pointer",
          }}>
            I'M A CREATOR
          </button>
          <button style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "20px",
            fontWeight: 900,
            textTransform: "uppercase",
            backgroundColor: "#FFFFFF",
            color: "#000000",
            border: "4px solid #000000",
            padding: "20px 40px",
            cursor: "pointer",
          }}>
            I WANT TO TIP
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "24px",
          animation: "bounce 1s infinite",
        }}>
          ↓ SEE HOW IT WORKS ↓
        </div>
      </section>

      {/* DEMO VIDEO PLACEHOLDER */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "#F5F5F5",
        borderBottom: "4px solid #000000",
      }}>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          border: "4px solid #000000",
          backgroundColor: "#FFFFFF",
          aspectRatio: "16/9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}>
          <div style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "clamp(24px, 5vw, 48px)",
            textAlign: "center",
            marginBottom: "20px",
          }}>
            ▶ WATCH A TIP HAPPEN
          </div>
          <div style={{
            fontSize: "18px",
            color: "#666666",
          }}>
            See the extension in action (15 sec)
          </div>
        </div>
      </section>

      {/* 3 STEPS - SIMPLE */}
      <section style={{
        padding: "60px 20px",
        borderBottom: "4px solid #000000",
      }}>
        <h2 style={{
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "clamp(40px, 10vw, 80px)",
          fontWeight: 900,
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: "40px",
        }}>
          3 STEPS. THAT'S IT.
        </h2>

        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "0",
        }}>
          {[
            { num: "1", title: "PASTE YOUR ADDRESS", desc: "Add your Zcash shielded address. Takes 2 minutes.", color: "#FFFF00" },
            { num: "2", title: "SHARE YOUR LINK", desc: "Get your tipz.link/yourname. Put it anywhere.", color: "#FFFFFF" },
            { num: "3", title: "RECEIVE TIPS", desc: "Fans tip in any token. You receive privately.", color: "#0000FF", textColor: "#FFFFFF" },
          ].map((step, i) => (
            <div key={i} style={{
              border: "4px solid #000000",
              borderLeft: i > 0 ? "none" : "4px solid #000000",
              padding: "40px 30px",
              textAlign: "center",
              backgroundColor: step.color,
              color: step.textColor || "#000000",
            }}>
              <div style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "72px",
                lineHeight: 1,
                marginBottom: "15px",
              }}>
                {step.num}
              </div>
              <h3 style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "24px",
                marginBottom: "15px",
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: "18px", lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR TIPPERS */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "#000000",
        color: "#FFFFFF",
        borderBottom: "4px solid #FFFF00",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "clamp(40px, 10vw, 80px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "40px",
          }}>
            FOR FANS WHO VALUE PRIVACY
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0",
          }}>
            {[
              { num: "01", title: "PAY IN ANY TOKEN", desc: "ETH. SOL. USDC. NEAR. Whatever's in your wallet. Automatic swap to ZEC. No exchanges. No extra steps." },
              { num: "02", title: "ONE CLICK. DONE.", desc: "See content you love? Click. Amount. Confirm. 100% goes to the creator. No platform middlemen taking a cut." },
              { num: "03", title: "PRIVATE BY DEFAULT", desc: "Your support stays between you and the creator. No public transaction history. No stalkers. No drama." },
            ].map((item, i) => (
              <div key={i} style={{
                border: "3px solid #FFFFFF",
                padding: "30px",
                borderRight: i < 2 ? "none" : "3px solid #FFFFFF",
              }}>
                <div style={{
                  fontFamily: "Arial Black, Impact, sans-serif",
                  fontSize: "64px",
                  color: "#FFFF00",
                  marginBottom: "10px",
                }}>
                  {item.num}
                </div>
                <h3 style={{
                  fontFamily: "Arial Black, Impact, sans-serif",
                  fontSize: "28px",
                  marginBottom: "10px",
                }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "18px", lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TIPZ */}
      <section style={{
        padding: "60px 20px",
        borderBottom: "4px solid #000000",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "clamp(32px, 8vw, 60px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "30px",
            borderBottom: "4px solid #000000",
            paddingBottom: "20px",
          }}>
            THIS IS JUST BETTER
          </h2>

          <div style={{
            fontSize: "18px",
            lineHeight: 1.8,
            columnCount: 2,
            columnGap: "40px",
            columnRule: "3px solid #000000",
          }}>
            <p style={{ marginBottom: "20px" }}>
              <span style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "72px",
                float: "left",
                lineHeight: 0.8,
                marginRight: "10px",
                marginTop: "5px",
              }}>Y</span>
ou pour your heart into content. You build an audience. You deserve to earn from it—all of it.
            </p>
            <p style={{ marginBottom: "20px" }}>
              <strong>Current platforms take a cut:</strong> Patreon: 8-12%. Ko-fi: 5%. YouTube Super Chat: 30%. PayPal: 2.9% + $0.30. Every dollar your fans send, someone takes a piece.
            </p>
            <p style={{ marginBottom: "20px" }}>
              <strong>TIPZ takes 0%.</strong> No platform fees. Just network costs under $0.01. Built on Zcash—trusted privacy technology. Your earnings stay private. Your supporters stay private.
            </p>
            <p style={{ marginBottom: "20px" }}>
              <span style={{ backgroundColor: "#FFFF00", padding: "2px 6px" }}>
                This is what tipping should be:
              </span> Direct support from fan to creator. No middlemen. No public transaction history.
            </p>
            <p>
              TIPZ exists so creators can keep what they earn. Simple.
            </p>
          </div>
        </div>
      </section>

      {/* THE STACK */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "#FFFF00",
        borderBottom: "4px solid #000000",
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "clamp(40px, 10vw, 80px)",
            fontWeight: 900,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: "40px",
          }}>
            THE STACK. NO TRUST REQUIRED.
          </h2>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "0",
            flexWrap: "wrap",
          }}>
            {[
              { name: "ZCASH", role: "PRIVACY LAYER", desc: "zk-SNARKs encrypt sender, receiver, and amount. Auditable only if you choose." },
              { name: "NEAR INTENTS", role: "SWAP ENGINE", desc: "Any token in. ZEC out. Sub-cent fees. No centralized exchange." },
              { name: "YOUR WALLET", role: "SELF-CUSTODY", desc: "We never touch your keys. We never hold your funds. We cannot freeze your money." },
            ].map((tech, i) => (
              <div key={i} style={{
                border: "4px solid #000000",
                borderLeft: i > 0 ? "none" : "4px solid #000000",
                padding: "40px 30px",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                minWidth: "200px",
              }}>
                <div style={{
                  fontFamily: "Arial Black, Impact, sans-serif",
                  fontSize: "32px",
                  marginBottom: "10px",
                }}>
                  {tech.name}
                </div>
                <div style={{
                  backgroundColor: "#000000",
                  color: "#FFFFFF",
                  fontFamily: "Arial Black, Impact, sans-serif",
                  fontSize: "12px",
                  padding: "5px 10px",
                  marginBottom: "10px",
                  display: "inline-block",
                }}>
                  {tech.role}
                </div>
                <div style={{ fontSize: "16px" }}>
                  {tech.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS - RAW NUMBERS */}
      <section style={{
        padding: "60px 20px",
        borderBottom: "4px solid #000000",
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0",
        }}>
          {[
            { num: "<$0.01", label: "FEE PER TIP" },
            { num: "0", label: "DATA WE STORE ABOUT YOU" },
            { num: "0%", label: "PLATFORM CUT" },
            { num: "100%", label: "SELF-CUSTODY. YOUR KEYS." },
          ].map((stat, i) => (
            <div key={i} style={{
              border: "3px solid #000000",
              borderLeft: i > 0 ? "none" : "3px solid #000000",
              padding: "40px 20px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "clamp(40px, 8vw, 64px)",
                lineHeight: 1,
                marginBottom: "10px",
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "14px",
                letterSpacing: "2px",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        padding: "60px 20px",
        backgroundColor: "#0000FF",
        color: "#FFFFFF",
        borderBottom: "4px solid #FFFF00",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "clamp(40px, 10vw, 80px)",
            fontWeight: 900,
            textTransform: "uppercase",
            marginBottom: "40px",
          }}>
            QUESTIONS? ANSWERS.
          </h2>

          {[
            { q: "\"WHAT IF THE CREATOR ISN'T ON TIPZ YET?\"", a: "Send them here. Registration takes 2 minutes—just paste your Zcash address and you're set. Until they sign up, your tip stays in your wallet." },
            { q: "\"HOW PRIVATE IS IT REALLY?\"", a: "Very. Tips go to Zcash shielded addresses where sender, receiver, and amount are encrypted using zero-knowledge proofs. The blockchain verifies the transaction is valid without revealing who sent what to whom." },
            { q: "\"I ONLY HOLD ETH/USDC/SOL\"", a: "That's fine. TIPZ accepts any major token. Automatic swap to ZEC happens behind the scenes. You tip in whatever you have. The creator receives privately." },
            { q: "\"WHY ZCASH?\"", a: "It's the most battle-tested privacy technology in crypto. Shielded transactions have been live since 2016. The cryptography is peer-reviewed and trusted by privacy researchers worldwide." },
          ].map((item, i) => (
            <div key={i} style={{
              borderBottom: "3px solid #FFFFFF",
              paddingBottom: "20px",
              marginBottom: "20px",
            }}>
              <h3 style={{
                fontFamily: "Arial Black, Impact, sans-serif",
                fontSize: "24px",
                marginBottom: "10px",
              }}>
                {item.q}
              </h3>
              <p style={{ fontSize: "18px", lineHeight: 1.6 }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 20px",
        textAlign: "center",
        position: "relative",
      }}>
        <h2 style={{
          fontFamily: "Arial Black, Impact, sans-serif",
          fontSize: "clamp(48px, 12vw, 120px)",
          fontWeight: 900,
          textTransform: "uppercase",
          lineHeight: 0.9,
          marginBottom: "30px",
        }}>
          KEEP<br/>
          <span style={{ backgroundColor: "#FF0000", color: "#FFFFFF", padding: "0 20px" }}>
            100%
          </span><br/>
          OF YOUR TIPS
        </h2>

        <p style={{
          fontSize: "clamp(18px, 3vw, 24px)",
          maxWidth: "600px",
          marginBottom: "40px",
          lineHeight: 1.5,
        }}>
          No platform fees. No payment processor cuts. Just direct support from fans who believe in your work. Set up takes 2 minutes.
        </p>

        <div style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <button style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "24px",
            fontWeight: 900,
            textTransform: "uppercase",
            backgroundColor: "#000000",
            color: "#FFFFFF",
            border: "4px solid #000000",
            padding: "25px 50px",
            cursor: "pointer",
          }}>
            CREATE MY TIP PAGE
          </button>
          <button style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "24px",
            fontWeight: 900,
            textTransform: "uppercase",
            backgroundColor: "#FFFF00",
            color: "#000000",
            border: "4px solid #000000",
            padding: "25px 50px",
            cursor: "pointer",
          }}>
            SEE HOW IT WORKS
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: "#000000",
        color: "#FFFFFF",
        padding: "40px 20px",
        borderTop: "4px solid #FFFF00",
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}>
          <div style={{
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "32px",
            display: "flex",
            alignItems: "center",
          }}>
            TIP<img
              src="/zec/brandmark-white.svg"
              alt="Z"
              style={{
                height: "0.75em",
                width: "auto",
                marginLeft: "-0.05em",
              }}
            />
          </div>

          <div style={{
            display: "flex",
            gap: "30px",
            fontFamily: "Arial Black, Impact, sans-serif",
            fontSize: "14px",
          }}>
            <a href="#" style={{ color: "#FFFFFF", textDecoration: "none" }}>GITHUB</a>
            <a href="#" style={{ color: "#FFFFFF", textDecoration: "none" }}>PRIVACY</a>
            <a href="#" style={{ color: "#FFFFFF", textDecoration: "none" }}>TERMS</a>
            <a href="#" style={{ color: "#FFFFFF", textDecoration: "none" }}>DOCS</a>
          </div>

          <div style={{
            fontSize: "14px",
            color: "#888888",
          }}>
            BUILT FOR CREATORS. POWERED BY ZCASH.
          </div>
        </div>
      </footer>

      {/* Global styles for animation */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }

        button:hover {
          opacity: 0.9;
        }

        button:active {
          transform: scale(0.98);
        }

        a:hover {
          text-decoration: underline;
        }

        /* Remove smooth scrolling - keep it jarring */
        html {
          scroll-behavior: auto !important;
        }

        /* Dense text on mobile */
        @media (max-width: 768px) {
          div[style*="column-count"] {
            column-count: 1 !important;
          }
        }
      `}</style>
    </main>
  )
}
