// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TicketNFT
 * @dev NFT Event Ticketing System using ERC-1155 Multi-Token Standard
 * @notice This contract manages event creation, ticket types, and ticket purchases
 */
contract TicketNFT is ERC1155, AccessControl, ERC1155Supply, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");

    // Structs
    struct Event {
        uint256 eventId;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        address organizer;
        bool isActive;
        uint256 createdAt;
    }

    struct TicketType {
        uint256 tokenId;
        uint256 eventId;
        string name;
        uint256 price;
        uint256 maxSupply;
        uint256 startSaleTime;
        uint256 endSaleTime;
        bool isActive;
    }

    // State variables
    uint256 private _eventIdCounter;
    uint256 private _tokenIdCounter;
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => TicketType) public ticketTypes;
    mapping(uint256 => uint256[]) public eventTicketTypes; // eventId => tokenIds[]
    mapping(uint256 => bool) public usedTickets; // tokenId => isUsed
    
    string public name = "Event Ticket NFT";
    string public symbol = "TICKET";

    // Events
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer,
        uint256 startTime,
        uint256 endTime
    );

    event TicketTypeCreated(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        string name,
        uint256 price,
        uint256 maxSupply
    );

    event TicketPurchased(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 amount,
        uint256 price
    );

    event TicketCheckedIn(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed holder,
        uint256 timestamp
    );

    event FundsWithdrawn(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event EventUpdated(
        uint256 indexed eventId,
        bool isActive
    );

    /**
     * @dev Constructor
     * @param _baseURI Base URI for token metadata
     * @param _admin Admin address
     */
    constructor(string memory _baseURI, address _admin) ERC1155(_baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
    }

    /**
     * @dev Create a new event
     * @param _name Event name
     * @param _description Event description
     * @param _startTime Event start timestamp
     * @param _endTime Event end timestamp
     */
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) external whenNotPaused returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(bytes(_name).length > 0, "Name cannot be empty");

        uint256 eventId = _eventIdCounter++;

        events[eventId] = Event({
            eventId: eventId,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            organizer: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });

        // Grant organizer role to event creator
        _grantRole(ORGANIZER_ROLE, msg.sender);

        emit EventCreated(eventId, _name, msg.sender, _startTime, _endTime);

        return eventId;
    }

    /**
     * @dev Create a new ticket type for an event
     * @param _eventId Event ID
     * @param _name Ticket type name
     * @param _price Ticket price in wei
     * @param _maxSupply Maximum number of tickets
     * @param _startSaleTime Sale start timestamp
     * @param _endSaleTime Sale end timestamp
     */
    function createTicketType(
        uint256 _eventId,
        string memory _name,
        uint256 _price,
        uint256 _maxSupply,
        uint256 _startSaleTime,
        uint256 _endSaleTime
    ) external whenNotPaused returns (uint256) {
        Event storage eventData = events[_eventId];
        require(eventData.isActive, "Event not active");
        require(
            msg.sender == eventData.organizer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(_maxSupply > 0, "Max supply must be greater than 0");
        require(_endSaleTime > _startSaleTime, "Invalid sale time range");
        require(_endSaleTime <= eventData.startTime, "Sale must end before event");

        uint256 tokenId = _tokenIdCounter++;

        ticketTypes[tokenId] = TicketType({
            tokenId: tokenId,
            eventId: _eventId,
            name: _name,
            price: _price,
            maxSupply: _maxSupply,
            startSaleTime: _startSaleTime,
            endSaleTime: _endSaleTime,
            isActive: true
        });

        eventTicketTypes[_eventId].push(tokenId);

        emit TicketTypeCreated(tokenId, _eventId, _name, _price, _maxSupply);

        return tokenId;
    }

    /**
     * @dev Purchase tickets
     * @param _tokenId Ticket type ID
     * @param _amount Number of tickets to purchase
     */
    function purchaseTicket(uint256 _tokenId, uint256 _amount)
        external
        payable
        whenNotPaused
        nonReentrant
    {
        TicketType storage ticket = ticketTypes[_tokenId];
        require(ticket.isActive, "Ticket type not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(
            block.timestamp >= ticket.startSaleTime &&
            block.timestamp <= ticket.endSaleTime,
            "Sale not active"
        );

        uint256 currentSupply = totalSupply(_tokenId);
        require(
            currentSupply + _amount <= ticket.maxSupply,
            "Exceeds max supply"
        );

        uint256 totalPrice = ticket.price * _amount;
        require(msg.value >= totalPrice, "Insufficient payment");

        // Mint tickets to buyer
        _mint(msg.sender, _tokenId, _amount, "");

        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit TicketPurchased(_tokenId, ticket.eventId, msg.sender, _amount, ticket.price);
    }

    /**
     * @dev Check-in a ticket (mark as used)
     * @param _tokenId Token ID
     * @param _holder Ticket holder address
     */
    function checkInTicket(uint256 _tokenId, address _holder)
        external
        onlyRole(ORGANIZER_ROLE)
    {
        require(balanceOf(_holder, _tokenId) > 0, "Holder does not own ticket");
        require(!usedTickets[_tokenId], "Ticket already used");

        TicketType storage ticket = ticketTypes[_tokenId];
        Event storage eventData = events[ticket.eventId];
        
        require(
            block.timestamp >= eventData.startTime &&
            block.timestamp <= eventData.endTime,
            "Event not active"
        );

        usedTickets[_tokenId] = true;

        emit TicketCheckedIn(_tokenId, ticket.eventId, _holder, block.timestamp);
    }

    /**
     * @dev Update event status
     * @param _eventId Event ID
     * @param _isActive New status
     */
    function updateEventStatus(uint256 _eventId, bool _isActive)
        external
    {
        Event storage eventData = events[_eventId];
        require(
            msg.sender == eventData.organizer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        eventData.isActive = _isActive;

        emit EventUpdated(_eventId, _isActive);
    }

    /**
     * @dev Update ticket price
     * @param _tokenId Token ID
     * @param _newPrice New price in wei
     */
    function updateTicketPrice(uint256 _tokenId, uint256 _newPrice)
        external
    {
        TicketType storage ticket = ticketTypes[_tokenId];
        Event storage eventData = events[ticket.eventId];
        
        require(
            msg.sender == eventData.organizer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(ticket.isActive, "Ticket type not active");
        require(_newPrice > 0, "Price must be greater than 0");

        ticket.price = _newPrice;
    }

    /**
     * @dev Update ticket sale times
     * @param _tokenId Token ID
     * @param _startSaleTime New start sale time
     * @param _endSaleTime New end sale time
     */
    function updateTicketSaleTimes(
        uint256 _tokenId,
        uint256 _startSaleTime,
        uint256 _endSaleTime
    ) external {
        TicketType storage ticket = ticketTypes[_tokenId];
        Event storage eventData = events[ticket.eventId];
        
        require(
            msg.sender == eventData.organizer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(ticket.isActive, "Ticket type not active");
        require(_endSaleTime > _startSaleTime, "Invalid sale time range");
        require(_endSaleTime <= eventData.startTime, "Sale must end before event");

        ticket.startSaleTime = _startSaleTime;
        ticket.endSaleTime = _endSaleTime;
    }

    /**
     * @dev Withdraw contract balance
     * @param _to Recipient address
     */
    function withdraw(address payable _to)
        external
        onlyRole(ADMIN_ROLE)
        nonReentrant
    {
        require(_to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        _to.transfer(balance);

        emit FundsWithdrawn(_to, balance, block.timestamp);
    }

    /**
     * @dev Get ticket types for an event
     * @param _eventId Event ID
     */
    function getEventTicketTypes(uint256 _eventId)
        external
        view
        returns (uint256[] memory)
    {
        return eventTicketTypes[_eventId];
    }

    /**
     * @dev Set base URI for metadata
     * @param _newURI New base URI
     */
    function setURI(string memory _newURI) external onlyRole(ADMIN_ROLE) {
        _setURI(_newURI);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Override required functions
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get event details
     */
    function getEvent(uint256 _eventId)
        external
        view
        returns (Event memory)
    {
        return events[_eventId];
    }

    /**
     * @dev Get ticket type details
     */
    function getTicketType(uint256 _tokenId)
        external
        view
        returns (TicketType memory)
    {
        return ticketTypes[_tokenId];
    }
}
