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

    bool private locked;

    // ========================= Events =========================
    event Funded(address indexed tenant, uint256 totalAmount, uint256 platformFee, uint256 ownerAmount);
    event LeaseStarted(uint256 startDate);
    event Completed(address indexed owner, uint256 ownerAmount, uint256 platformAmount);
    event Cancelled(address indexed by);
    event Refunded(address indexed tenant, uint256 amount);
    event Penalized(address indexed tenant, uint256 penaltyAmount);
    event Dispute(address indexed initiator, string reason);
    event PlatformFeeUpdated(uint256 newFee);

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
    // Paiement par le locataire avec commission incluse
    function fund() external payable onlyTenant nonReentrant {
        require(state == State.Created, "Paiement deja effectue ou non autorise");

        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 ownerAmount = msg.value - platformFee;

        // Transfert immediat à la plateforme
        (bool sentPlatform, ) = platformOwner.call{value: platformFee}("");
        require(sentPlatform, "Transfert commission plateforme echoue");

        // Transfert immediat au propriétaire
        (bool sentOwner, ) = owner.call{value: ownerAmount}("");
        require(sentOwner, "Transfert proprietaire echoue");

        state = State.Funded;
        emit Funded(msg.sender, msg.value, platformFee, ownerAmount);
    }

    function startLease() external onlyOwner {
        require(state == State.Funded, "Le contrat doit etre finance avant de commencer");
        require(block.timestamp >= leaseStart, "La date de debut n'est pas encore atteinte");

        state = State.Active;
        emit LeaseStarted(block.timestamp);
    }

    function complete() external onlyOwner nonReentrant {
        require(state == State.Active, "La location doit etre active");
        require(block.timestamp >= leaseEnd, "La date de fin n'est pas encore atteinte");

        state = State.Completed;
        emit Completed(owner, 0, 0); // plus rien à payer, tout a été transféré lors de fund()
    }

    function cancel() external nonReentrant {
        require(state == State.Created || state == State.Funded, "Annulation impossible a ce stade");

        if (state == State.Funded && msg.sender == tenant) {
            // Remboursement complet si annulation avant start
            (bool sent, ) = tenant.call{value: address(this).balance}("");
            require(sent, "Remboursement echoue");
            emit Refunded(tenant, address(this).balance);
        }

        state = State.Cancelled;
        emit Cancelled(msg.sender);
    }

    function refundDispute(address _to, uint256 _amount, string memory _reason) external onlyOwner nonReentrant {
        require(state == State.Active, "Litige possible seulement pendant la location");
        (bool sent, ) = payable(_to).call{value: _amount}("");
        require(sent, "Transfert echoue");
        emit Dispute(msg.sender, _reason);
    }

    function setPlatformFeePercent(uint256 _newFee) external onlyPlatformOwner {
        require(_newFee <= 100, "Pourcentage invalide");
        platformFeePercent = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
