// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RentalEscrow
 * @dev Version HYBRIDE : Simple + Sécurisée (ADMIN REMOVED)
 * @notice Pour tests / POC / démo
 */
contract RentalEscrow {

    // ========================= ENUMS & STRUCTURES =========================
    enum Status { 
        AWAITING_PAYMENT,
        PAID,
        COMPLETED,
        CANCELLED,
        DISPUTED
    }

    struct Booking {
        uint256 id;
        address payable tenant;
        address payable owner;
        uint256 amount;
        uint256 platformFee;
        uint256 leaseStart;
        uint256 leaseEnd;
        Status status;
        bool exists;
        bool locked;
    }

    // ========================= STORAGE =========================
    mapping(uint256 => Booking) public bookings;

    address payable public platformWallet;
    address public admin;
    uint256 public defaultFeePercent = 5;

    // ========================= EVENTS =========================
    event BookingCreated(
        uint256 indexed bookingId,
        address indexed tenant,
        address indexed owner,
        uint256 amount,
        uint256 platformFee
    );

    event PaymentReceived(uint256 indexed bookingId, address from, uint256 amount);
    event FundsReleased(uint256 indexed bookingId, address indexed owner, uint256 ownerAmount, uint256 platformFee);
    event Cancelled(uint256 indexed bookingId, address refundedTo, uint256 amount);
    event Disputed(uint256 indexed bookingId, string reason);
    event FeeUpdated(uint256 newFeePercent);

    // ========================= CONSTRUCTOR =========================
    constructor() {
        admin = msg.sender;
        platformWallet = payable(msg.sender);
    }

    // ========================= MODIFIERS =========================
    modifier validBooking(uint256 _bookingId) {
        require(bookings[_bookingId].exists, "Reservation introuvable");
        _;
    }

    modifier nonReentrant(uint256 _bookingId) {
        require(!bookings[_bookingId].locked, "Operation deja en cours");
        bookings[_bookingId].locked = true;
        _;
        bookings[_bookingId].locked = false;
    }

    // ========================= CORE FUNCTIONS =========================

    function createBooking(
        uint256 _bookingId,
        address payable _tenant,
        address payable _owner,
        uint256 _amount,
        uint256 _leaseStart,
        uint256 _leaseEnd
    ) external {
        require(!bookings[_bookingId].exists, "ID deja utilise");
        require(_tenant != address(0), "Adresse tenant invalide");
        require(_owner != address(0), "Adresse owner invalide");
        require(_amount > 0, "Montant invalide");

        uint256 fee = (_amount * defaultFeePercent) / 100;

        bookings[_bookingId] = Booking({
            id: _bookingId,
            tenant: _tenant,
            owner: _owner,
            amount: _amount,
            platformFee: fee,
            leaseStart: _leaseStart,
            leaseEnd: _leaseEnd,
            status: Status.AWAITING_PAYMENT,
            exists: true,
            locked: false
        });

        emit BookingCreated(_bookingId, _tenant, _owner, _amount, fee);
    }

    function payRent(uint256 _bookingId)
        external
        payable
        validBooking(_bookingId)
        nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];

        require(booking.status == Status.AWAITING_PAYMENT, "Statut invalide");
        require(msg.value == booking.amount, "Montant incorrect");

        booking.status = Status.PAID;
        emit PaymentReceived(_bookingId, msg.sender, msg.value);
    }

    function releaseFunds(uint256 _bookingId)
        external
        validBooking(_bookingId)
        nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == Status.PAID, "Fonds indisponibles");

        booking.status = Status.COMPLETED;

        uint256 ownerShare = booking.amount - booking.platformFee;

        (bool sentOwner, ) = booking.owner.call{value: ownerShare}("");
        require(sentOwner, "Echec owner");

        (bool sentPlatform, ) = platformWallet.call{value: booking.platformFee}("");
        require(sentPlatform, "Echec plateforme");

        emit FundsReleased(_bookingId, booking.owner, ownerShare, booking.platformFee);
    }

    function cancelBooking(uint256 _bookingId)
        external
        validBooking(_bookingId)
        nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == Status.PAID, "Rien a annuler");

        booking.status = Status.CANCELLED;

        (bool sent, ) = booking.tenant.call{value: booking.amount}("");
        require(sent, "Echec remboursement");

        emit Cancelled(_bookingId, booking.tenant, booking.amount);
    }

    function markAsDisputed(uint256 _bookingId, string memory _reason)
        external
        validBooking(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == Status.PAID, "Statut invalide");

        booking.status = Status.DISPUTED;
        emit Disputed(_bookingId, _reason);
    }

    function resolveDispute(
        uint256 _bookingId,
        uint256 _tenantAmount,
        uint256 _ownerAmount
    )
        external
        validBooking(_bookingId)
        nonReentrant(_bookingId)
    {
        Booking storage booking = bookings[_bookingId];
        require(booking.status == Status.DISPUTED, "Pas en litige");
        require(_tenantAmount + _ownerAmount <= booking.amount, "Montants invalides");

        booking.status = Status.COMPLETED;

        if (_tenantAmount > 0) {
            (bool sentTenant, ) = booking.tenant.call{value: _tenantAmount}("");
            require(sentTenant, "Echec tenant");
        }

        if (_ownerAmount > 0) {
            (bool sentOwner, ) = booking.owner.call{value: _ownerAmount}("");
            require(sentOwner, "Echec owner");
        }

        uint256 remaining = booking.amount - _tenantAmount - _ownerAmount;
        if (remaining > 0) {
            (bool sentPlatform, ) = platformWallet.call{value: remaining}("");
            require(sentPlatform, "Echec plateforme");
        }
    }

    // ========================= CONFIG & VIEWS =========================

    function setDefaultFeePercent(uint256 _newFeePercent) external {
        require(_newFeePercent <= 100, "Invalide");
        defaultFeePercent = _newFeePercent;
        emit FeeUpdated(_newFeePercent);
    }

    function setPlatformWallet(address payable _newWallet) external {
        require(_newWallet != address(0), "Adresse invalide");
        platformWallet = _newWallet;
    }

    function transferAdmin(address _newAdmin) external {
        require(_newAdmin != address(0), "Adresse invalide");
        admin = _newAdmin;
    }

    function getBookingStatus(uint256 _bookingId)
        external
        view
        validBooking(_bookingId)
        returns (Status)
    {
        return bookings[_bookingId].status;
    }

    function isBookingExist(uint256 _bookingId) external view returns (bool) {
        return bookings[_bookingId].exists;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function emergencyWithdraw() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "Pas de fonds");

        (bool sent, ) = platformWallet.call{value: balance}("");
        require(sent, "Echec retrait");
    }

    receive() external payable {}
}
