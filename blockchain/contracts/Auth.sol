// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuthContract
 * @dev Gère l'inscription et la vérification d'utilisateurs sur la blockchain.
 */
contract AuthContract {
    struct User {
        string username;
        string email;
        bool isRegistered;
    }

    mapping(address => User) private users;

    event UserRegistered(address indexed userAddress, string username, string email);

    /// @notice Inscription d'un nouvel utilisateur
    function registerUser(string memory _username, string memory _email) public {
        require(!users[msg.sender].isRegistered, "Utilisateur deja enregistre");
        users[msg.sender] = User(_username, _email, true);
        emit UserRegistered(msg.sender, _username, _email);
    }

    /// @notice Vérifie si une adresse est déjà inscrite
    function isUserRegistered(address _userAddress) public view returns (bool) {
        return users[_userAddress].isRegistered;
    }

    /// @notice Récupère les infos d'un utilisateur
    function getUser(address _userAddress) public view returns (string memory, string memory) {
        require(users[_userAddress].isRegistered, "Utilisateur non trouve");
        User memory u = users[_userAddress];
        return (u.username, u.email);
    }
}
