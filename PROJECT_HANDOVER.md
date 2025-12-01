# Project Handover: SYM-ULATOR - Symbiotic Game

## 1. Project Overview

**Project Name:** SYM-ULATOR - Symbiotic Game (Symulator)
**Core Goal:** To develop an educational financial strategy web game that accurately simulates the Symbiotic shared security protocol, including vault-centric operations, dynamic Points 2.1 rewards, and operator gameplay.

## 2. Architectural Overview

The project is a client-side web application built with vanilla HTML, CSS, and JavaScript.

*   **`index.html`:** Defines the game's structure and UI elements.
*   **`styles.css`:** Manages the visual styling, including the custom black/green/white color scheme and responsive design.
*   **`game.js`:** Contains all game logic, state management, and UI rendering functions. It acts as the "brain" of the application.

### Key Architectural Principles & Mental Models Applied:

*   **Single Source of Truth (SSOT):** The `gameState` object in `game.js` is the central, authoritative source for all game data. All UI elements and game logic derive from this object to ensure consistency.
*   **Modular Design / "LEGO Blocks":** The JavaScript code is organized into distinct, self-contained functions (e.g., `updateUI`, `renderVaults`, `processRound`, `addEvent`), each with a clear, single responsibility.
*   **Separation of Concerns:** UI rendering logic is kept distinct from game state management and core game mechanics.
*   **Event-Driven Architecture:** User interactions trigger state changes and UI updates via event listeners.

## 3. Core Domain Knowledge: Symbiotic Protocol Concepts

The simulation is built around key Symbiotic concepts:

*   **Vaults:**
    *   Central management layer for staker deposits, delegation, and potential slashing.
    *   Stakers deposit into vaults; networks draw stake from vaults.
    *   Vaults have types (`Immutable`, `Curated`, `OperatorSpecific`), `tvl` (Total Value Locked), `restakingRatio` (risk/reward multiplier), and a `delegationStrategy`.
    *   `delegationStrategy`: Defines which networks a vault delegates to and with what allocation percentages.
*   **Networks:**
    *   Represent blockchain networks requiring shared security.
    *   Have properties like `trustScore`, `apy`, `targetStake`, `currentStake`, and `decentralizationScore`.
*   **Operators:**
    *   Maintain network liveness, perform tasks, and earn rewards.
    *   Build a `trustScore` based on performance.
    *   Can accept tasks from networks.
*   **Points 2.1 Reward System:**
    *   The core reward calculation: `Network Points = NetworkStake × PointsRate × gameBalanceFactor`.
    *   `PointsRate = MiningRate × SecurityRate`.
    *   `MiningRate`: Dynamically adjusts based on `currentStake` vs. `targetStake` (punishes over-staking).
    *   `SecurityRate`: A weighted average of `Restaking Score` (derived from `vault.restakingRatio`) and `Vaults Stake Decentralization` (from `network.decentralizationScore`).
*   **Slashing:** Implemented as a probabilistic event based on network `trustScore`, resulting in a penalty to rewards.

## 4. Development History & Completed Features

The project has progressed through several key phases:

*   **Initial Setup & Basic UI/UX:**
    *   Established core HTML structure and CSS styling.
    *   Implemented a black background, `#C0FD5C` buttons, and white font color scheme.
    *   Removed emojis from UI text for a more professional aesthetic.
*   **Three-Party Ecosystem Integration:**
    *   Refactored `gameState` to include `player` (with `isStaker`, `isOperator`, `operatorId`), `operators` array, and `vaults` array.
    *   Replaced direct network staking with a vault-centric deposit system.
*   **Points 2.1 Reward System Implementation:**
    *   Integrated `MiningRate` and `SecurityRate` calculations into `processRound`.
    *   Added `targetStake`, `currentStake`, `decentralizationScore` to networks and `restakingRatio` to vaults.
    *   Implemented `updateNetworkDelegations` to dynamically distribute TVL to networks.
*   **Operator Gameplay Loop:**
    *   Implemented `generateTasks` to create new tasks for operators each round.
    *   Developed `renderTaskBoard` to display available tasks.
    *   Created `acceptTask` function for operators to claim tasks.
    *   `processRound` now includes logic for processing accepted tasks and awarding rewards.
    *   Implemented `becomeOperator` functionality.
*   **Dynamic Vault Delegation Strategies:**
    *   Added `delegationStrategy` to vaults in `gameState`, defining network allocations.
    *   Refactored `updateNetworkDelegations` and `processRound` to utilize these dynamic strategies for reward calculation.
*   **Bug Fixes & Refinements:**
    *   Fixed "player capital exceeds $10k" bug by capping capital in `processRound`.
    *   Addressed "Trust Score not visible" UI bug and `resetGame` inconsistencies.
    *   Ensured `resetGame` correctly resets all game state and hides relevant UI components.
    *   Removed emojis from event messages.

## 5. Current Status

All core game mechanics, including the full Points 2.1 reward system, operator gameplay, and dynamic vault delegation strategies, are **implemented and verified**. The codebase is currently clean and synchronized with GitHub.

## 6. Remaining Roadmap & Next Steps

The project is ready for further enhancements. The next areas of focus, in order of discussion, are:

### A. UI/UX Improvements (Current Priority)

*   **Goal:** Enhance user-friendliness by providing clearer, more accessible information for decision-making.
*   **Proposed Enhancements:**
    *   **Integrate Symbiotic Brand Kit:** Apply a "line background" to the UI using the provided `lines.svg` (Base64 encoded for direct CSS embedding).
    *   **Enhance Vault Cards (`renderVaults`):** Display a concise summary of the `delegationStrategy` (e.g., "Delegates to: ETH (50%), LINK (50%)") and an "Estimated Points Rate" or "Expected APY" directly on each card.
    *   **Enhance Deposit Modal (`openDepositModal`):** Provide a more detailed breakdown of the `delegationStrategy` and the calculated "Estimated Points Rate" within the modal.
    *   **Visual Cues for Risk:** Use color-coding or icons for `restakingRatio` to quickly indicate risk levels.

### B. Expand Gameplay (Player Agency & Progression)

*   **Operator Performance Metrics:**
    *   Make operator `liveness` dynamic (e.g., chance to decrease each round).
    *   Enhance `trustScore` impact from task completion/failure.
    *   Integrate `liveness` into `trustScore` decay/gain.
*   **Player-Owned Operator Vaults:** Allow players (as operators) to create and manage their own dedicated vaults, defining delegation strategies and attracting stakers.
*   **More Dynamic Network Interaction:** (e.g., networks actively seeking operators/vaults, setting "stake gates").

### C. Technical Debt & Maintenance

*   **GitHub Sync:** (Currently resolved, but always a potential area for review).

## 7. Key Files for Development

*   `index.html`
*   `styles.css`
*   `game.js`

## 8. Testing Protocol

All new features require user-driven browser-based testing. The developer should launch `index.html` in a browser, follow specific test scenarios, and report visual and console output for verification.

---

This document should provide a solid foundation for any developer taking over the project.
