# TIPZ Launch Flowchart

> Visual reference for all workstreams and their dependencies.
> Use this to understand the critical path and where you fit.

---

## Master Launch Flow

```mermaid
flowchart TB
    subgraph Phase0["Phase 0: Demo Ready"]
        P0A[Product Working] --> P0B[Team Onboard]
        P0B --> P0C[Assign Workstreams]
    end

    subgraph Parallel["Parallel Workstreams (Week 1+)"]
        subgraph TrackT["Track T: Technical"]
            T1[Supabase Setup] --> T2[NEAR Testnet]
            T2 --> T3[NEAR Mainnet]
            T3 --> T4[Extension Build]
            T4 --> T5[Chrome Store]
        end

        subgraph TrackA["Track A: Grants"]
            A1[Grant Research] --> A2[ZF Proposal]
            A1 --> A3[NEAR Proposal]
            A2 --> A4[Submit ZF]
            A3 --> A5[Submit NEAR]
        end

        subgraph TrackB["Track B: Wallets"]
            B0[Community Presence] --> B1[Josh Swihart DM]
            B0 --> B2[Zashi Proposal]
            B1 --> B3[Partnership Call]
            B2 --> B3
        end

        subgraph TrackD["Track D: Creators"]
            D1[Seed Creators] --> D2[Community Launch]
            D2 --> D3[KOL Outreach]
            D3 --> D4[Scale to 100+]
            D4 --> D5[Scale to 500+]
        end
    end

    subgraph Launch["Launch (Week 3-4)"]
        L1[Testnet Validated] --> L2[Mainnet Live]
        L2 --> L3[Public Launch]
        L3 --> L4[Scale]
    end

    P0C --> TrackT
    P0C --> TrackA
    P0C --> TrackD
    D2 --> B0
    T3 --> L1
    L2 --> L3
```

---

## Track T: Technical Flow (Engineer)

```mermaid
flowchart LR
    subgraph Week1["Week 1"]
        T1[Supabase] --> T2[NEAR Testnet]
        T2 --> T3{Tests Pass?}
        T3 -->|Yes| T4[NEAR Mainnet]
        T3 -->|No| T2
        T4 --> T5[Extension Build]
    end

    subgraph Week2["Week 2"]
        T5 --> T6[Chrome Store Submit]
        T6 --> T7[Monitoring Setup]
    end

    subgraph Week3["Week 3+"]
        T7 --> T8[Bug Fixes]
        T8 --> T9[Store Approval]
    end
```

### Critical Dependencies

```mermaid
flowchart TD
    A[Supabase Project] --> B[Database Migrations]
    B --> C[Health Endpoint Works]
    C --> D[NEAR Testnet Account]
    D --> E[Fund with Test NEAR]
    E --> F[Set DEMO_MODE=false]
    F --> G{Execute Test Tip}
    G -->|Success| H[NEAR Mainnet Account]
    G -->|Fail| I[Debug & Retry]
    I --> G
    H --> J[Fund with Real NEAR]
    J --> K{Execute Real Tip}
    K -->|Success| L[Ready for Extension]
    K -->|Fail| M[Debug & Retry]
    M --> K
```

---

## Track D → Track B: Community Unlocks Partnerships

```mermaid
flowchart LR
    subgraph D["Track D: Creators"]
        D1[Discord Post] --> D2[Forum Post]
        D2 --> D3[Reddit Post]
        D3 --> D4{Reception?}
    end

    subgraph B["Track B: Wallets"]
        B1[Josh DM]
        B2[Zashi Proposal]
    end

    D4 -->|Positive| B1
    D4 -->|Positive| B2
    D4 -->|Negative| D5[Address Feedback]
    D5 --> D2
```

---

## Owner Assignment

```mermaid
flowchart TB
    subgraph Founder["@founder"]
        F1[Oversight All]
        F2[Partnership Calls]
        F3[Grant Pitches]
        F4[Key DMs]
    end

    subgraph Engineer["@engineer"]
        E1[NEAR Integration]
        E2[Testnet → Mainnet]
        E3[Extension Build]
        E4[Chrome Store]
        E5[Monitoring]
    end

    subgraph Growth["@growth"]
        G1[Seed Outreach]
        G2[Forum Engagement]
        G3[KOL DMs]
        G4[Community Management]
    end

    subgraph BD["@bd"]
        B1[Wallet Proposals]
        B2[Partnership Follow-ups]
        B3[Integration Planning]
    end

    subgraph Writer["@writer"]
        W1[Grant Research]
        W2[Proposal Drafting]
        W3[Application Submission]
    end
```

---

## Timeline View

```mermaid
gantt
    title TIPZ Launch Timeline
    dateFormat  YYYY-MM-DD
    section Phase 0
    Demo Ready           :p0, 2025-01-27, 3d
    Team Onboard         :p1, after p0, 4d
    section Track T
    Supabase Setup       :t1, 2025-02-03, 1d
    NEAR Testnet         :t2, after t1, 3d
    NEAR Mainnet         :t3, after t2, 2d
    Extension Build      :t4, after t3, 1d
    Chrome Store Submit  :t5, after t4, 1d
    section Track A
    Grant Research       :a1, 2025-02-03, 4d
    ZF Proposal          :a2, after a1, 7d
    NEAR Proposal        :a3, after a1, 7d
    section Track D
    Seed Creators        :d1, 2025-02-03, 7d
    Community Launch     :d2, 2025-02-03, 3d
    KOL Outreach         :d3, after d2, 7d
    section Track B
    Build Credibility    :b0, 2025-02-03, 7d
    Wallet Outreach      :b1, after b0, 7d
```

---

## Decision Points

```mermaid
flowchart TD
    subgraph TestnetDecision["Testnet Decision"]
        T1{NEAR Testnet Works?}
        T1 -->|Yes| T2[Proceed to Mainnet]
        T1 -->|No| T3[Debug Issues]
        T3 --> T1
    end

    subgraph CommunityDecision["Community Decision"]
        C1{Forum Reception?}
        C1 -->|Positive| C2[Proceed with Wallet Outreach]
        C1 -->|Negative| C3[Address Concerns]
        C3 --> C4[Retry Community Post]
        C4 --> C1
    end

    subgraph GrantDecision["Grant Decision"]
        G1{Traction Metrics Ready?}
        G1 -->|Yes, 100+ creators| G2[Submit Grant]
        G1 -->|No| G3[Wait for Metrics]
        G3 --> G1
    end
```

---

## Extension Context

```mermaid
flowchart LR
    subgraph CreatorTools["Creator Command Center"]
        A[Auto-QR]
        B[Instant Alerts]
        C[Revenue Analytics]
    end

    subgraph Target["Target User"]
        T[CREATORS]
    end

    subgraph NotTarget["NOT For"]
        N[Tippers]
    end

    CreatorTools --> T
    CreatorTools -.- N

    subgraph TipperFlow["Tippers Use"]
        W[Web Interface]
        Q[QR Codes]
    end
```

---

## Quick Reference

| Track | Owner | Week 1 Goal | Week 4 Goal |
|-------|-------|-------------|-------------|
| T (Tech) | @engineer | Mainnet tip works | Chrome Store approved |
| A (Grants) | @writer | Research complete | 2 grants submitted |
| B (Wallets) | @bd | Community presence | 1 partnership confirmed |
| D (Creators) | @growth | 100+ registered | 500+ registered |

---

## How to Use This Document

1. **Find your track** - Look at the Owner Assignment diagram
2. **Understand dependencies** - Check the Critical Dependencies diagram
3. **Know your timeline** - Reference the Gantt chart
4. **Check decision points** - Know what gates must pass before proceeding

---

*Render these diagrams in GitHub, VS Code (with Mermaid extension), or https://mermaid.live*
