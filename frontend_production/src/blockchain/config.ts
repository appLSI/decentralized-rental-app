export const WEB3_CONFIG = {
    NETWORK: 'sepolia',
    CHAIN_ID: 11155111,
    RPC_URL: 'https://sepolia.infura.io/v3/fd2d5d433ee64e87b18e2cf925ca84c4',
    BLOCK_EXPLORER_URL: 'https://sepolia.etherscan.io',

    CONTRACT_ADDRESS: '0x0E35F26Ce7dFfF7E69B8ea3e0F4a9F4563671F4E',

    RENTAL_ESCROW_ABI: [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                },
                {
                    "internalType": "address payable",
                    "name": "_tenant",
                    "type": "address"
                },
                {
                    "internalType": "address payable",
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_leaseStart",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_leaseEnd",
                    "type": "uint256"
                }
            ],
            "name": "createBooking",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                }
            ],
            "name": "payRent",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                }
            ],
            "name": "releaseFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                }
            ],
            "name": "cancelBooking",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                }
            ],
            "name": "getBookingStatus",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_bookingId",
                    "type": "uint256"
                }
            ],
            "name": "getBookingDetails",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "tenant",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "platformFee",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "leaseStart",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "leaseEnd",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "status",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "bookingId",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "tenant",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "platformFee",
                    "type": "uint256"
                }
            ],
            "name": "BookingCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "bookingId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "PaymentReceived",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "bookingId",
                    "type": "uint256"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "ownerAmount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "platformFee",
                    "type": "uint256"
                }
            ],
            "name": "FundsReleased",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "bookingId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "refundedTo",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Cancelled",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "bookingId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "reason",
                    "type": "string"
                }
            ],
            "name": "Disputed",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "newFeePercent",
                    "type": "uint256"
                }
            ],
            "name": "FeeUpdated",
            "type": "event"
        }
    ]
};
