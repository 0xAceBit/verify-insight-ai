# { "Depends": "py-genlayer:^0.1.0" }

from genlayer import *
import json


@gl.contract
class Web3ProjectEvaluator:
    evaluation_count: u256
    evaluations: TreeMap[u256, DynArray[u8]]
    submitters: TreeMap[u256, Address]

    def __init__(self):
        self.evaluation_count = u256(0)
        
    @gl.public.write
    def evaluate_project(self, project_url: str, description: str, whitepaper_text: str) -> u256:
        """Evaluate a Web3 project using AI analysis with verifiable outputs."""
        
        gathered_content = ""
        
        # Fetch website content if URL provided
        if project_url and len(project_url) > 0:
            try:
                web_data = gl.nondet.web.get(project_url)
                gathered_content = web_data[:4000]  # Limit content size
            except Exception:
                gathered_content = ""
        
        # Build the analysis prompt
        analysis_context = f"""Analyze this Web3/blockchain project and provide a structured evaluation.

Project URL: {project_url if project_url else 'Not provided'}
Project Description: {description if description else 'Not provided'}
Whitepaper Text: {whitepaper_text[:2000] if whitepaper_text else 'Not provided'}
Website Content: {gathered_content[:2000] if gathered_content else 'Not available'}

Evaluate across these 5 categories, giving each a score from 0-20:

1. USE_CASE_CLARITY: How clear, novel, and viable is the project's use case?
2. TOKENOMICS: How sustainable and well-designed is the token economic model?
3. TEAM_CREDIBILITY: Based on available information, how credible is the team?
4. MARKET_RELEVANCE: How relevant is this project to current market needs?
5. RISK_SIGNALS: How free is this project from red flags? (20 = no risks, 0 = major risks)

Return ONLY valid JSON in this exact format:
{{
    "overall_score": <sum of all category scores, 0-100>,
    "categories": {{
        "use_case_clarity": {{"score": <0-20>, "assessment": "<1-2 sentence assessment>"}},
        "tokenomics": {{"score": <0-20>, "assessment": "<1-2 sentence assessment>"}},
        "team_credibility": {{"score": <0-20>, "assessment": "<1-2 sentence assessment>"}},
        "market_relevance": {{"score": <0-20>, "assessment": "<1-2 sentence assessment>"}},
        "risk_signals": {{"score": <0-20>, "assessment": "<1-2 sentence assessment>"}}
    }},
    "summary": "<3-4 sentence overall summary of the project evaluation>"
}}"""

        # Execute LLM analysis
        result = gl.nondet.exec_prompt(analysis_context)
        
        # Verify equivalence across nodes using comparative prompt
        validator_prompt = f"""You are comparing two AI evaluations of a Web3 project.
The evaluations should be considered equivalent if:
1. The overall scores are within 5 points of each other
2. Each category score is within 4 points
3. The general sentiment of assessments is aligned

Compare the following two evaluations and respond with ONLY "True" if equivalent or "False" if not.

Evaluation A:
{{leader_result}}

Evaluation B:
{{validator_result}}"""

        gl.eq_principle.prompt_comparative(result, validator_prompt)
        
        # Parse and store the result
        eval_id = self.evaluation_count
        
        # Store evaluation data as JSON bytes
        eval_record = json.dumps({
            "id": int(eval_id),
            "project_url": project_url,
            "description": description[:500],
            "result": result,
            "submitter": str(gl.message.sender_account),
            "timestamp": int(gl.block.timestamp)
        })
        
        eval_bytes = DynArray[u8](eval_record.encode('utf-8'))
        self.evaluations[eval_id] = eval_bytes
        self.submitters[eval_id] = gl.message.sender_account
        self.evaluation_count = u256(int(eval_id) + 1)
        
        return eval_id

    @gl.public.view
    def get_evaluation(self, eval_id: u256) -> str:
        """Retrieve a single evaluation by ID."""
        if eval_id in self.evaluations:
            data = self.evaluations[eval_id]
            return bytes(data).decode('utf-8')
        return ""

    @gl.public.view
    def get_all_evaluations(self) -> str:
        """Retrieve all evaluations."""
        results = []
        for i in range(int(self.evaluation_count)):
            key = u256(i)
            if key in self.evaluations:
                data = bytes(self.evaluations[key]).decode('utf-8')
                results.append(data)
        return "[" + ",".join(results) + "]"

    @gl.public.view
    def get_evaluation_count(self) -> u256:
        """Get the total number of evaluations."""
        return self.evaluation_count

    @gl.public.view
    def get_evaluations_by_submitter(self, submitter: Address) -> str:
        """Retrieve all evaluations by a specific submitter."""
        results = []
        for i in range(int(self.evaluation_count)):
            key = u256(i)
            if key in self.submitters and self.submitters[key] == submitter:
                data = bytes(self.evaluations[key]).decode('utf-8')
                results.append(data)
        return "[" + ",".join(results) + "]"
