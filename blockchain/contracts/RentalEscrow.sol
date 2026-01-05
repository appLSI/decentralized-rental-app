// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RentalEscrow {
    enum State { Created, Funded, Active, Completed, Cancelled }
    State public state;

    address payable public owner;          // propriétaire du logement
    address payable public tenant;         // locataire
    address payable public platformOwner;  // propriétaire de l'app

    uint256 public rentAmount;
    uint256 public leaseStart;
    uint256 public leaseEnd;
    uint256 public platformFeePercent = 5; // commission plateforme en %

    bool private locked; // protection contre la réentrance

    // ========================= Events =========================
    event Funded(address indexed tenant, uint256 amount);
    event LeaseStarted(uint256 startDate);
    event Completed(address indexed owner, uint256 ownerAmount, uint256 platformAmount);
    event Cancelled(address indexed by);
    event Refunded(address indexed tenant, uint256 amount);
    event Penalized(address indexed tenant, uint256 penaltyAmount);
    event Dispute(address indexed initiator, string reason);
    event PlatformFeeUpdated(uint256 newFee);

    // ========================= Constructor =========================
    constructor(
        address payable _owner,
        address payable _tenant,
        address payable _platformOwner,
        uint256 _rentAmount,
        uint256 _leaseStart,
        uint256 _leaseEnd
    ) {
        require(_leaseEnd > _leaseStart, "leaseEnd doit etre superieur a leaseStart");
        owner = _owner;
        tenant = _tenant;
        platformOwner = _platformOwner;
        rentAmount = _rentAmount;
        leaseStart = _leaseStart;
        leaseEnd = _leaseEnd;
        state = State.Created;
        locked = false;
    }

    // ========================= Modifiers =========================
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le proprietaire");
        _;
    }

    modifier onlyTenant() {
        require(msg.sender == tenant, "Seul le locataire");
        _;
    }

    modifier onlyPlatformOwner() {
        require(msg.sender == platformOwner, "Seul le proprietaire de la plateforme");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrancy detecte");
        locked = true;
        _;
        locked = false;
    }

    // ========================= Fonctions =========================
    // Paiement par le locataire
    function fund() external payable onlyTenant {
        require(state == State.Created, "Paiement deja effectue ou non autorise");
        require(msg.value == rentAmount, "Montant incorrect");

        state = State.Funded;
        emit Funded(msg.sender, msg.value);
    }

    // Début de la location
    function startLease() external onlyOwner {
        require(state == State.Funded, "Le contrat doit etre finance avant de commencer");
        require(block.timestamp >= leaseStart, "La date de debut n'est pas encore atteinte");

        state = State.Active;
        emit LeaseStarted(block.timestamp);
    }

    // Fin de la location + transfert commission plateforme
    function complete() external onlyOwner nonReentrant {
        require(state == State.Active, "La location doit etre active");
        require(block.timestamp >= leaseEnd, "La date de fin n'est pas encore atteinte");

        state = State.Completed;

        uint256 balance = address(this).balance;
        uint256 platformFee = (balance * platformFeePercent) / 100;
        uint256 ownerAmount = balance - platformFee;

        // Transfert à la plateforme
        (bool sentPlatform, ) = platformOwner.call{value: platformFee}("");
        require(sentPlatform, "Transfert commission plateforme echoue");

        // Transfert au propriétaire
        (bool sentOwner, ) = owner.call{value: ownerAmount}("");
        require(sentOwner, "Transfert proprietaire echoue");

        emit Completed(owner, ownerAmount, platformFee);
    }

    // Annulation avec remboursement ou pénalité
    function cancel() external nonReentrant {
        require(state == State.Created || state == State.Funded, "Annulation impossible a ce stade");

        if (state == State.Funded) {
            uint256 timeBeforeStart = leaseStart > block.timestamp ? leaseStart - block.timestamp : 0;

            if (msg.sender == tenant) {
                if (timeBeforeStart > 3 days) {
                    (bool sent, ) = tenant.call{value: address(this).balance}("");
                    require(sent, "Remboursement echoue");
                    emit Refunded(tenant, rentAmount);
                } else if (timeBeforeStart > 0 && timeBeforeStart <= 3 days) {
                    uint256 penalty = (rentAmount * 25) / 100;
                    uint256 refund = rentAmount - penalty;

                    (bool sentOwner, ) = owner.call{value: penalty}("");
                    require(sentOwner, "Transfert penalty echoue");
                    (bool sentTenant, ) = tenant.call{value: refund}("");
                    require(sentTenant, "Remboursement echoue");

                    emit Penalized(tenant, penalty);
                    emit Refunded(tenant, refund);
                } else {
                    revert("La location a deja commencee, annulation interdite");
                }
            } else if (msg.sender == owner) {
                (bool sentTenant, ) = tenant.call{value: address(this).balance}("");
                require(sentTenant, "Remboursement echoue");
                emit Refunded(tenant, rentAmount);
            }
        }

        state = State.Cancelled;
        emit Cancelled(msg.sender);
    }

    // Litige (backend décide)
    function refundDispute(address _to, uint256 _amount, string memory _reason) external onlyOwner nonReentrant {
        require(state == State.Active, "Litige possible seulement pendant la location");
        (bool sent, ) = payable(_to).call{value: _amount}("");
        require(sent, "Transfert echoue");
        emit Dispute(msg.sender, _reason);
    }

    // Mise à jour de la commission plateforme
    function setPlatformFeePercent(uint256 _newFee) external onlyPlatformOwner {
        require(_newFee <= 100, "Pourcentage invalide");
        platformFeePercent = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    // Solde du contrat
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
