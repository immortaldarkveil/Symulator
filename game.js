// SINGLE SOURCE OF TRUTH: gameState object
const gameState = {
    player: {
        capital: 10000,
        isStaker: true,
        isOperator: false,
        operatorId: null
    },
    operators: [],
    vaults: [
        {
            id: 'vault-01',
            name: 'Symbiotic Shared Security Vault',
            type: 'Curated',
            tvl: 0,
            description: 'A balanced portfolio of high-trust networks, curated by the Symbiotic Foundation.'
        },
        {
            id: 'vault-02',
            name: 'High-Yield Operator Vault',
            type: 'OperatorSpecific',
            operatorId: 'op-ai-1', // Example placeholder
            tvl: 0,
            description: 'A high-risk, high-reward vault run by a single, aggressive operator.'
        }
    ],
    deposits: [], // Replaces the 'stakes' array
    round: 1,
    totalEarnings: 0,
    networks: [
        {
            id: 'ethereum',
            name: 'Ethereum Network',
            trustScore: 95,
            apy: 0.08,
            targetStake: 20000,
            currentStake: 0
        },
        {
            id: 'polygon',
            name: 'Polygon POS',
            trustScore: 92,
            apy: 0.05,
            targetStake: 15000,
            currentStake: 0
        },
        {
            id: 'avalanche',
            name: 'Avalanche',
            trustScore: 88,
            apy: 0.12,
            targetStake: 10000,
            currentStake: 0
        },
        {
            id: 'arbitrum',
            name: 'Arbitrum One',
            trustScore: 90,
            apy: 0.07,
            targetStake: 12000,
            currentStake: 0
        },
        {
            id: 'solana',
            name: 'Solana',
            trustScore: 85,
            apy: 0.15,
            targetStake: 8000,
            currentStake: 0
        },
        {
            id: 'chainlink',
            name: 'Chainlink',
            trustScore: 98,
            apy: 0.06,
            targetStake: 18000,
            currentStake: 0
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

// LEGO BLOCK 3: Vault Card Factory (Pattern Reuse)
function renderVaults() {
    // Single innerHTML call = More efficient than multiple DOM operations
    elements.networksGrid.innerHTML = gameState.vaults.map(vault => {
        return `
        <div class="network-card" onclick="openDepositModal('${vault.id}')">
            <div class="network-name">${vault.name}</div>
            <div>Type: <span class="risk-${vault.type === 'Curated' ? 'low' : 'high'}">${vault.type}</span></div>
            <div>TVL: $${vault.tvl.toLocaleString()}</div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">${vault.description}</div>
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
function openDepositModal(vaultId) {
    const vault = gameState.vaults.find(v => v.id === vaultId);
    const existingDeposit = gameState.deposits.find(d => d.vaultId === vaultId);

    // Simplified: Get underlying networks to display their status
    const underlyingNetworkIds = vault.type === 'Curated' 
        ? ['ethereum', 'chainlink']
        : ['solana', 'avalanche'];
    const networkDetails = underlyingNetworkIds.map(id => {
        const network = gameState.networks.find(n => n.id === id);
        const isOverStaked = network.currentStake > network.targetStake;
        return `
            <div style="padding-left: 10px; margin-bottom: 5px;">
                <strong>${network.name}:</strong> 
                $${Math.round(network.currentStake).toLocaleString()} / $${network.targetStake.toLocaleString()}
                ${isOverStaked ? `<span class="risk-high" style="font-size: 12px; padding: 2px 4px; border-radius: 3px; margin-left: 5px;">OVER-STAKED</span>` : ''}
            </div>
        `;
    }).join('');

    elements.modalTitle.textContent = `Deposit in ${vault.name}`;
    elements.modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">${vault.description}</div>
        <div style="margin-bottom: 15px;">
            <div>Type: ${vault.type}</div>
            <div>TVL: $${vault.tvl.toLocaleString()}</div>
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Underlying Network Status:</strong>
            ${networkDetails}
        </div>
        ${existingDeposit ? `
            <div style="background: #0f3460; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                <strong>Your Current Deposit:</strong> $${existingDeposit.amount.toLocaleString()}
            </div>
        ` : ''}
        <input type="number" id="depositAmount" class="stake-input" placeholder="Enter amount to deposit ($)" max="${gameState.player.capital}" min="1">
        <div style="margin-top: 15px;">
            <strong>Available Capital:</strong> $${gameState.player.capital.toLocaleString()}
        </div>
        <button onclick="makeDeposit('${vaultId}')" class="btn" style="margin-top: 15px; width: 100%;">
            ${existingDeposit ? 'Add to Deposit' : 'Make Deposit'}
        </button>
    `;

    elements.stakeModal.style.display = 'block';
}

// LEGO BLOCK 6: Deposit Logic (Game State Changer)
function makeDeposit(vaultId) {
    const amount = parseInt(document.getElementById('depositAmount').value);
    const vault = gameState.vaults.find(v => v.id === vaultId);

    // Validation
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    if (amount > gameState.player.capital) {
        alert('Insufficient capital!');
        return;
    }

    // Update State
    gameState.player.capital -= amount;
    vault.tvl += amount;

    const existingDeposit = gameState.deposits.find(d => d.vaultId === vaultId);
    if (existingDeposit) {
        existingDeposit.amount += amount;
    } else {
        gameState.deposits.push({
            vaultId: vaultId,
            amount: amount,
            // We'll add more properties like lock periods later
        });
    }

    addEvent(`Deposited $${amount.toLocaleString()} in ${vault.name}`);
    updateUI();
    renderVaults(); // Re-render vaults to show new TVL
    elements.stakeModal.style.display = 'none';
}

// NEW LEGO BLOCK: Delegator Logic
function updateNetworkDelegations() {
    // 1. Reset current stake for all networks
    gameState.networks.forEach(network => {
        network.currentStake = 0;
    });

    // 2. Distribute vault TVL to networks
    gameState.vaults.forEach(vault => {
        if (vault.tvl > 0) {
            // Simplified: Assume each vault uses a predefined set of networks.
            const underlyingNetworkIds = vault.type === 'Curated' 
                ? ['ethereum', 'chainlink'] // Safe, curated vault
                : ['solana', 'avalanche'];   // High-risk, operator vault
            
            const stakePerNetwork = vault.tvl / underlyingNetworkIds.length;

            underlyingNetworkIds.forEach(networkId => {
                const network = gameState.networks.find(n => n.id === networkId);
                if (network) {
                    network.currentStake += stakePerNetwork;
                }
            });
        }
    });
}

// LEGO BLOCK 7: Round Processing (State Machine)
function processRound() {
    let totalRewards = 0;

    gameState.deposits.forEach(deposit => {
        const vault = gameState.vaults.find(v => v.id === deposit.vaultId);
        if (!vault) return;

        const underlyingNetworkIds = vault.type === 'Curated' 
            ? ['ethereum', 'chainlink']
            : ['solana', 'avalanche'];

        let vaultReward = 0;
        underlyingNetworkIds.forEach(networkId => {
            const network = gameState.networks.find(n => n.id === networkId);
            if (!network) return;

            // --- MINING RATE LOGIC ---
            let miningRate = 1.0;
            if (network.currentStake > network.targetStake) {
                miningRate = network.targetStake / network.currentStake;
                addEvent(`${network.name} is over-staked! Reward rate reduced by ${((1 - miningRate) * 100).toFixed(0)}%.`);
            }
            // -------------------------

            const portionedAmount = deposit.amount / underlyingNetworkIds.length;
            const baseReward = portionedAmount * network.apy / 12;
            let finalReward = baseReward * miningRate; // Apply mining rate

            const safetyMargin = network.trustScore / 100;
            if (Math.random() > safetyMargin) {
                const penaltySeverity = (100 - network.trustScore) / 100;
                const penaltyMultiplier = 1 - (Math.random() * penaltySeverity * 5);
                finalReward *= penaltyMultiplier;

                if (penaltyMultiplier < 1) {
                    const penaltyPercent = Math.round((1 - penaltyMultiplier) * 100);
                    addEvent(`🚨 Slashing event in ${vault.name} via ${network.name}! A ${penaltyPercent}% penalty was applied.`);
                }
            }
            vaultReward += finalReward;
        });
        
        totalRewards += vaultReward;
    });

    // Add rewards
    if (totalRewards > 0) {
        gameState.player.capital += totalRewards;
        gameState.totalEarnings += totalRewards;
        addEvent(`Round rewards from vault deposits: $${totalRewards.toFixed(2)}`);
    } else if (totalRewards < 0) {
        gameState.player.capital += totalRewards;
        gameState.totalEarnings += totalRewards;
        addEvent(`Round resulted in a net loss of $${(-totalRewards).toFixed(2)} due to penalties.`);
    }

    return false;
}

// LEGO BLOCK 8: Game Control (State Machine Controller)
function startRound() {
    if (gameState.deposits.length === 0) {
        addEvent('No active deposits! Place some deposits in vaults first.');
        return;
    }

    // Prevent double-clicks (User experience pattern)
    elements.startRoundBtn.disabled = true;

    updateNetworkDelegations(); // <-- RUN DELEGATOR LOGIC
    processRound();
    gameState.round++;

    // Check game over condition
    if (gameState.player.capital <= 0) {
        addEvent('💥 Game Over! You\'ve lost all your capital!');
        elements.startRoundBtn.disabled = true;
        return;
    }

    updateUI(); // Data flow: State → UI
    updateOperatorDashboard(); // Update operator stats each round
    renderVaults(); // Re-render vaults to show updated TVL and other stats
    addEvent(`Round ${gameState.round - 1} completed.`);

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
    renderVaults(); // Build UI from data
    updateUI();       // Set initial UI state
    addEvent('Welcome to Staking Master! Select a vault to deposit your capital.');
}

// Start the game when page loads
initGame();