// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NexusExecutor {
    address public owner;
    mapping(address => bool) public authorizedAgents;

    event AgentAuthorized(address agent);
    event StrategyExecuted(address agent, string strategyName, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgent() {
        require(authorizedAgents[msg.sender], "Not an authorized agent");
        _;
    }

    function authorizeAgent(address _agent) external onlyOwner {
        authorizedAgents[_agent] = true;
        emit AgentAuthorized(_agent);
    }

    function executeStrategy(string calldata _strategyName, uint256 _amount) external onlyAgent {
        // Mock execution of DeFi strategy on X Layer (e.g. routing through an AMM)
        emit StrategyExecuted(msg.sender, _strategyName, _amount);
    }
}
