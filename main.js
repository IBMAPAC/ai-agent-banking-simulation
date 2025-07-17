let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

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
  
  const containerPadding = parseFloat(window.getComputedStyle(container).paddingLeft);

  const startX = fromEl.offsetLeft + fromEl.offsetWidth / 2 - containerPadding;
  const startY = fromEl.offsetTop + fromEl.offsetHeight / 2 - containerPadding;
  const endX = toEl.offsetLeft + toEl.offsetWidth / 2 - containerPadding;
  const endY = toEl.offsetTop + toEl.offsetHeight / 2 - containerPadding;

  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#0f62fe';
  ctx.lineWidth = 2;

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

// --- HUMAN INTERACTION & EXPLANATION FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = scenarios[branchName];
  currentScenarioSteps.splice(stepIndex, 0, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);

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
      const statusEl = document.getElementById(agentName).querySelector(".status");
      statusEl.textContent = "Active";
      statusEl.className = "status active";
      setTimeout(() => {
        statusEl.textContent = "Idle";
        statusEl.className = "status idle";
      }, 2500);
    }
  });
}

function nextStep() {
  if (isWaitingForHuman) return;

  if (stepIndex < currentScenarioSteps.length) {
    executeStep(currentScenarioSteps[stepIndex]);
    stepIndex++;
  } else {
    document.getElementById('nextStepBtn').disabled = true;
    const log = document.getElementById("scenarioLog");
    const endMessage = document.createElement('p');
    endMessage.className = 'log-end';
    endMessage.innerHTML = '🏁 End of Scenario 🏁';
    if (!log.querySelector('.log-end')) {
        log.appendChild(endMessage);
    }
    updateExplanation('<h3>Scenario Complete</h3><p>The agentic system has successfully achieved its goal. It can now be tasked with a new objective or continue monitoring for new events.</p>');
  }
}

let scenarios = {};

function runScenario(type, btnElement) {
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('btn-active'));
  if (btnElement) btnElement.classList.add('btn-active');

  stepIndex = 0;
  isWaitingForHuman = false;
  document.getElementById('humanInputContainer').innerHTML = '';
  document.getElementById('nextStepBtn').disabled = false;
  const log = document.getElementById("scenarioLog");
  log.innerHTML = "";
  clearCanvas();
  updateExplanation('<p>Select a scenario and click "Next Step" to begin. This panel will update to explain the value of each agent action.</p>');

  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });

  // --- SCENARIO DEFINITIONS WITH EXPLANATIONS ---
  scenarios = {
    marketVolatilityEvent: [
        { text: "‼️ MARKET ALERT: Risk Analyst detects indicators of a potential flash crash in the tech sector.", bubble: ["risk-analyst", "High risk in tech sector!"], agent: "risk-analyst", type: 'event', handoffTo: "strategy-planner", explanation: "<h3>Proactive Threat Detection</h3><p>An agent actively monitors multiple data streams (news, market data, social media) to detect novel patterns and potential threats autonomously.</p><ul><li><b>vs. Manual:</b> A human analyst would need hours to synthesize this data, by which time the market may have already moved.</li><li><b>vs. RPA/Chatbot:</b> A basic bot cannot interpret unstructured data or identify a 'potential' threat that isn't a simple, predefined rule violation.</li></ul>" },
        { text: "🎯 Strategy Planner assesses portfolio exposure, identifying 'at-risk' clients.", bubble: ["strategy-planner", "Identifying at-risk portfolios."], agent: "strategy-planner", explanation: "<h3>Impact Analysis & Goal Focus</h3><p>The agent doesn't just report the problem; it immediately assesses the impact relative to its goals (e.g., client retention, portfolio value) and identifies the most critical areas for action.</p><ul><li><b>vs. Manual:</b> An analyst would run a report, but the agent automates the 'so what?' analysis, directly linking the event to business impact.</li></ul>" },
        { text: "⚖️ Compliance Officer verifies that proposed defensive strategies align with client profiles and regulations.", bubble: ["compliance-officer", "Actions are compliant."], agent: "compliance-officer", handoffTo: "strategy-planner", explanation: "<h3>Built-in Guardrails</h3><p>Agentic systems can have dedicated agents that act as safeguards. The Compliance agent ensures all proposed actions are within legal and ethical boundaries *before* execution.</p><ul><li><b>vs. Manual:</b> This automates a critical but time-consuming compliance check that would normally be a bottleneck in a crisis.</li></ul>" },
        { type: 'human_approval', text: 'Strategy Planner recommends temporarily rebalancing at-risk portfolios. Please approve.', options: [{text: '✅ Approve Rebalance', branch: 'approveRebalance'}, {text: '❌ Decline & Monitor', branch: 'declineRebalance'}], explanation: "<h3>Human-in-the-Loop Collaboration</h3><p>For high-stakes decisions, the agentic system autonomously defers to human judgment. It presents a clear, data-backed recommendation with options, acting as a collaborative partner rather than a blind tool.</p><ul><li><b>vs. RPA:</b> An RPA bot would either fail at this decision point or require a developer to intervene. It cannot dynamically ask for business input.</li></ul>" }
    ],
    sophisticatedFraudAttack: [
        { text: "‼️ FRAUD ALERT: Fraud Detection agent identifies a non-standard 'transaction slicing' pattern.", bubble: ["fraud-detection", "Anomalous transaction pattern!"], agent: "fraud-detection", type: 'event', handoffTo: "risk-analyst", explanation: "<h3>Complex Pattern Recognition</h3><p>The agent isn't looking for a single large fraudulent transaction, but a distributed, complex pattern of small events that together indicate a sophisticated attack.</p><ul><li><b>vs. Rule-Based System:</b> Traditional systems would miss this, as no single transaction breaks a rule. The agent detects the malicious *relationship* between transactions.</li></ul>" },
        { text: "📊 Risk Analyst correlates alerts and quantifies the potential financial loss.", bubble: ["risk-analyst", "It's a slicing attack!"], agent: "risk-analyst", handoffTo: "strategy-planner", explanation: "<h3>Automated Investigation</h3><p>Upon receiving an alert, the Risk Analyst automatically gathers and correlates data from multiple sources to build a complete picture of the attack and its potential financial impact.</p><ul><li><b>vs. Manual:</b> This compresses a multi-hour forensic investigation by a security team into a matter of seconds.</li></ul>" },
        { text: "COLLABORATIVE ACTION: Fraud Detection blocks IPs while the Compliance Officer freezes accounts.", agent: ['fraud-detection', 'compliance-officer'], bubble: ["fraud-detection", "IP blocked. Accounts frozen."], explanation: "<h3>Parallel Task Execution</h3><p>The agents work in parallel to execute multiple defensive actions simultaneously. This coordinated, multi-pronged response is far faster and more effective than a sequential process.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the hand-off delays between Security, IT, and Compliance departments, enabling an instant, unified response.</li></ul>" },
        { text: "🔁 Model Tuner analyzes the attack signature to update the fraud detection models.", bubble: ["model-tuner", "Learning from this attack..."], agent: "model-tuner", type: 'learning', explanation: "<h3>Continuous Learning & Adaptation</h3><p>The system doesn't just stop the current threat; it learns from it. The Model Tuner automatically updates the underlying detection models to recognize this new attack vector in the future, making the entire system more robust.</p><ul><li><b>vs. All Others:</b> This adaptive learning loop is a core differentiator. Traditional systems must be manually updated by developers after an attack is analyzed.</li></ul>" }
    ],
    greenFundLaunch: [
        { text: "PROACTIVE GOAL: Strategy Planner identifies a market opportunity for a new 'Green ESG Investment Fund'.", bubble: ["strategy-planner", "Let's launch an ESG fund."], agent: "strategy-planner", type: 'optimized', handoffTo: "risk-analyst", explanation: "<h3>Proactive & Goal-Oriented</h3><p>The system is not waiting for a problem to solve. It is proactively analyzing market data to identify new business opportunities and setting its own goals to capture them.</p><ul><li><b>vs. Virtual Assistant:</b> You don't have to ask the agent to find opportunities; it finds them for you based on high-level business objectives.</li></ul>" },
        { text: "🗣️ Client Outreach agent identifies a target segment of clients and prepares a launch campaign.", bubble: ["client-outreach", "Targeted campaign ready."], agent: "client-outreach", explanation: "<h3>Automated Strategy & Execution</h3><p>The agent moves from high-level strategy (launching a fund) to tactical execution (identifying specific clients for a marketing campaign). It understands the entire value chain of the task.</p><ul><li><b>vs. Manual:</b> This automates the work of both a marketing strategist and a data analyst, who would typically need days to develop a target list and campaign.</li></ul>" },
        { text: "EXECUTION: The fund is launched! The agents monitor initial investment flows.", agent: 'strategy-planner', bubble: ["strategy-planner", "The fund is live!"], explanation: "<h3>Real-Time Monitoring</h3><p>Once the plan is in motion, the agents continue to monitor its performance against the initial goals in real-time, watching for deviations or unexpected outcomes.</p><ul><li><b>vs. Manual:</b> This replaces periodic, manual report-checking with constant, autonomous oversight.</li></ul>" }
    ],
    // Branches for human choice
    approveRebalance: [
      { text: "HUMAN INPUT: ✅ Rebalance approved. Executing defensive trades across 72 accounts.", bubble: ["strategy-planner", "Executing defensive trades."], agent: "strategy-planner", type: 'optimized', explanation: "<h3>Action from Approval</h3><p>Once human approval is granted, the agentic system proceeds with the complex execution of the approved strategy, coordinating across multiple accounts and systems automatically.</p>" }
    ],
    declineRebalance: [
      { text: "HUMAN INPUT: ❌ Rebalance declined. Sending a 'Market Volatility Update' to clients instead.", bubble: ["client-outreach", "Sending market update..."], agent: "client-outreach", explanation: "<h3>Dynamic Goal Adjustment</h3><p>When its primary recommendation is rejected, the system doesn't simply stop. It understands the underlying intent (protect clients) and pivots to a secondary, less invasive action to still work towards that goal.</p>" }
    ]
  };

  currentScenarioSteps = scenarios[type];

  const buttonContainer = document.querySelector('.header-container div');
  buttonContainer.innerHTML = '';
  Object.keys(scenarios).forEach(key => {
    if (!key.startsWith('approve') && !key.startsWith('decline')) {
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        
        let emoji = '⚙️';
        if (key === 'marketVolatilityEvent') emoji = '📉';
        if (key === 'sophisticatedFraudAttack') emoji = '💥';
        if (key === 'greenFundLaunch') emoji = '🌿';
        let name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

        btn.innerHTML = `${emoji} ${name}`;
        btn.onclick = () => runScenario(key, btn);
        buttonContainer.appendChild(btn);
    }
  });

  const newActiveBtn = Array.from(buttonContainer.children).find(btn => btn.textContent.includes(type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())));
  if(newActiveBtn) newActiveBtn.classList.add('btn-active');
  
  log.innerHTML = `<p>[ Scenario loaded: <b>${type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</b>. Click 'Next Step' to begin. ]</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
    runScenario('marketVolatilityEvent', null);
    const firstButton = document.querySelector('.scenario-btn');
    if (firstButton) {
        firstButton.classList.add('btn-active');
    }
});