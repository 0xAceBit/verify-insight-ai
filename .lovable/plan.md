

## GenLayer Web3 Project Evaluator dApp

### Overview
A decentralized AI-powered Web3 project evaluator that uses GenLayer's intelligent contracts to analyze and score blockchain projects. Users submit a project URL or description, the contract uses LLM + web-fetching to evaluate it across multiple dimensions, and results are stored onchain and displayed in a polished React UI.

### Part 1: Intelligent Contract (`contracts/web3_evaluator.py`)
A Python intelligent contract that:
- **Accepts** a project URL, optional whitepaper text, and description via a `evaluate_project` write method
- **Fetches** the project website using `gl.nondet.web.get()` to gather real data
- **Calls an LLM** via `gl.nondet.exec_prompt()` with a structured evaluation prompt covering: use case clarity, tokenomics sustainability, team credibility, market relevance, and risk signals
- **Uses `gl.eq_principle.prompt_comparative()`** with a custom validator prompt to ensure deterministic scoring across nodes (scores must agree within ±5 points, category assessments must be semantically equivalent)
- **Stores results** in contract state using `TreeMap` keyed by evaluation ID — each entry holds the score (0–100), category breakdown, AI summary, submitter address, and timestamp
- **Exposes view methods**: `get_evaluation(id)`, `get_all_evaluations()`, `get_evaluations_by_submitter(address)`
- Contract will include the proper `# { "Depends": "py-genlayer:..." }` header and pass `genvm-lint check`

### Part 2: React Frontend Application
Built with the existing React/Vite/Tailwind stack + `genlayer-js` SDK:

**Pages & Components:**
- **Hero/Landing Section** — App title, brief description of what it does, connect wallet button
- **Evaluation Form** — Input fields for project URL, description (textarea), optional whitepaper text; submit button triggers `writeContract` call
- **Transaction Status** — Shows pending/consensus status using `waitForTransactionReceipt()`
- **Results Display** — Score gauge (0–100 with color coding), category breakdown cards (5 categories with individual scores and notes), AI-generated summary
- **Evaluation History** — Table/list of all past evaluations fetched via `readContract`, showing project name, score, date, and submitter; click to expand full details

**GenLayer Integration (`lib/genlayer.ts`):**
- Read client (no wallet) for fetching evaluations
- Write client (MetaMask wallet) for submitting evaluations
- Contract class wrapper with typed `readContract`/`writeContract` calls
- Environment variables for contract address and RPC endpoint

**Design:**
- Clean, modern dark theme with accent colors for score ranges (red/yellow/green)
- Responsive layout, card-based UI using existing shadcn components
- Toast notifications for transaction status updates

### Part 3: Configuration & Setup
- Contract file ready for deployment via `genlayer deploy`
- `.env.example` with `VITE_GENLAYER_RPC_URL` and `VITE_CONTRACT_ADDRESS`
- README with deployment instructions

### Key Technical Decisions
- No mock data — all contract interactions use real `genlayer-js` SDK calls
- Contract uses `prompt_comparative` equivalence for verifiable AI outputs
- Web-fetching is used when a URL is provided; falls back to description-only analysis
- All evaluation state is stored onchain via contract storage (`TreeMap`)

