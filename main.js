// --- STATE MANAGEMENT ---
let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

// --- DEMO CONFIGURATION ---
// To change the demo industry, modify the content of this object.
const config = {
    title: "FinSecure AI Banking Simulation",
    subtitle: "Choose a scenario to simulate agentic AI behavior in banking:",
    // Define the 6 industry-specific agents
    agents: [
        { id: 'agent1', key: 'risk-analyst', name: '📊 Risk Analyst', desc: 'Monitors market data to identify and flag potential financial risks and anomalies.' },
        { id: 'agent2', key: 'fraud-detection', name: '🛡️ Fraud Detection', desc: 'Analyzes transaction patterns in real-time to detect and prevent fraudulent activities.' },
        { id: 'agent3', key: 'strategy-planner', name: '🎯 Strategy Planner', desc: 'Formulates strategic responses, assesses business impact, and identifies new opportunities.' },
        { id: 'agent4', key: 'compliance-officer', name: '⚖️ Compliance Officer', desc: 'Ensures all proposed actions adhere to legal regulations and internal policies.' },
        { id: 'agent5', key: 'client-outreach', name: '🗣️ Client Outreach', desc: 'Manages and executes communication with clients, from marketing to critical alerts.' },
        { id: 'agent6', key: 'model-tuner', name: '🔁 Model Tuner', desc: 'Continuously learns from new data and events to automatically improve AI models.' }
    ],
    // Define the scenarios for this industry
    scenarios: {
        marketVolatilityEvent: {
            name: "📉 Market Volatility Event",
            steps: [
                { text: "‼️ MARKET ALERT: Risk Analyst detects indicators of a potential flash crash in the tech sector.", bubble: ["risk-analyst", "High risk in tech sector!"], agent: "risk-analyst", type: 'event', handoffTo: "strategy-planner",
                  explanation: "<h3>Proactive Threat Detection</h3><p>An agent actively monitors multiple data streams to detect novel patterns and potential threats autonomously.</p><ul><li><b>vs. Manual:</b> A human analyst would need hours to synthesize this data.</li><li><b>vs. RPA/Chatbot:</b> A basic bot cannot interpret unstructured data or identify a 'potential' threat.</li></ul>",
                  challenge: "<h3>Observability & Unpredictability</h3><p>How do you know the agent isn't hallucinating a market trend? Its non-deterministic nature makes its reasoning hard to trace. A false positive could trigger a costly, unnecessary response.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Instana</strong> for full-stack observability, allowing you to trace the agent's 'thought process' and the data it accessed.</li><li>Implement a workflow in <strong>watsonx.governance</strong> to require a confidence score for all alerts and mandate secondary agent validation for high-impact findings.</li></ul>"
                },
                { text: "🎯 Strategy Planner assesses portfolio exposure, identifying 'at-risk' clients.", bubble: ["strategy-planner", "Identifying at-risk portfolios."], agent: "strategy-planner",
                  explanation: "<h3>Impact Analysis & Goal Focus</h3><p>The agent immediately assesses the impact relative to its goals and identifies the most critical areas for action.</p><ul><li><b>vs. Manual:</b> An analyst would run a report, but the agent automates the 'so what?' analysis.</li></ul>",
                  challenge: "<h3>Data Integration & Security</h3><p>The agent needs real-time, secure access to sensitive client portfolio data across multiple legacy and modern systems. A data breach or incorrect data connection would be catastrophic.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>webMethods Hybrid Integration</strong> to create robust APIs that connect the AI platform to core legacy mainframes and modern cloud applications.</li><li>Securely manage the credentials for these connections using <strong>Hashicorp Vault</strong>, which provides the agent with dynamic, audited access to secrets.</li><li>Leverage <strong>watsonx.data</strong> as the single, governed access point through which the agent queries this unified data.</li></ul>"
                },
                { text: "⚖️ Compliance Officer verifies that proposed defensive strategies align with client profiles and regulations.", bubble: ["compliance-officer", "Actions are compliant."], agent: "compliance-officer", handoffTo: "strategy-planner",
                  explanation: "<h3>Built-in Guardrails</h3><p>The Compliance agent ensures all proposed actions are within legal and ethical boundaries *before* execution.</p><ul><li><b>vs. Manual:</b> This automates a critical but time-consuming compliance check that would normally be a bottleneck.</li></ul>",
                  challenge: "<h3>Governance & Evolving Regulations</h3><p>The agent's knowledge of compliance rules must be constantly updated. A failure to adapt to a new regulation could lead to massive fines. Who is responsible for keeping the agent's knowledge base current?</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.governance</strong> to manage the agent's knowledge base as an auditable, version-controlled asset.</li><li>Connect the agent via a Retrieval-Augmented Generation (RAG) pattern to a curated document store of regulations within <strong>watsonx.data</strong>, ensuring it's always referencing the latest, single source of truth.</li></ul>"
                },
                { type: 'human_approval', text: 'Strategy Planner recommends temporarily rebalancing at-risk portfolios. Please approve.', options: [{text: '✅ Approve Rebalance', branch: 'approveRebalance'}, {text: '❌ Decline & Monitor', branch: 'declineRebalance'}],
                  explanation: "<h3>Human-in-the-Loop Collaboration</h3><p>For high-stakes decisions, the agentic system defers to human judgment, presenting a clear, data-backed recommendation with options.</p><ul><li><b>vs. RPA:</b> An RPA bot would fail at this decision point. It cannot dynamically ask for business input.</li></ul>",
                  challenge: "<h3>Trust & Explainability</h3><p>For a human to approve this, the agent's recommendation must be fully explainable. Why these specific bonds? What was the exact reasoning? A black-box recommendation would rightly be rejected.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to manage the human-in-the-loop workflow, presenting the findings and options to the correct human expert for a decision.</li><li>Leverage <strong>watsonx.governance</strong> to automatically generate the 'chain-of-thought' audit log for the recommendation, ensuring full, transparent explainability.</li></ul>"
                }
            ]
        },
        sophisticatedFraudAttack: {
            name: "💥 Sophisticated Fraud Attack",
            steps: [
                { text: "‼️ FRAUD ALERT: Fraud Detection agent identifies a non-standard 'transaction slicing' pattern.", bubble: ["fraud-detection", "Anomalous transaction pattern!"], agent: "fraud-detection", type: 'event', handoffTo: "strategy-planner",
                  explanation: "<h3>Complex Pattern Recognition</h3><p>The agent detects a malicious *relationship* between many small transactions that are individually legitimate.</p><ul><li><b>vs. Rule-Based System:</b> Traditional systems would miss this, as no single transaction breaks a specific rule.</li></ul>",
                  challenge: "<h3>Quality & Performance</h3><p>The model must be incredibly accurate and fast, which requires processing massive volumes of real-time transaction data.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Datastax</strong>, built on Apache Cassandra, as the high-performance, massively scalable data store for ingesting and analyzing millions of transactions per second.</li><li>Use <strong>watsonx.governance</strong> to continuously evaluate the model's accuracy, drift, and fairness against a 'golden dataset' of known fraud cases.</li></ul>"
                },
                { text: "COLLABORATIVE ACTION: Fraud Detection blocks IPs while the Compliance Officer freezes accounts.", agent: ['fraud-detection', 'compliance-officer'], bubble: ["fraud-detection", "IP blocked. Accounts frozen."],
                  explanation: "<h3>Parallel Task Execution</h3><p>The agents work in parallel to execute multiple defensive actions simultaneously. This coordinated response is far faster and more effective than a sequential process.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the hand-off delays between Security, IT, and Compliance departments.</li></ul>",
                  challenge: "<h3>Workflow Entanglement</h3><p>How do you ensure the agent's 'freeze account' command integrates flawlessly and securely with the bank's decades-old core banking system without causing unintended side effects?</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to define the high-level business workflow (e.g., 'initiate fraud lockdown').</li><li>Leverage <strong>webMethods Hybrid Integration</strong> to handle the low-level technical integration, connecting the Orchestrate workflow to the specific APIs of the legacy mainframe.</li><li>Secure the API keys and credentials for this sensitive connection using <strong>Hashicorp Vault</strong>.</li></ul>"
                },
                { text: "🔁 Model Tuner analyzes the attack signature to update the fraud detection models.", bubble: ["model-tuner", "Learning from this attack..."], agent: "model-tuner", type: 'learning',
                  explanation: "<h3>Continuous Learning & Adaptation</h3><p>The system doesn't just stop the current threat; it learns from it. It automatically updates the detection models to recognize this new attack vector in the future.</p><ul><li><b>vs. All Others:</b> This adaptive learning loop is a core differentiator.</li></ul>",
                  challenge: "<h3>Operational Skills & Stability (AgentOps)</h3><p>This requires a specialized 'AgentOps' team. Who validates that the agent's self-improvement doesn't introduce a new bug or vulnerability? An incorrect update could weaken defenses more than it helps.</p><p><strong>Potential Solutions:</strong></p><ul><li>Implement an <strong>AgentOps</strong> framework where any self-generated model update is treated as a new deployment, automatically triggering a 'Test' phase in a sandboxed environment.</li><li>Use <strong>watsonx.governance</strong> to automatically run a suite of regression tests and performance evaluations. The update is only promoted to production after passing these tests and receiving human sign-off.</li></ul>"
                }
            ]
        },
        greenFundLaunch: {
            name: "🌱 Green Fund Launch",
            steps: [
                 { text: "PROACTIVE GOAL: Strategy Planner identifies a market opportunity for a new 'Green ESG Investment Fund'.", bubble: ["strategy-planner", "Let's launch an ESG fund."], agent: "strategy-planner", type: 'optimized', handoffTo: "client-outreach",
                  explanation: "<h3>Proactive & Goal-Oriented</h3><p>The system is not waiting for a problem to solve. It is proactively analyzing market data to identify new business opportunities and setting its own goals to capture them.</p><ul><li><b>vs. Virtual Assistant:</b> You don't have to ask the agent to find opportunities; it finds them for you based on high-level business objectives.</li></ul>",
                  challenge: "<h3>Value Alignment</h3><p>Is a 'Green Fund' the most valuable opportunity right now? The agent's proactive goals must align with broader, often unstated, business priorities. It might pursue a goal that is not the best use of resources at that moment.</p><p><strong>Potential Solutions:</strong></p><ul><li>Provide agents with a clear, ranked list of strategic business objectives that are managed and monitored within <strong>watsonx.governance</strong>.</li><li>Require human validation via an intelligent workflow in <strong>watsonx Orchestrate</strong> for any agent-initiated project that will consume significant financial or computational resources.</li></ul>"
                },
                { text: "🗣️ Client Outreach agent identifies a target segment of clients and prepares a launch campaign.", bubble: ["client-outreach", "Targeted campaign ready."], agent: "client-outreach",
                  explanation: "<h3>Automated Strategy & Execution</h3><p>The agent moves from high-level strategy (launching a fund) to tactical execution (identifying specific clients for a marketing campaign).</p><ul><li><b>vs. Manual:</b> This automates the work of both a marketing strategist and a data analyst.</li></ul>",
                  challenge: "<h3>Data Privacy & Ethics</h3><p>How does the agent determine a client's 'interest in ethical investing'? This process must be transparent and avoid making inferences based on sensitive demographic data, while also securely accessing the necessary data.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Vault</strong> to securely manage and audit the credentials the agent needs to access the governed data lakehouse.</li><li>Use <strong>watsonx.governance</strong> to continuously monitor the agent's targeting logic for fairness and to detect and mitigate potential bias.</li></ul>"
                },
                { text: "EXECUTION: The fund is launched! The agents monitor initial investment flows.", agent: 'strategy-planner', bubble: ["strategy-planner", "The fund is live!"],
                  explanation: "<h3>Real-Time Monitoring</h3><p>Once the plan is in motion, the agents continue to monitor its performance against the initial goals in real-time.</p><ul><li><b>vs. Manual:</b> This replaces periodic, manual report-checking with constant, autonomous oversight.</li></ul>",
                  challenge: "<h3>Cost Management</h3><p>Constant, real-time monitoring of multiple data streams can be computationally expensive. The underlying infrastructure must be managed efficiently to ensure profitability.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Hashicorp Terraform</strong> to define and manage the cloud infrastructure as code, enabling automated scaling and cost-optimization strategies.</li><li>Use <strong>Turbonomic</strong> and <strong>Apptio</strong> to gain a real-time, granular view of the compute and API costs of agent operations and correlate them to business value.</li></ul>"
                }
            ]
        }
    },
    // Define the branches for this industry
    branches: {
        approveRebalance: [
          { text: "HUMAN INPUT: ✅ Rebalance approved. Executing defensive trades across 72 accounts.", bubble: ["strategy-planner", "Executing defensive trades."], agent: "strategy-planner", type: 'optimized',
            explanation: "<h3>Action from Approval</h3><p>Once human approval is granted, the agentic system proceeds with the complex execution of the approved strategy automatically.</p>",
            challenge: "<h3>Cost Management & Efficiency</h3><p>Executing these trades incurs costs. The system must be optimized to perform its tasks using the minimum required computational resources, otherwise the cost of operation could exceed the value it provides.</p><p><strong>Potential Solutions:</strong></p><ul><li>Once approved, use <strong>watsonx Orchestrate</strong> to execute the complex rebalancing strategy, reliably calling the necessary APIs across dozens of systems to perform the trades.</li><li>Manage the associated operational costs and resource allocation with <strong>Turbonomic</strong> and <strong>Apptio</strong>.</li></ul>"
          }
        ],
        declineRebalance: [
          { text: "HUMAN INPUT: ❌ Rebalance declined. Sending a 'Market Volatility Update' to clients instead.", bubble: ["client-outreach", "Sending market update..."], agent: "client-outreach",
            explanation: "<h3>Dynamic Goal Adjustment</h3><p>When its primary recommendation is rejected, the system understands the underlying intent (protect clients) and pivots to a secondary, less invasive action.</p>",
            challenge: "<h3>Value Alignment</h3><p>The agent has pivoted, but is this new action truly aligned with the user's intent? Ensuring the agent correctly interprets nuanced human feedback is a major challenge in maintaining alignment.</p><p><strong>Potential Solutions:</strong></p><ul><li>When the primary plan is rejected, have <strong>watsonx.governance</strong> trigger an alternative workflow in <strong>watsonx Orchestrate</strong>.</li><li><strong>Orchestrate</strong> then executes the new task—connecting to marketing automation tools to send the 'Market Volatility Update' to the correct client segment.</li></ul>"
          }
        ]
    }
};

// --- (The rest of the JS framework remains the same) ---

// --- CANVAS & DRAWING FUNCTIONS ---
let dashOffset = 0;
let animationFrameId = null;

function clearCanvas() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const canvas = document.getElementById('arrowCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArrow(fromId, toId, offset) {
  const canvas = document.getElementById('arrowCanvas');
  const container = document.querySelector('.dashboard-container'); 
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext('2d');

  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  
  if (!fromEl || !toEl) return;

  const containerPadding = parseFloat(window.getComputedStyle(container).paddingLeft);

  const startX = fromEl.offsetLeft + fromEl.offsetWidth / 2 - containerPadding;
  const startY = fromEl.offsetTop + fromEl.offsetHeight / 2 - containerPadding;
  const endX = toEl.offsetLeft + toEl.offsetWidth / 2 - containerPadding;
  const endY = toEl.offsetTop + toEl.offsetHeight / 2 - containerPadding;

  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#0f62fe';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.setLineDash([]);
  const angle = Math.atan2(endY - startY, endX - startX);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = '#0f62fe';
  ctx.fill();
}

function startArrowAnimation(fromId, toId) {
  dashOffset = 0;
  const animate = () => {
    dashOffset += 0.5;
    clearCanvas();
    drawArrow(fromId, toId, dashOffset);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
}

function showBubble(agent, msg) {
  const icons = { 'risk-analyst': '📊 ', 'fraud-detection': '🛡️ ', 'strategy-planner': '🎯 ', 'compliance-officer': '⚖️ ', 'client-outreach': '🗣️ ', 'model-tuner': '🔁 '};
  const bubble = document.getElementById("bubble-" + agent);
  if (!bubble) return;
  bubble.textContent = '';
  bubble.className = 'bubble typing';
  setTimeout(() => {
    bubble.textContent = icons[agent] + msg;
    bubble.className = 'bubble show';
    setTimeout(() => { bubble.className = 'bubble shrink-out'; }, 2500);
  }, 800);
}

// --- UI & STATE MANAGEMENT FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function updateChallenges(htmlContent) {
    const challengesContainer = document.getElementById('challenges-text');
    challengesContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = config.branches[branchName];
  currentScenarioSteps.splice(stepIndex, 1, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);
  updateChallenges(step.challenge);

  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = `<p>${step.text}</p>`;
  
  step.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option.text;
    btn.onclick = () => handleHumanChoice(option.branch);
    humanInputContainer.appendChild(btn);
  });
}

function executeStep(step) {
  clearCanvas();
  const log = document.getElementById("scenarioLog");

  if (step.type === 'human_approval') {
    askForHumanInput(step);
    return;
  }
  
  updateExplanation(step.explanation || '<p>The agents are processing the next action...</p>');
  updateChallenges(step.challenge || '<p>No specific challenges highlighted for this step.</p>');


  const logEntry = document.createElement('div');
  logEntry.textContent = step.text;
  if (step.type === 'event') { logEntry.className = 'log-event'; }
  else if (step.type === 'learning') { logEntry.className = 'log-learning'; }
  else if (step.type === 'optimized') { logEntry.className = 'log-optimized'; }
  log.appendChild(logEntry);

  if (step.bubble) showBubble(step.bubble[0], step.bubble[1]);
  if (step.handoffTo) startArrowAnimation(step.agent, step.handoffTo);

  const agents = Array.isArray(step.agent) ? step.agent : [step.agent];
  agents.forEach(agentName => {
    if (agentName) {
      const cardEl = document.getElementById(agentName);
      if (cardEl) {
        const statusEl = cardEl.querySelector(".status");
        
        cardEl.classList.add("active");
        statusEl.textContent = "Active";
        statusEl.className = "status active";

        setTimeout(() => {
          cardEl.classList.remove("active");
          statusEl.textContent = "Idle";
          statusEl.className = "status idle";
        }, 2500);
      }
    }
  });
}

function nextStep() {
  if (isWaitingForHuman) return;

  if (stepIndex < currentScenarioSteps.length) {
    executeStep(currentScenarioSteps[stepIndex]);
    stepIndex++;
  } else {
    clearCanvas(); // Add this line to stop the animation
    document.getElementById('nextStepBtn').disabled = true;
    const log = document.getElementById("scenarioLog");
    const endMessage = document.createElement('p');
    endMessage.className = 'log-end';
    endMessage.innerHTML = '🏁 End of Scenario 🏁';
    if (!log.querySelector('.log-end')) {
        log.appendChild(endMessage);
    }
    updateExplanation('<h3>Scenario Complete</h3><p>The agentic system has successfully achieved its goal. It can now be tasked with a new objective or continue monitoring for new events.</p>');
    updateChallenges('<h3>Post-Scenario Review</h3><p>After a scenario, the full trace of agent actions, decisions, and tool usage would be reviewed by an AgentOps team to ensure performance, manage costs, and identify areas for improvement.</p>');
  }
}

function runScenario(type, btnElement) {
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('btn-active'));
  if (btnElement) btnElement.classList.add('btn-active');

  stepIndex = 0;
  isWaitingForHuman = false;
  currentScenarioSteps = config.scenarios[type].steps;

  document.getElementById('humanInputContainer').innerHTML = '';
  document.getElementById('nextStepBtn').disabled = false;
  const log = document.getElementById("scenarioLog");
  log.innerHTML = "";
  clearCanvas();
  updateExplanation('<p>Select a scenario and click "Next Step" to begin. This panel will update to explain the value of each agent action.</p>');
  updateChallenges('<p>This panel will highlight the operational challenges and risks associated with each agent action.</p>');
  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));

  const scenarioName = config.scenarios[type].name;
  log.innerHTML = `<p>[ Scenario loaded: <b>${scenarioName}</b>. Click 'Next Step' to begin. ]</p>`;
}

function setupScenarioButtons() {
    const buttonContainer = document.querySelector('.header-container div');
    if (!buttonContainer) return;
    buttonContainer.innerHTML = '';

    Object.keys(config.scenarios).forEach(key => {
        const scenario = config.scenarios[key];
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.innerHTML = scenario.name;
        btn.onclick = () => runScenario(key, btn);
        buttonContainer.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Load config into HTML
    document.title = config.title;
    document.querySelector('.header-container h1').textContent = config.title;
    document.querySelector('.header-container p').textContent = config.subtitle;

    config.agents.forEach(agent => {
        const h3 = document.getElementById(`${agent.id}-h3`);
        const desc = document.getElementById(`${agent.id}-desc`);
        const card = document.getElementById(agent.id);
        const bubble = document.getElementById(`bubble-${agent.id}`);

        if(h3 && desc && card && bubble) {
            h3.innerHTML = agent.name;
            desc.textContent = agent.desc;
            // IMPORTANT: Update the card and bubble IDs to the agent's functional key
            card.id = agent.key;
            bubble.id = `bubble-${agent.key}`;
        }
    });

    setupScenarioButtons();
    
    // Set a default scenario to run
    const firstScenarioKey = Object.keys(config.scenarios)[0];
    const firstButton = document.querySelector('.scenario-btn');
    if (firstScenarioKey && firstButton) {
        runScenario(firstScenarioKey, firstButton);
    }
});
