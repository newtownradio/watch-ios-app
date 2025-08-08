// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WatchStyleMarketplace is ReentrancyGuard, Ownable {
    
    // Structs
    struct Transaction {
        string stripePaymentIntentId;  // Stripe payment intent ID
        address buyer;
        address seller;
        uint256 watchPrice;
        uint256 authenticationFee;
        uint256 platformFee;
        uint256 shippingCost;
        uint256 totalAmount;
        uint256 timestamp;
        bool isAuthenticated;
        bool isShipped;
        bool isCompleted;
        bool isFailed;
        string watchDetails;
        string authenticationResult;
        string selectedAuthenticator;
        TransactionStatus status;
    }
    
    struct OracleResponse {
        string transactionId;
        bool isAuthentic;
        string result;
        string authenticator;
        uint256 timestamp;
        bool isValid;
    }
    
    // Enums
    enum TransactionStatus {
        PENDING,
        AUTHENTICATING,
        AUTHENTICATED,
        SHIPPED,
        COMPLETED,
        FAILED,
        DISPUTED
    }
    
    // State variables
    mapping(string => Transaction) public transactions;
    mapping(address => bool) public registeredSellers;
    mapping(address => bool) public authorizedOracles;
    
    // Events
    event TransactionCreated(
        string indexed transactionId,
        string stripePaymentIntentId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    
    event AuthenticationRequested(
        string indexed transactionId,
        string authenticator
    );
    
    event AuthenticationCompleted(
        string indexed transactionId,
        bool isAuthentic,
        string result
    );
    
    event PaymentReleased(
        string indexed transactionId,
        address seller,
        uint256 amount
    );
    
    event RefundIssued(
        string indexed transactionId,
        address buyer,
        uint256 amount
    );
    
    event PenaltyCharged(
        string indexed transactionId,
        address seller,
        uint256 penaltyAmount
    );
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 3; // 3%
    uint256 public constant FAILED_AUTHENTICATION_PENALTY = 35 * 10**18; // $35
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Unauthorized oracle");
        _;
    }
    
    modifier onlyTransactionParticipant(string memory transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(
            msg.sender == transaction.buyer || 
            msg.sender == transaction.seller || 
            authorizedOracles[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // Core functions
    function createTransaction(
        string memory transactionId,
        string memory stripePaymentIntentId,
        address seller,
        uint256 watchPrice,
        uint256 authenticationFee,
        uint256 shippingCost,
        string memory watchDetails,
        string memory selectedAuthenticator
    ) external {
        require(registeredSellers[seller], "Seller not registered");
        
        uint256 platformFee = (watchPrice * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 totalAmount = watchPrice + authenticationFee;
        
        transactions[transactionId] = Transaction({
            stripePaymentIntentId: stripePaymentIntentId,
            buyer: msg.sender,
            seller: seller,
            watchPrice: watchPrice,
            authenticationFee: authenticationFee,
            platformFee: platformFee,
            shippingCost: shippingCost,
            totalAmount: totalAmount,
            timestamp: block.timestamp,
            isAuthenticated: false,
            isShipped: false,
            isCompleted: false,
            isFailed: false,
            watchDetails: watchDetails,
            authenticationResult: "",
            selectedAuthenticator: selectedAuthenticator,
            status: TransactionStatus.PENDING
        });
        
        emit TransactionCreated(
            transactionId,
            stripePaymentIntentId,
            msg.sender,
            seller,
            totalAmount
        );
    }
    
    function requestAuthentication(
        string memory transactionId
    ) external onlyTransactionParticipant(transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.PENDING, "Invalid status");
        
        transaction.status = TransactionStatus.AUTHENTICATING;
        
        emit AuthenticationRequested(transactionId, transaction.selectedAuthenticator);
    }
    
    function receiveAuthenticationResult(
        string memory transactionId,
        bool isAuthentic,
        string memory result,
        string memory authenticator
    ) external onlyAuthorizedOracle {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.AUTHENTICATING, "Invalid status");
        
        transaction.isAuthenticated = isAuthentic;
        transaction.authenticationResult = result;
        transaction.status = TransactionStatus.AUTHENTICATED;
        
        if (isAuthentic) {
            // Trigger Stripe to release payment to seller
            // This will be handled by the oracle service
            emit PaymentReleased(transactionId, transaction.seller, transaction.watchPrice);
        } else {
            // Trigger Stripe to refund buyer
            // This will be handled by the oracle service
            _handleFailedAuthentication(transactionId);
        }
        
        emit AuthenticationCompleted(transactionId, isAuthentic, result);
    }
    
    function _handleFailedAuthentication(string memory transactionId) internal {
        Transaction storage transaction = transactions[transactionId];
        
        // Mark transaction as failed
        transaction.status = TransactionStatus.FAILED;
        transaction.isFailed = true;
        
        // Penalties will be handled by Stripe (seller's card charged)
        emit RefundIssued(transactionId, transaction.buyer, transaction.totalAmount);
        emit PenaltyCharged(transactionId, transaction.seller, 
            transaction.authenticationFee + FAILED_AUTHENTICATION_PENALTY + transaction.shippingCost);
    }
    
    // Oracle management
    function addAuthorizedOracle(address oracleAddress) external onlyOwner {
        authorizedOracles[oracleAddress] = true;
    }
    
    function removeAuthorizedOracle(address oracleAddress) external onlyOwner {
        authorizedOracles[oracleAddress] = false;
    }
    
    // Seller management
    function registerSeller(address seller) external onlyOwner {
        registeredSellers[seller] = true;
    }
    
    function unregisterSeller(address seller) external onlyOwner {
        registeredSellers[seller] = false;
    }
    
    // View functions
    function getTransaction(string memory transactionId) external view returns (Transaction memory) {
        return transactions[transactionId];
    }
    
    function isOracleAuthorized(address oracleAddress) external view returns (bool) {
        return authorizedOracles[oracleAddress];
    }
    
    // Emergency functions
    function emergencyPause() external onlyOwner {
        // Pause all operations in emergency
    }
    
    function emergencyResume() external onlyOwner {
        // Resume operations after emergency
    }
}
