// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RentalEscrow {

    enum State { Created, Approved, Funded, Active, Completed, Cancelled }
    State public state;

    address payable public owner;
    address payable public tenant;

    uint256 public rentAmount;
    uint256 public leaseStart;
    uint256 public leaseEnd;

    event Approved(address indexed owner);
    event Funded(address indexed tenant, uint256 amount);
    event LeaseStarted(uint256 startDate);
    event Completed(address indexed owner, uint256 amount);
    event Cancelled(address indexed by);
    event Refunded(address indexed tenant, uint256 amount);
    event Penalized(address indexed tenant, uint256 penaltyAmount);
    event Dispute(address indexed initiator, string reason);

    constructor(
        address payable _owner,
        address payable _tenant,
        uint256 _rentAmount,
        uint256 _leaseStart,
        uint256 _leaseEnd
    ) {
        owner = _owner;
        tenant = _tenant;
        rentAmount = _rentAmount;
        leaseStart = _leaseStart;
        leaseEnd = _leaseEnd;
        state = State.Created;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire peut executer cette action");
        _;
    }

    modifier onlyTenant() {
        require(msg.sender == tenant, "Seul le locataire peut executer cette action");
        _;
    }

    // Étape 1 : Validation de la réservation
    function approve() external onlyOwner {
        require(state == State.Created, "Deja approuve ou annule");
        state = State.Approved;
        emit Approved(msg.sender);
    }

    // Étape 2 : Paiement du loyer
    function fund() external payable onlyTenant {
        require(state == State.Approved, "La reservation doit etre approuvee avant paiement");
        require(msg.value == rentAmount, "Montant incorrect");
        state = State.Funded;
        emit Funded(msg.sender, msg.value);
    }

    // Étape 3 : Début de la location
    function startLease() external onlyOwner {
        require(state == State.Funded, "Doit etre finance avant de commencer");
        require(block.timestamp >= leaseStart, "La date de debut n'est pas encore atteinte");
        state = State.Active;
        emit LeaseStarted(block.timestamp);
    }

    // Étape 4 : Fin de la location
    function complete() external onlyOwner {
        require(state == State.Active, "La location doit etre active");
        require(block.timestamp >= leaseEnd, "La date de fin n'est pas encore atteinte");
        state = State.Completed;
        payable(owner).transfer(address(this).balance);
        emit Completed(owner, rentAmount);
    }

    // Étape 5 : Annulation avec logique de pénalité
    function cancel() external {
        require(
            state == State.Created || state == State.Approved || state == State.Funded,
            "Annulation impossible a ce stade"
        );

        // Cas où le contrat contient de l'argent (Funded)
        if (state == State.Funded) {
            if (msg.sender == tenant) {
                uint256 timeBeforeStart = leaseStart - block.timestamp;

                if (timeBeforeStart > 3 days) {
                    // Annulation gratuite
                    payable(tenant).transfer(address(this).balance);
                    emit Refunded(tenant, rentAmount);
                } 
                else if (timeBeforeStart > 0 && timeBeforeStart <= 3 days) {
                    // Pénalité 25 %
                    uint256 penalty = (rentAmount * 25) / 100;
                    uint256 refund = rentAmount - penalty;
                    payable(owner).transfer(penalty);
                    payable(tenant).transfer(refund);
                    emit Penalized(tenant, penalty);
                    emit Refunded(tenant, refund);
                } 
                else {
                    revert("La location a deja commencee, annulation interdite");
                }
            } 
            else if (msg.sender == owner) {
                // Propriétaire annule -> remboursement total
                payable(tenant).transfer(address(this).balance);
                emit Refunded(tenant, rentAmount);
            }
        }

        state = State.Cancelled;
        emit Cancelled(msg.sender);
    }

    // Étape 6 : Litige (géré par backend)
    function refundDispute(address _to, uint256 _amount, string memory _reason) external onlyOwner {
        require(state == State.Active, "Litige possible seulement pendant la location");
        payable(_to).transfer(_amount);
        emit Dispute(msg.sender, _reason);
    }

    // Lecture du solde actuel du contrat
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
