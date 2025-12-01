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
            description: 'A balanced portfolio of high-trust networks, curated by the Symbiotic Foundation.',
            restakingRatio: 1.5, // Lower is safer
            delegationStrategy: [ // NEW: Networks this vault delegates to
                { networkId: 'ethereum', allocation: 0.5 }, // 50% of TVL to Ethereum
                { networkId: 'chainlink', allocation: 0.5 }  // 50% of TVL to Chainlink
            ]
        },
        {
            id: 'vault-02',
            name: 'High-Yield Operator Vault',
            type: 'OperatorSpecific',
            operatorId: 'op-ai-1', // Example placeholder
            tvl: 0,
            description: 'A high-risk, high-reward vault run by a single, aggressive operator.',
            restakingRatio: 3.5, // Higher is riskier
            delegationStrategy: [ // NEW: Networks this vault delegates to
                { networkId: 'solana', allocation: 0.6 }, // 60% of TVL to Solana
                { networkId: 'avalanche', allocation: 0.4 } // 40% of TVL to Avalanche
            ]
        }
    ],
    deposits: [], // Replaces the 'stakes' array
    round: 1,
    totalEarnings: 0,
    availableTasks: [], // NEW: Holds all open jobs from networks
    networks: [
        {
            id: 'ethereum',
            name: 'Ethereum Network',
            trustScore: 95,
            apy: 0.08,
            targetStake: 20000,
            currentStake: 0,
            decentralizationScore: 0.9, // Higher is better
            minOperatorTrustScore: 0, // No minimum for Ethereum
            minDecentralizationScore: 0 // No minimum for Ethereum
        },
        {
            id: 'polygon',
            name: 'Polygon POS',
            trustScore: 92,
            apy: 0.05,
            targetStake: 15000,
            currentStake: 0,
            decentralizationScore: 0.8,
            minOperatorTrustScore: 70, // Operators need at least 70 trust to stake here
            minDecentralizationScore: 0.5
        },
        {
            id: 'avalanche',
            name: 'Avalanche',
            trustScore: 88,
            apy: 0.12,
            targetStake: 10000,
            currentStake: 0,
            decentralizationScore: 0.6,
            minOperatorTrustScore: 60,
            minDecentralizationScore: 0.4
        },
        {
            id: 'arbitrum',
            name: 'Arbitrum One',
            trustScore: 90,
            apy: 0.07,
            targetStake: 12000,
            currentStake: 0,
            decentralizationScore: 0.7,
            minOperatorTrustScore: 75,
            minDecentralizationScore: 0.6
        },
        {
            id: 'solana',
            name: 'Solana',
            trustScore: 85,
            apy: 0.15,
            targetStake: 8000,
            currentStake: 0,
            decentralizationScore: 0.5,
            minOperatorTrustScore: 50,
            minDecentralizationScore: 0.3
        },
        {
            id: 'chainlink',
            name: 'Chainlink',
            trustScore: 98,
            apy: 0.06,
            targetStake: 18000,
            currentStake: 0,
            decentralizationScore: 0.95,
            minOperatorTrustScore: 80,
            minDecentralizationScore: 0.7
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
    // Task Board Elements
    taskBoard: document.getElementById('taskBoard'),
    taskList: document.getElementById('taskList'),
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
    
    // Display default values if profile not found, or actual values
    elements.opName.textContent = operatorProfile ? operatorProfile.name : 'N/A';
    elements.opTrustScore.textContent = operatorProfile ? operatorProfile.trustScore.toFixed(0) : 'N/A';
    elements.opTasks.textContent = operatorProfile ? operatorProfile.tasksCompleted : 'N/A';
    elements.opLiveness.textContent = operatorProfile ? operatorProfile.liveness : 'N/A';
}

// NEW LEGO BLOCK: Task Board UI Renderer
function renderTaskBoard() {
    if (!gameState.player.isOperator) return;

    elements.taskBoard.style.display = 'block';
    elements.taskList.innerHTML = ''; // Clear old tasks

    if (gameState.availableTasks.length === 0) {
        elements.taskList.innerHTML = '<div class="event">No tasks available this round.</div>';
        return;
    }

    gameState.availableTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item';
        taskDiv.innerHTML = `
            <div>${task.description}</div>
            <div>Reward: <strong>$${task.reward}</strong></div>
            <button class="btn" onclick="acceptTask('${task.id}')">Accept</button>
        `;
        elements.taskList.appendChild(taskDiv);
    });
}

// Helper function to convert trust score to risk category for styling
function getRiskCategory(trustScore) {
    if (trustScore >= 95) return 'low';
    if (trustScore >= 90) return 'medium';
    return 'high';
}

function getRestakingRiskCategory(ratio) {
    if (ratio <= 2) return 'low';
    if (ratio <= 4) return 'medium';
    return 'high';
}

// Helper function to calculate estimated APY for a vault
function calculateEstimatedAPY(vault) {
    let estimatedApy = 0;
    if (vault.delegationStrategy && vault.delegationStrategy.length > 0) {
        vault.delegationStrategy.forEach(delegation => {
            const network = gameState.networks.find(n => n.id === delegation.networkId);
            if (network) {
                estimatedApy += network.apy * delegation.allocation;
            }
        });
    }
    return estimatedApy;
}

// LEGO BLOCK 3: Vault Card Factory (Pattern Reuse)
function renderVaults() {
    // Single innerHTML call = More efficient than multiple DOM operations
    elements.networksGrid.innerHTML = gameState.vaults.map(vault => {
        const estimatedApy = calculateEstimatedAPY(vault);
        const delegationSummary = vault.delegationStrategy.map(d => {
            const network = gameState.networks.find(n => n.id === d.networkId);
            return `${network ? network.name.split(' ')[0] : 'Unknown'} (${d.allocation * 100}%)`;
        }).join(', ');
        const riskCategory = getRestakingRiskCategory(vault.restakingRatio);

        return `
        <div class="network-card" onclick="openDepositModal('${vault.id}')">
            <div class="network-name">${vault.name}</div>
            <div>Type: <span class="risk-${vault.type === 'Curated' ? 'low' : 'high'}">${vault.type}</span></div>
            <div>TVL: $${vault.tvl.toLocaleString()}</div>
            <div>Restaking Ratio: <span class="risk-${riskCategory}">${vault.restakingRatio}x</span></div>
            <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">${vault.description}</div>
            <div style="margin-top: 10px; font-size: 14px;"><strong>Delegates to:</strong> ${delegationSummary}</div>
            <div style="margin-top: 5px; font-size: 14px;"><strong>Estimated APY:</strong> ${(estimatedApy * 100).toFixed(2)}%</div>
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
    const estimatedApy = calculateEstimatedAPY(vault);
    const delegationSummary = vault.delegationStrategy.map(d => {
        const network = gameState.networks.find(n => n.id === d.networkId);
        return `${network ? network.name : 'Unknown'}: ${d.allocation * 100}%`;
    }).join('<br>&nbsp;&nbsp;');
    const riskCategory = getRestakingRiskCategory(vault.restakingRatio);

    let stakeGateMessage = '';
    let canDeposit = true;

    if (gameState.player.isOperator) {
        const operatorProfile = gameState.operators.find(op => op.id === gameState.player.operatorId);
        if (operatorProfile) {
            // Check minOperatorTrustScore for each network in the vault's delegation strategy
            vault.delegationStrategy.forEach(delegation => {
                const network = gameState.networks.find(n => n.id === delegation.networkId);
                if (network && network.minOperatorTrustScore && operatorProfile.trustScore < network.minOperatorTrustScore) {
                    stakeGateMessage += `<div class="risk-high">Your operator trust score (${operatorProfile.trustScore.toFixed(0)}) is too low for ${network.name} (min: ${network.minOperatorTrustScore}).</div>`;
                    canDeposit = false;
                }
                if (network && network.minDecentralizationScore && network.decentralizationScore < network.minDecentralizationScore) {
                    stakeGateMessage += `<div class="risk-high">${network.name} requires higher decentralization (${network.decentralizationScore * 100}% / min: ${network.minDecentralizationScore * 100}%).</div>`;
                    canDeposit = false;
                }
            });
        }
    }

    const networkDetails = vault.delegationStrategy.map(delegation => {
        const network = gameState.networks.find(n => n.id === delegation.networkId);
        const isOverStaked = network.currentStake > network.targetStake;
        return `
            <div style="padding-left: 10px; margin-bottom: 5px; font-size: 14px;">
                <strong>${network.name}:</strong><br>
                &nbsp;&nbsp;Stake: $${Math.round(network.currentStake).toLocaleString()} / $${network.targetStake.toLocaleString()} ${isOverStaked ? `<span class="risk-high" style="font-size: 12px; padding: 2px 4px; border-radius: 3px;">OVER-STAKED</span>` : ''}<br>
                &nbsp;&nbsp;Decentralization: ${network.decentralizationScore * 100}%
            </div>
        `;
    }).join('');

    elements.modalTitle.textContent = `Deposit in ${vault.name}`;
    elements.modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">${vault.description}</div>
        <div style="margin-bottom: 15px;">
            <div>Type: ${vault.type}</div>
            <div>TVL: $${vault.tvl.toLocaleString()}</div>
            <div>Restaking Ratio: <span class="risk-${riskCategory}">${vault.restakingRatio}x</span></div>
            <div style="margin-top: 5px;"><strong>Estimated APY:</strong> ${(estimatedApy * 100).toFixed(2)}%</div>
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Delegation Strategy:</strong><br>
            &nbsp;&nbsp;${delegationSummary}
        </div>
        <div style="margin-bottom: 15px;">
            <strong>Underlying Network Status:</strong>
            ${networkDetails}
        </div>
        ${stakeGateMessage ? `<div style="margin-bottom: 15px;"><strong>Stake Gate Requirements:</strong>${stakeGateMessage}</div>` : ''}
        ${existingDeposit ? `
            <div style="background: #0f3460; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                <strong>Your Current Deposit:</strong> $${existingDeposit.amount.toLocaleString()}
            </div>
        ` : ''}
        <input type="number" id="depositAmount" class="stake-input" placeholder="Enter amount to deposit ($)" max="${gameState.player.capital}" min="1" ${!canDeposit ? 'disabled' : ''}>
        <div style="margin-top: 15px;">
            <strong>Available Capital:</strong> $${gameState.player.capital.toLocaleString()}
        </div>
        <button onclick="makeDeposit('${vaultId}')" class="btn" style="margin-top: 15px; width: 100%;" ${!canDeposit ? 'disabled' : ''}>
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
        });
    }

    addEvent(`Deposited $${amount.toLocaleString()} in ${vault.name}`);
    updateUI();
    renderVaults(); // Re-render vaults to show new TVL
    elements.stakeModal.style.display = 'none';
}

// NEW LEGO BLOCK: Operator Task Logic
function acceptTask(taskId) {
    if (!gameState.player.isOperator) {
        addEvent('You must be an operator to accept tasks.');
        return;
    }

    const operatorProfile = gameState.operators.find(op => op.id === gameState.player.operatorId);
    const taskIndex = gameState.availableTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1 || !operatorProfile) {
        addEvent('Task not found or operator profile missing.');
        return;
    }

    // Move task from available to accepted
    const task = gameState.availableTasks.splice(taskIndex, 1)[0];
    task.status = 'accepted'; // Add status to the task
    operatorProfile.acceptedTasks.push(task);

    addEvent(`Accepted task: ${task.description}`);
    
    // Re-render the task board to show the task is gone
    renderTaskBoard();
}

// NEW LEGO BLOCK: Task Generation
function generateTasks() {
    gameState.availableTasks = []; // Clear old tasks
    
    gameState.networks.forEach(network => {
        // Chance to generate a task is inversely proportional to trustScore (lower trust = more tasks)
        // And also influenced by the number of active operators
        const activeOperators = gameState.operators.filter(op => op.liveness > 0).length;
        const baseChance = 0.2 + (100 - network.trustScore) / 200; // 0.2 to 0.7
        const finalChance = Math.min(0.8, baseChance * (1 + activeOperators * 0.1)); // Cap at 80%

        if (Math.random() < finalChance) {
            const reward = 50 + Math.round(Math.random() * 100);
            const trustPenalty = 1 + Math.round(Math.random() * 4);
            const newTask = {
                id: `task-${Date.now()}-${Math.random()}`,
                networkId: network.id,
                networkName: network.name,
                reward: reward,
                trustPenalty: trustPenalty,
                description: `Validate block bundle for ${network.name}`
            };
            gameState.availableTasks.push(newTask);
        }
    });

    if (gameState.availableTasks.length > 0) {
        addEvent(`${gameState.availableTasks.length} new operator tasks are available.`);
    }
}

// NEW LEGO BLOCK: Delegator Logic
function updateNetworkDelegations() {
    // 1. Reset current stake for all networks
    gameState.networks.forEach(network => {
        network.currentStake = 0;
    });

    // 2. Distribute vault TVL to networks based on delegation strategy
    gameState.vaults.forEach(vault => {
        if (vault.tvl > 0 && vault.delegationStrategy && vault.delegationStrategy.length > 0) {
            vault.delegationStrategy.forEach(delegation => {
                const network = gameState.networks.find(n => n.id === delegation.networkId);
                if (network) {
                    // Distribute TVL based on allocation percentage
                    network.currentStake += vault.tvl * delegation.allocation;
                }
            });
        }
    });
}

// LEGO BLOCK 7: Round Processing (State Machine) - FINAL VERSION
function processRound() {
    // 1. Update Operator Liveness & Trust Score
    if (gameState.player.isOperator) {
        gameState.operators.forEach(op => {
            // Liveness decay
            const livenessDecrease = Math.random() * 0.5; // Decrease by 0 to 0.5
            op.liveness = Math.max(0, op.liveness - livenessDecrease);

            // Trust score decay/gain based on liveness
            if (op.liveness < 80) {
                const trustDecay = (80 - op.liveness) / 100;
                op.trustScore = Math.max(0, op.trustScore - trustDecay);
                addEvent(`Your operator's trust score is decaying due to low liveness!`);
            } else if (op.liveness > 95) {
                const trustGain = (op.liveness - 95) / 100;
                op.trustScore = Math.min(100, op.trustScore + trustGain);
            }
        });
    }

    let totalRewards = 0;

    // 2. Process Staking Rewards from Deposits
    gameState.deposits.forEach(deposit => {
        const vault = gameState.vaults.find(v => v.id === deposit.vaultId);
        if (!vault) return;

        let vaultReward = 0;
        // Iterate through the vault's delegation strategy
        if (vault.delegationStrategy && vault.delegationStrategy.length > 0) {
            vault.delegationStrategy.forEach(delegation => {
                const network = gameState.networks.find(n => n.id === delegation.networkId);
                if (!network) return;

                // --- Final Points 2.1 Logic ---
                let miningRate = 1.0;
                if (network.currentStake > network.targetStake) {
                    miningRate = network.targetStake / network.currentStake;
                }
                let restakingScore = 1.0;
                if (vault.restakingRatio > 3) {
                    restakingScore = 3 / vault.restakingRatio;
                }
                const securityRate = ((restakingScore * 2) + network.decentralizationScore) / 3;
                const pointsRate = miningRate * securityRate;
                const gameBalanceFactor = 0.1;
                
                // Portion of deposit allocated to this network based on strategy
                const portionedAmount = deposit.amount * delegation.allocation;
                const baseReward = portionedAmount * pointsRate * gameBalanceFactor;
                let finalReward = baseReward;

                const safetyMargin = network.trustScore / 100;
                if (Math.random() > safetyMargin) {
                    const penaltySeverity = (100 - network.trustScore) / 100;
                    const penaltyMultiplier = 1 - (Math.random() * penaltySeverity * 5);
                    finalReward *= penaltyMultiplier;
                    if (penaltyMultiplier < 1) {
                        const penaltyPercent = Math.round((1 - penaltyMultiplier) * 100);
                        addEvent(`Slashing event in ${vault.name} via ${network.name}! A ${penaltyPercent}% penalty was applied.`);
                    }
                }
                vaultReward += finalReward;
            });
        }
        totalRewards += vaultReward;
    });

    // 3. Process Operator Task Rewards
    if (gameState.player.isOperator) {
        const operatorProfile = gameState.operators.find(op => op.id === gameState.player.operatorId);
        if (operatorProfile && operatorProfile.acceptedTasks.length > 0) {
            let taskRewards = 0;
            operatorProfile.acceptedTasks.forEach(task => {
                const failureChance = Math.max(0, (90 - operatorProfile.liveness) / 100);
                if (Math.random() < failureChance) {
                    // Task failed
                    operatorProfile.trustScore = Math.max(0, operatorProfile.trustScore - task.trustPenalty);
                    addEvent(`❌ Task failed for ${task.networkName} due to low liveness! Trust score penalized by ${task.trustPenalty}.`);
                } else {
                    // Task succeeded
                    taskRewards += task.reward;
                    operatorProfile.tasksCompleted++;
                    operatorProfile.trustScore = Math.min(100, operatorProfile.trustScore + 0.5);
                    addEvent(`✅ Task completed for ${task.networkName}. Reward: $${task.reward}.`);
                }
            });
            totalRewards += taskRewards;
            operatorProfile.acceptedTasks = []; // Clear tasks for next round
        }
    }

    // 4. Add all rewards to capital
    if (totalRewards > 0) {
        gameState.player.capital += totalRewards;
        gameState.totalEarnings += totalRewards;
        addEvent(`Total round rewards: $${totalRewards.toFixed(2)}`);
    } else if (totalRewards < 0) {
        gameState.player.capital += totalRewards;
        gameState.totalEarnings += totalRewards;
        addEvent(`Round resulted in a net loss of $${(-totalRewards).toFixed(2)} due to penalties.`);
    }

    return false;
}

// LEGO BLOCK 8: Game Control (State Machine Controller)
function startRound() {
    if (gameState.deposits.length === 0 && gameState.player.isOperator === false) {
        addEvent('No active deposits or operator tasks! Place deposits or become an operator.');
        return;
    }

    // Prevent double-clicks (User experience pattern)
    elements.startRoundBtn.disabled = true;

    updateNetworkDelegations(); // RUN DELEGATOR LOGIC
    if (gameState.player.isOperator) {
        generateTasks(); // RUN TASK GENERATION
    }
    processRound();
    gameState.round++;

    // Check game over condition
    if (gameState.player.capital <= 0) {
        addEvent('Game Over! You\'ve lost all your capital!');
        elements.startRoundBtn.disabled = true;
        return;
    }

    updateUI(); // Data flow: State → UI
    updateOperatorDashboard(); // Update operator stats each round
    renderVaults(); // Re-render vaults to show updated TVL and other stats
    if (gameState.player.isOperator) {
        renderTaskBoard(); // Update task board with new tasks
    }
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
        gameState.deposits = []; // Corrected from stakes
        gameState.availableTasks = [];

        updateUI();
        renderVaults(); // Corrected from renderNetworks
        elements.eventsLog.innerHTML = '<div class="event">Game reset! Start with $10,000 and grow your capital through strategic staking.</div>';
        elements.startRoundBtn.disabled = false;
        elements.becomeOperatorBtn.disabled = false;
        elements.becomeOperatorBtn.textContent = 'Register as Operator';
        elements.operatorDashboard.style.display = 'none';
        elements.taskBoard.style.display = 'none'; // Ensure task board is hidden
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
        liveness: 100,
        acceptedTasks: [] // NEW: Tasks accepted by this operator
    };
    gameState.operators.push(newOperator);

    addEvent('Congratulations! You are now a registered Operator. Your starting trust score is 75.');
    
    // Show and populate the dashboard
    elements.operatorDashboard.style.display = 'block';
    updateOperatorDashboard();
    renderTaskBoard();

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
    addEvent('Welcome to SYM-ULATOR! Select a vault to deposit your capital.');
}

// Start the game when page loads
initGame();