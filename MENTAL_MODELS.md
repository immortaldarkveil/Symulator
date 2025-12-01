# Mental Models Applied to Symbiotic Project Development

This document outlines the core principles, strategies, and workflows applied during the development of the Symbiotic Staking Simulator.

1.  **Single Source of Truth (SSOT):**
    *   **Application:** The `gameState` object in `game.js` serves as the central, authoritative source for all game data.
    *   **Benefit:** Ensures data consistency, simplifies state management, and makes debugging easier as all UI and logic derive from this single source.

2.  **Modular Design / "LEGO Blocks":**
    *   **Application:** Breaking down the codebase into distinct, self-contained functions (e.g., `updateUI`, `renderVaults`, `processRound`, `addEvent`).
    *   **Benefit:** Each function has a clear, single responsibility, improving code organization, reusability, and testability.

3.  **Separation of Concerns:**
    *   **Application:** UI rendering logic (`updateUI`, `renderVaults`, `updateOperatorDashboard`, `renderTaskBoard`) is kept distinct from core game state management (`gameState`) and game mechanics (`processRound`, `makeDeposit`, `acceptTask`).
    *   **Benefit:** Reduces coupling, making it easier to modify one part of the system without affecting others.

4.  **Iterative Development & Verification Loop:**
    *   **Application:** A structured workflow of Understand -> Plan -> Implement -> Verify (Tests) -> Verify (Standards) -> Finalize.
    *   **Benefit:** Ensures features are thoroughly tested and confirmed by the user before proceeding, preventing accumulation of bugs and ensuring alignment. Crucially, no further development proceeds until verification is confirmed.

5.  **Micro-Replacements for Code Modification:**
    *   **Application:** When using automated tools like `replace`, breaking down large code changes into the smallest possible, highly targeted replacements with precise `old_string` context.
    *   **Benefit:** Directly addresses the "exact match" limitation of automated tools, significantly improving the reliability and success rate of code modifications.

6.  **Git Workflow (Commit & Push Checkpoints):**
    *   **Application:** Regular staging, committing, and pushing changes to GitHub after significant feature completion and user verification.
    *   **Benefit:** Maintains robust version control, creates stable checkpoints, and facilitates collaboration.

7.  **User-Centric UI/UX:**
    *   **Application:** Prioritizing clarity, accessibility, and decision support in the user interface, especially for presenting complex information like vault performance, risk profiles, and delegation strategies.
    *   **Benefit:** Enhances player understanding, engagement, and ability to make informed strategic decisions within the game.

8.  **Problem-Domain Mapping:**
    *   **Application:** Continuously mapping game mechanics and features back to the Symbiotic shared security protocol documentation (e.g., Vaults, Points 2.1 reward system, Operator roles).
    *   **Benefit:** Ensures the simulation accurately reflects the real-world protocol it aims to model.

9.  **Defensive Programming:**
    *   **Application:** Implementing input validation (e.g., for deposit amounts) and robust error handling (e.g., checking for `null` or `undefined` objects before accessing properties).
    *   **Benefit:** Prevents unexpected behavior, crashes, and improves the overall stability and reliability of the game.

10. **Transparency & Alignment:**
    *   **Application:** Clearly communicating technical decisions, tool limitations, proposed solutions, and workflow adherence to the user.
    *   **Benefit:** Builds trust, ensures mutual understanding, and keeps the project moving forward efficiently.
