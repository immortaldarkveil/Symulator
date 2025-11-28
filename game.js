// SINGLE SOURCE OF TRUTH: gameState object
const gameState = {
    player: {
        capital: 10000,
        isStaker: true,    // The player will always be a staker
        isOperator: false, // The player can CHOOSE to become an operator later
        operatorId: null   // If they become an operator, we'll track it here
    },
    operators: [], // A list of all operators in the game. Initially empty.
    round: 1,
    totalEarnings: 0,
    stakes: [], // Active stakes
    networks: [
        {
            id: 'ethereum',
            name: 'Ethereum Network',
            trustScore: 95, // A score from 0-100 representing trustworthiness
            apy: 0.08, // 8% annual
            lockPeriod: 2, // rounds
            description: 'The largest smart contract platform'
        },
        {
            id: 'polygon',
            name: 'Polygon POS',
            trustScore: 92,
            apy: 0.05, // 5% annual
            lockPeriod: 1, // rounds
            description: 'Fast, low-cost Ethereum sidechain'
        },
        {
            id: 'avalanche',
            name: 'Avalanche',
            trustScore: 88,
            apy: 0.12, // 12% annual
            lockPeriod: 3, // rounds
            description: 'High-performance blockchain with sub-second finality'
        },
        {
            id: 'arbitrum',
            name: 'Arbitrum One',
            trustScore: 90,
            apy: 0.07, // 7% annual
            lockPeriod: 2, // rounds
            description: 'Leading Ethereum Layer 2 solution'
        },
        {
            id: 'solana',
            name: 'Solana',
            trustScore: 85,
            apy: 0.15, // 15% annual
            lockPeriod: 4, // rounds
            description: 'Ultra-fast blockchain with massive throughput'
        },
        {
            id: 'chainlink',
            name: 'Chainlink',
            trustScore: 98,
            apy: 0.06, // 6% annual
            lockPeriod: 2, // rounds
            description: 'Decentralized oracle network'
        }
    ]
};

// LEGO BLOCK 1: DOM Element Cache (Efficiency Pattern)
const elements = {
    capital: document.getElementById('capital'),
    round: document.getElementById('round'),
    earnings: document.getElementById('earnings'),
    networksGrid: document.getElementById('networksGrid'),
    eventsLog: document.getElementById('eventsLog'),
    startRoundBtn: document.getElementById('startRound'),
    resetGameBtn: document.getElementById('resetGame'),
    becomeOperatorBtn: document.getElementById('becomeOperatorBtn'),
    stakeModal: document.getElementById('stakeModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    closeBtn: document.querySelector('.close'),
    // Operator Dashboard Elements
    operatorDashboard: document.getElementById('operatorDashboard'),
    opName: document.getElementById('opName'),
    opTrustScore: document.getElementById('opTrustScore'),
    opTasks: document.getElementById('opTasks'),
    opLiveness: document.getElementById('opLiveness'),
};

// LEGO BLOCK 2: UI Renderer (Single Responsibility)
function updateUI() {
    // Single Source of Truth: All UI comes from gameState
    elements.capital.textContent = `$${gameState.player.capital.toLocaleString()}`;
    elements.round.textContent = gameState.round;
    elements.earnings.textContent = `$${gameState.totalEarnings.toLocaleString()}`;
}

// NEW LEGO BLOCK: Operator Dashboard UI Renderer
function updateOperatorDashboard() {
    if (!gameState.player.isOperator) return;

    const operatorProfile = gameState.operators.find(op => op.id === gameState.player.operatorId);
    if (!operatorProfile) return;

    elements.opName.textContent = operatorProfile.name;
    elements.opTrustScore.textContent = operatorProfile.trustScore;
    elements.opTasks.textContent = operatorProfile.tasksCompleted;
    elements.opLiveness.textContent = operatorProfile.liveness;
}

// Helper function to convert trust score to risk category for styling
function getRiskCategory(trustScore) {
    if (trustScore >= 95) return 'low';
    if (trustScore >= 90) return 'medium';
    return 'high';
}

// LEGO BLOCK 3: Network Card Factory (Pattern Reuse)
function renderNetworks() {
    // Single innerHTML call = More efficient than multiple DOM operations
    elements.networksGrid.innerHTML = gameState.networks.map(network => {
        const riskCategory = getRiskCategory(network.trustScore);
        return `
        <div class="network-card" onclick="openStakeModal('${network.id}')">
            <div class="network-name">${network.name}</div>
            <div>Trust Score: <span class="risk-${riskCategory}">${network.trustScore}</span></div>
            <div>APY: ${(network.apy * 100).toFixed(1)}%</div>
            <div>Lock Period: ${network.lockPeriod} rounds</div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">${network.description}</div>
        </div>
    `}).join('');
}

// LEGO BLOCK 4: Event Logger (Data Flow End Point)
function addEvent(message) {
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event';
    eventDiv.textContent = `[Round ${gameState.round}] ${message}`;
    // Prepend = Latest events first (better UX)
    elements.eventsLog.insertBefore(eventDiv, elements.eventsLog.firstChild);

    // Keep only last 10 events = Memory efficiency
    while (elements.eventsLog.children.length > 10) {
        elements.eventsLog.removeChild(elements.eventsLog.lastChild);
    }
}

// LEGO BLOCK 5: Modal System (Interaction Handler)
function openStakeModal(networkId) {
    const network = gameState.networks.find(n => n.id === networkId);
    const existingStake = gameState.stakes.find(s => s.networkId === networkId);
    const riskCategory = getRiskCategory(network.trustScore);

    elements.modalTitle.textContent = `Stake in ${network.name}`;
    elements.modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">${network.description}</div>
        <div style="margin-bottom: 15px;">
            <div>APY: ${(network.apy * 100).toFixed(1)}%</div>
            <div>Trust Score: <span class="risk-${riskCategory}">${network.trustScore}</span></div>
            <div>Lock Period: ${network.lockPeriod} rounds</div>
        </div>
        ${existingStake ? `
            <div style="background: #0f3460; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                <strong>Current Stake:</strong> $${existingStake.amount.toLocaleString()}<br>
                <strong>Rounds Remaining:</strong> ${existingStake.roundsRemaining}
            </div>
        ` : ''}
        <input type="number" id="stakeAmount" class="stake-input" placeholder="Enter amount to stake ($)" max="${gameState.player.capital}" min="1">
        <div style="margin-top: 15px;">
            <strong>Available Capital:</strong> $${gameState.player.capital.toLocaleString()}
        </div>
        <button onclick="placeStake('${networkId}')" class="btn" style="margin-top: 15px; width: 100%;">
            ${existingStake ? 'Add to Stake' : 'Place Stake'}
        </button>
    `;

    elements.stakeModal.style.display = 'block';
}

// LEGO BLOCK 6: Staking Logic (Game State Changer)
function placeStake(networkId) {
    const amount = parseInt(document.getElementById('stakeAmount').value);
    const network = gameState.networks.find(n => n.id === networkId);

    // Validation: Error Boundary Pattern
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (amount > gameState.player.capital) {
        alert('Insufficient capital!');
        return;
    }

    // Update Single Source of Truth
    gameState.player.capital -= amount;

    // Add or update stake
    const existingStake = gameState.stakes.find(s => s.networkId === networkId);
    if (existingStake) {
        existingStake.amount += amount;
    } else {
        gameState.stakes.push({
            networkId: networkId,
            amount: amount,
            roundsRemaining: network.lockPeriod,
            initialAmount: amount
        });
    }

    addEvent(`Staked $${amount.toLocaleString()} in ${network.name}`);
    updateUI(); // UI follows data (Data Flow Pattern)
    elements.stakeModal.style.display = 'none';
}

// LEGO BLOCK 7: Round Processing (State Machine)
function processRound() {
    let totalRewards = 0;

    // Process each stake (component thinking)
    gameState.stakes.forEach(stake => {
        const network = gameState.networks.find(n => n.id === stake.networkId);
        
        // Base reward calculation
        const baseReward = stake.amount * network.apy / 12;
        let finalReward = baseReward;

        // Trust Score determines event probability and outcome
        const safetyMargin = network.trustScore / 100; // e.g., 0.95 for a score of 95
        const isSafeEvent = Math.random() < safetyMargin;

        if (isSafeEvent) {
            // Network is performing as expected. Small bonus possible.
            const bonusMultiplier = 1 + (Math.random() * 0.05); // Up to 5% bonus
            finalReward *= bonusMultiplier;
            if (bonusMultiplier > 1.01) {
                 addEvent(`${network.name}: Stable performance. Earned a small bonus.`);
            }
        } else {
            // Unsafe event! Potential for a slashing penalty.
            // The lower the trust score, the harsher the penalty can be.
            const penaltySeverity = (100 - network.trustScore) / 100; // e.g., 0.05 for a score of 95
            const penaltyMultiplier = 1 - (Math.random() * penaltySeverity * 5); // Can be a significant penalty

            finalReward *= penaltyMultiplier;

            if (penaltyMultiplier < 1) {
                const penaltyPercent = Math.round((1 - penaltyMultiplier) * 100);
                addEvent(`🚨 ${network.name}: Network instability! A slashing event occurred, resulting in a ${penaltyPercent}% penalty on rewards.`);
            }
        }
        
        totalRewards += finalReward;

        // Decrease lock period
        stake.roundsRemaining--;
    });

    // Return completed stakes (Complete investment cycle)
    const completedStakes = gameState.stakes.filter(s => s.roundsRemaining <= 0);
    completedStakes.forEach(stake => {
        gameState.player.capital += stake.amount; // Return principal
        addEvent(`Stake in ${gameState.networks.find(n => n.id === stake.networkId).name} completed - principal returned`);
    });

    // Remove completed stakes
    gameState.stakes = gameState.stakes.filter(s => s.roundsRemaining > 0);

    // Add rewards
    if (totalRewards > 0) {
        gameState.player.capital += totalRewards;
        gameState.totalEarnings += totalRewards;
        addEvent(`Round rewards: $${totalRewards.toFixed(2)}`);
    } else if (totalRewards < 0) {
        // If penalties were greater than rewards
        gameState.player.capital += totalRewards; // This will subtract from capital
        gameState.totalEarnings += totalRewards;
        addEvent(`Round resulted in a net loss of $${(-totalRewards).toFixed(2)} due to penalties.`);
    }

    return completedStakes.length > 0;
}

// LEGO BLOCK 8: Game Control (State Machine Controller)
function startRound() {
    if (gameState.stakes.length === 0) {
        addEvent('No active stakes! Place some stakes first.');
        return;
    }

    // Prevent double-clicks (User experience pattern)
    elements.startRoundBtn.disabled = true;

    const hasCompletions = processRound();
    gameState.round++;

    // Check game over condition
    if (gameState.player.capital <= 0) {
        addEvent('💥 Game Over! You\'ve lost all your capital!');
        elements.startRoundBtn.disabled = true;
        return;
    }

    updateUI(); // Data flow: State → UI
    updateOperatorDashboard(); // Update operator stats each round
    addEvent(`Round ${gameState.round - 1} completed. ${hasCompletions ? 'Some stakes have been returned!' : 'Continue staking to maximize returns!'}`);

    // Re-enable button after a short delay
    setTimeout(() => {
        elements.startRoundBtn.disabled = false;
    }, 1000);
}

// LEGO BLOCK 9: Reset System (Game State Reset)
function resetGame() {
    if (confirm('Are you sure you want to reset the game?')) {
        // Reset Single Source of Truth
        gameState.player.capital = 10000;
        gameState.player.isOperator = false;
        gameState.player.operatorId = null;
        gameState.operators = [];
        gameState.round = 1;
        gameState.totalEarnings = 0;
        gameState.stakes = [];

        updateUI();
        renderNetworks(); // Re-render network cards
        elements.eventsLog.innerHTML = '<div class="event">Game reset! Start with $10,000 and grow your capital through strategic staking.</div>';
        elements.startRoundBtn.disabled = false;
        elements.becomeOperatorBtn.disabled = false;
        elements.becomeOperatorBtn.textContent = 'Register as Operator';
        elements.operatorDashboard.style.display = 'none';
    }
}

// LEGO BLOCK 10: Operator Registration
function becomeOperator() {
    if (gameState.player.isOperator) {
        addEvent('You are already an operator.');
        return;
    }

    // Update player state
    gameState.player.isOperator = true;
    const operatorId = `player-op-${Date.now()}`;
    gameState.player.operatorId = operatorId;

    // Create new operator profile
    const newOperator = {
        id: operatorId,
        name: 'Your Operator Service',
        trustScore: 75, // Start with a neutral trust score
        tasksCompleted: 0,
        liveness: 100
    };
    gameState.operators.push(newOperator);

    addEvent('✅ Congratulations! You are now a registered Operator. Your starting trust score is 75.');
    
    // Show and populate the dashboard
    elements.operatorDashboard.style.display = 'block';
    updateOperatorDashboard();

    // Disable the button
    elements.becomeOperatorBtn.disabled = true;
    elements.becomeOperatorBtn.textContent = 'Operator Status: Active';
}

// EVENT LISTENERS: Event Delegation Pattern (Efficient)
elements.startRoundBtn.addEventListener('click', startRound);
elements.resetGameBtn.addEventListener('click', resetGame);
elements.becomeOperatorBtn.addEventListener('click', becomeOperator);
elements.closeBtn.addEventListener('click', () => {
    elements.stakeModal.style.display = 'none';
});

// Close modal when clicking outside (User experience pattern)
window.addEventListener('click', (event) => {
    if (event.target === elements.stakeModal) {
        elements.stakeModal.style.display = 'none';
    }
});

// LEGO BLOCK 11: Game Initialization (Setup Routine)
function initGame() {
    renderNetworks(); // Build UI from data
    updateUI();       // Set initial UI state
    addEvent('Welcome to Staking Master! Start with $10,000 and grow your capital through strategic staking.');
}

// Start the game when page loads
initGame();