/**
 * Voting Contract Template
 *
 * A ballot contract where the chairperson adds proposals and grants voting
 * rights. Each voter gets one vote and can delegate. Teaches: structs,
 * mappings, delegation patterns, events.
 *
 * Constructor: `constructor(string[] proposalNames)`
 */

import { type CompilationOutput, compileSolidity } from '../compiler/index.js';

export const VOTING_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Voting
 * @notice A simple ballot contract. The chairperson registers voters and
 *         proposals. Voters cast one vote (or delegate). Teaches structs,
 *         mappings, weighted voting, and delegation.
 */
contract Voting {
    struct Voter {
        bool registered;
        bool voted;
        address delegate;
        uint256 vote;       // index of the voted proposal
        uint256 weight;     // delegated weight (starts at 1 for registered voters)
    }

    struct Proposal {
        string name;
        uint256 voteCount;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    bool public votingOpen;

    event VoterRegistered(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed proposalIndex);
    event VoteDelegated(address indexed from, address indexed to);
    event VotingStatusChanged(bool open);

    modifier onlyChairperson() {
        require(msg.sender == chairperson, "Voting: not the chairperson");
        _;
    }

    modifier whenOpen() {
        require(votingOpen, "Voting: voting is not open");
        _;
    }

    /// @param proposalNames Array of human-readable proposal names
    constructor(string[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({ name: proposalNames[i], voteCount: 0 }));
        }
    }

    /// @notice Open or close the voting period.
    function setVotingOpen(bool open) external onlyChairperson {
        votingOpen = open;
        emit VotingStatusChanged(open);
    }

    /// @notice Register a voter (chairperson only; must be done before they vote).
    function registerVoter(address voter) external onlyChairperson {
        require(!voters[voter].registered, "Voting: already registered");
        voters[voter] = Voter({ registered: true, voted: false, delegate: address(0), vote: 0, weight: 1 });
        emit VoterRegistered(voter);
    }

    /// @notice Delegate your vote to \`to\`.
    function delegate(address to) external whenOpen {
        Voter storage sender = voters[msg.sender];
        require(sender.registered, "Voting: not registered");
        require(!sender.voted, "Voting: already voted");
        require(to != msg.sender, "Voting: self-delegation");

        // Follow delegation chain (detect loops)
        address delegatee = to;
        while (voters[delegatee].delegate != address(0)) {
            delegatee = voters[delegatee].delegate;
            require(delegatee != msg.sender, "Voting: delegation loop");
        }
        sender.voted = true;
        sender.delegate = delegatee;
        Voter storage d = voters[delegatee];
        if (d.voted) {
            proposals[d.vote].voteCount += sender.weight;
        } else {
            d.weight += sender.weight;
        }
        emit VoteDelegated(msg.sender, delegatee);
    }

    /// @notice Cast your vote for proposal at \`proposalIndex\`.
    function vote(uint256 proposalIndex) external whenOpen {
        Voter storage sender = voters[msg.sender];
        require(sender.registered, "Voting: not registered");
        require(!sender.voted, "Voting: already voted");
        require(proposalIndex < proposals.length, "Voting: invalid proposal");
        sender.voted = true;
        sender.vote = proposalIndex;
        proposals[proposalIndex].voteCount += sender.weight;
        emit VoteCast(msg.sender, proposalIndex);
    }

    /// @notice Returns the index of the winning proposal.
    function winningProposal() public view returns (uint256 winnerIndex) {
        uint256 maxVotes;
        for (uint256 i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > maxVotes) {
                maxVotes = proposals[i].voteCount;
                winnerIndex = i;
            }
        }
    }

    /// @notice Returns the name of the winning proposal.
    function winnerName() external view returns (string memory) {
        return proposals[winningProposal()].name;
    }

    /// @notice Total number of proposals.
    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }
}`;

let _compiled: CompilationOutput | null = null;

export function getVotingContract(): CompilationOutput {
  if (!_compiled) {
    const result = compileSolidity({
      contractName: 'Voting',
      source: VOTING_SOURCE,
    });
    if (!result.success || result.contracts.length === 0) {
      throw new Error(
        `Voting compilation failed: ${result.errors?.join(', ')}`
      );
    }
    _compiled = result.contracts[0];
  }
  return _compiled;
}
