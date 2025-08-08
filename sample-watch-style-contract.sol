// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title WatchStyleMarketplace
 * @dev Smart contract for Watch Style marketplace with escrow and authentication
 */
contract WatchStyleMarketplace is ReentrancyGuard, Ownable {
    
    // Structs
    struct Transaction {
        address buyer;
        address seller;
        uint256 watchPrice;
        uint256 authenticationFee;
        uint256 platformFee;
        uint256 totalAmount;
        uint256 escrowAmount;
        uint256 timestamp;
        bool isAuthenticated;
        bool isShipped;
        bool isCompleted;
        bool isFailed;
        string watchDetails;
        string authenticationResult;
        TransactionStatus status;
    }
    
    struct AuthenticationPartner {
        string name;
        address oracleAddress;
        bool isActive;
        uint256 fee;
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
    mapping(bytes32 => Transaction) public transactions;
    mapping(address => AuthenticationPartner) public authenticationPartners;
    mapping(address => uint256) public sellerBalances;
    mapping(address => bool) public registeredSellers;
    
    // Events
    event TransactionCreated(
        bytes32 indexed transactionId,
        address indexed buyer,
        address indexed seller,
        uint256 amount
    );
    
    event AuthenticationRequested(
        bytes32 indexed transactionId,
        string partnerName
    );
    
    event AuthenticationCompleted(
        bytes32 indexed transactionId,
        bool isAuthentic,
        string result
    );
    
    event PaymentReleased(
        bytes32 indexed transactionId,
        address seller,
        uint256 amount
    );
    
    event RefundIssued(
        bytes32 indexed transactionId,
        address buyer,
        uint256 amount
    );
    
    event PenaltyCharged(
        bytes32 indexed transactionId,
        address seller,
        uint256 penaltyAmount
    );
    
    // Constants
    uint256 public constant PLATFORM_FEE_PERCENTAGE = 3; // 3%
    uint256 public constant FAILED_AUTHENTICATION_PENALTY = 35 * 10**18; // $35 in wei
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    
    // Penalty structure for failed authentication:
    // 1. Authentication cost (paid by seller)
    // 2. Failed authentication fee ($35)
    // 3. Shipping cost (paid by seller in both success/failure cases)
    
    // Modifiers
    modifier onlyRegisteredSeller() {
        require(registeredSellers[msg.sender], "Seller not registered");
        _;
    }
    
    modifier onlyTransactionParticipant(bytes32 transactionId) {
        require(
            transactions[transactionId].buyer == msg.sender ||
            transactions[transactionId].seller == msg.sender,
            "Not authorized"
        );
        _;
    }
    
    modifier onlyActiveTransaction(bytes32 transactionId) {
        require(
            transactions[transactionId].status != TransactionStatus.COMPLETED &&
            transactions[transactionId].status != TransactionStatus.FAILED,
            "Transaction not active"
        );
        _;
    }
    
    // Constructor
    constructor() {
        // Initialize with default authentication partners
        _addAuthenticationPartner("WatchBox", address(0), 50 * 10**18); // $50
        _addAuthenticationPartner("GIA", address(0), 75 * 10**18); // $75
        _addAuthenticationPartner("Rolex Service", address(0), 100 * 10**18); // $100
    }
    
    // Core functions
    
    /**
     * @dev Create a new transaction
     * @param seller Address of the seller
     * @param watchPrice Price of the watch
     * @param authenticationFee Fee for authentication service
     * @param watchDetails Details about the watch
     */
    function createTransaction(
        address seller,
        uint256 watchPrice,
        uint256 authenticationFee,
        string memory watchDetails
    ) external payable nonReentrant {
        require(msg.value == watchPrice + authenticationFee, "Incorrect payment amount");
        require(registeredSellers[seller], "Seller not registered");
        
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                seller,
                watchPrice,
                authenticationFee,
                block.timestamp
            )
        );
        
        uint256 platformFee = (watchPrice * PLATFORM_FEE_PERCENTAGE) / 100;
        uint256 totalAmount = watchPrice + authenticationFee;
        
        transactions[transactionId] = Transaction({
            buyer: msg.sender,
            seller: seller,
            watchPrice: watchPrice,
            authenticationFee: authenticationFee,
            platformFee: platformFee,
            totalAmount: totalAmount,
            escrowAmount: totalAmount,
            timestamp: block.timestamp,
            isAuthenticated: false,
            isShipped: false,
            isCompleted: false,
            isFailed: false,
            watchDetails: watchDetails,
            authenticationResult: "",
            status: TransactionStatus.PENDING
        });
        
        emit TransactionCreated(transactionId, msg.sender, seller, totalAmount);
    }
    
    /**
     * @dev Request authentication for a watch
     * @param transactionId ID of the transaction
     * @param partnerName Name of the authentication partner
     */
    function requestAuthentication(
        bytes32 transactionId,
        string memory partnerName
    ) external onlyTransactionParticipant(transactionId) onlyActiveTransaction(transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.PENDING, "Invalid status");
        
        // Verify authentication partner exists and is active
        // In production, this would check against registered partners
        
        transaction.status = TransactionStatus.AUTHENTICATING;
        
        emit AuthenticationRequested(transactionId, partnerName);
    }
    
    /**
     * @dev Complete authentication (called by oracle/authentication partner)
     * @param transactionId ID of the transaction
     * @param isAuthentic Whether the watch is authentic
     * @param result Authentication result details
     */
    function completeAuthentication(
        bytes32 transactionId,
        bool isAuthentic,
        string memory result
    ) external onlyOwner {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.AUTHENTICATING, "Not authenticating");
        
        transaction.isAuthenticated = isAuthentic;
        transaction.authenticationResult = result;
        
        if (isAuthentic) {
            transaction.status = TransactionStatus.AUTHENTICATED;
            // Seller can now ship the watch
        } else {
            transaction.status = TransactionStatus.FAILED;
            transaction.isFailed = true;
            _handleFailedAuthentication(transactionId);
        }
        
        emit AuthenticationCompleted(transactionId, isAuthentic, result);
    }
    
    /**
     * @dev Mark watch as shipped (seller function)
     * @param transactionId ID of the transaction
     */
    function markAsShipped(
        bytes32 transactionId
    ) external onlyTransactionParticipant(transactionId) onlyActiveTransaction(transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.AUTHENTICATED, "Must be authenticated first");
        require(msg.sender == transaction.seller, "Only seller can mark as shipped");
        
        transaction.isShipped = true;
        transaction.status = TransactionStatus.SHIPPED;
    }
    
    /**
     * @dev Complete transaction (buyer confirms receipt)
     * @param transactionId ID of the transaction
     */
    function completeTransaction(
        bytes32 transactionId
    ) external onlyTransactionParticipant(transactionId) onlyActiveTransaction(transactionId) {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status == TransactionStatus.SHIPPED, "Must be shipped first");
        require(msg.sender == transaction.buyer, "Only buyer can complete");
        
        transaction.status = TransactionStatus.COMPLETED;
        transaction.isCompleted = true;
        
        // Release payment to seller
        uint256 sellerAmount = transaction.watchPrice - transaction.platformFee;
        sellerBalances[transaction.seller] += sellerAmount;
        
        emit PaymentReleased(transactionId, transaction.seller, sellerAmount);
    }
    
    /**
     * @dev Handle failed authentication
     * @param transactionId ID of the transaction
     */
    function _handleFailedAuthentication(bytes32 transactionId) internal {
        Transaction storage transaction = transactions[transactionId];
        
        // Refund buyer (watch price + authentication fee)
        payable(transaction.buyer).transfer(transaction.totalAmount);
        
        // Charge seller penalties:
        // 1. Authentication cost (already paid by seller)
        // 2. Failed authentication fee ($35)
        // 3. Shipping cost (seller pays regardless of success/failure)
        uint256 penaltyAmount = FAILED_AUTHENTICATION_PENALTY; // $35 fee only
        
        // Note: Authentication cost and shipping are handled outside the contract
        // as they are paid directly by the seller to the services
        
        sellerBalances[transaction.seller] = sellerBalances[transaction.seller] > penaltyAmount ? 
            sellerBalances[transaction.seller] - penaltyAmount : 0;
        
        emit RefundIssued(transactionId, transaction.buyer, transaction.totalAmount);
        emit PenaltyCharged(transactionId, transaction.seller, penaltyAmount);
    }
    
    /**
     * @dev Withdraw seller balance
     */
    function withdrawBalance() external onlyRegisteredSeller nonReentrant {
        uint256 balance = sellerBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        sellerBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }
    
    /**
     * @dev Register a seller
     * @param seller Address to register
     */
    function registerSeller(address seller) external onlyOwner {
        registeredSellers[seller] = true;
    }
    
    /**
     * @dev Add authentication partner
     * @param name Partner name
     * @param oracleAddress Oracle address for authentication results
     * @param fee Authentication fee
     */
    function addAuthenticationPartner(
        string memory name,
        address oracleAddress,
        uint256 fee
    ) external onlyOwner {
        _addAuthenticationPartner(name, oracleAddress, fee);
    }
    
    function _addAuthenticationPartner(
        string memory name,
        address oracleAddress,
        uint256 fee
    ) internal {
        authenticationPartners[oracleAddress] = AuthenticationPartner({
            name: name,
            oracleAddress: oracleAddress,
            isActive: true,
            fee: fee
        });
    }
    
    /**
     * @dev Get transaction details
     * @param transactionId ID of the transaction
     */
    function getTransaction(bytes32 transactionId) external view returns (Transaction memory) {
        return transactions[transactionId];
    }
    
    /**
     * @dev Get seller balance
     * @param seller Seller address
     */
    function getSellerBalance(address seller) external view returns (uint256) {
        return sellerBalances[seller];
    }
    
    /**
     * @dev Emergency function to handle disputes
     * @param transactionId ID of the transaction
     * @param refundBuyer Whether to refund the buyer
     */
    function handleDispute(
        bytes32 transactionId,
        bool refundBuyer
    ) external onlyOwner {
        Transaction storage transaction = transactions[transactionId];
        require(transaction.status != TransactionStatus.COMPLETED, "Transaction completed");
        
        if (refundBuyer) {
            payable(transaction.buyer).transfer(transaction.totalAmount);
            emit RefundIssued(transactionId, transaction.buyer, transaction.totalAmount);
        } else {
            uint256 sellerAmount = transaction.watchPrice - transaction.platformFee;
            sellerBalances[transaction.seller] += sellerAmount;
            emit PaymentReleased(transactionId, transaction.seller, sellerAmount);
        }
        
        transaction.status = TransactionStatus.COMPLETED;
        transaction.isCompleted = true;
    }
    
    // Fallback function
    receive() external payable {
        // Accept payments
    }
}
