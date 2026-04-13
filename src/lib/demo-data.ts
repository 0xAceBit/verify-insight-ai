import type { EvaluationRecord } from "./contracts/Web3Evaluator";

export const DEMO_EVALUATIONS: EvaluationRecord[] = [
  {
    id: 1,
    project_url: "https://uniswap.org",
    description: "Decentralized trading protocol for automated liquidity provision on Ethereum",
    result: "",
    submitter: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD1e",
    timestamp: Date.now() - 86400000,
    parsed: {
      overall_score: 82,
      categories: {
        use_case_clarity: { score: 18, assessment: "Clear value proposition as a decentralized exchange with automated market making. Well-defined use case with strong product-market fit." },
        tokenomics: { score: 15, assessment: "UNI token has governance utility but limited fee accrual mechanisms. Inflationary schedule is a concern." },
        team_credibility: { score: 17, assessment: "Founded by Hayden Adams, backed by a16z and Paradigm. Strong track record with multiple successful protocol upgrades." },
        market_relevance: { score: 16, assessment: "Dominant DEX by volume. Faces growing competition from aggregators and intent-based protocols." },
        risk_signals: { score: 16, assessment: "Regulatory risk around token classification. Smart contract risk mitigated by extensive audits and battle-testing." },
      },
      summary: "Uniswap is a well-established DeFi protocol with strong fundamentals. Its automated market maker model has proven product-market fit, though tokenomics could be strengthened with fee-sharing mechanisms.",
    },
  },
  {
    id: 2,
    project_url: "https://aave.com",
    description: "Decentralized non-custodial liquidity protocol for earning interest and borrowing assets",
    result: "",
    submitter: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    timestamp: Date.now() - 172800000,
    parsed: {
      overall_score: 75,
      categories: {
        use_case_clarity: { score: 17, assessment: "Lending and borrowing protocol with clear utility. Flash loans are an innovative differentiator." },
        tokenomics: { score: 14, assessment: "AAVE token used for governance and safety module staking. Revenue model is sustainable but token utility is limited." },
        team_credibility: { score: 16, assessment: "Led by Stani Kulechov. Well-funded with institutional backing and a transparent development process." },
        market_relevance: { score: 14, assessment: "Top lending protocol but faces competition from Compound, Morpho, and emerging modular lending platforms." },
        risk_signals: { score: 14, assessment: "Oracle dependency and liquidation cascade risks. Multiple audits but complex protocol surface area." },
      },
      summary: "Aave is a leading DeFi lending protocol with strong fundamentals and innovative features like flash loans. Competition is intensifying from modular lending approaches.",
    },
  },
  {
    id: 3,
    project_url: "",
    description: "A new AI-powered NFT marketplace that uses machine learning to price digital art",
    result: "",
    submitter: "0x1234567890abcdef1234567890abcdef12345678",
    timestamp: Date.now() - 259200000,
    parsed: {
      overall_score: 38,
      categories: {
        use_case_clarity: { score: 8, assessment: "Vague value proposition. AI pricing for NFTs lacks clear demand signal and differentiation from existing marketplaces." },
        tokenomics: { score: 6, assessment: "No clear token utility beyond speculation. Inflationary supply with no burn mechanism or revenue sharing." },
        team_credibility: { score: 9, assessment: "Anonymous team with no verifiable track record. Limited public presence and no notable advisors." },
        market_relevance: { score: 8, assessment: "NFT market has contracted significantly. Entering a declining market with an undifferentiated product." },
        risk_signals: { score: 7, assessment: "High risk due to anonymous team, unclear roadmap, and saturated market. No audit or security documentation." },
      },
      summary: "This project presents significant risks with an unclear value proposition in a declining market. The anonymous team and lack of tokenomics substance are major red flags.",
    },
  },
];
