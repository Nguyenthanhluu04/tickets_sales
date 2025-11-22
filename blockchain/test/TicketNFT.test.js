const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TicketNFT", function () {
  let ticketNFT;
  let owner, addr1, addr2, organizer;
  const BASE_URI = "https://gateway.pinata.cloud/ipfs/";

  beforeEach(async function () {
    [owner, addr1, addr2, organizer] = await ethers.getSigners();

    const TicketNFT = await ethers.getContractFactory("TicketNFT");
    ticketNFT = await TicketNFT.deploy(BASE_URI, owner.address);
    await ticketNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct base URI", async function () {
      expect(await ticketNFT.uri(0)).to.include("pinata");
    });

    it("Should grant admin role to deployer", async function () {
      const ADMIN_ROLE = await ticketNFT.ADMIN_ROLE();
      expect(await ticketNFT.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct name and symbol", async function () {
      expect(await ticketNFT.name()).to.equal("Event Ticket NFT");
      expect(await ticketNFT.symbol()).to.equal("TICKET");
    });
  });

  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const now = await time.latest();
      const startTime = now + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours duration

      const tx = await ticketNFT.createEvent(
        "Test Event",
        "Test Description",
        startTime,
        endTime
      );

      await expect(tx)
        .to.emit(ticketNFT, "EventCreated")
        .withArgs(0, "Test Event", owner.address, startTime, endTime);

      const event = await ticketNFT.getEvent(0);
      expect(event.name).to.equal("Test Event");
      expect(event.organizer).to.equal(owner.address);
      expect(event.isActive).to.be.true;
    });

    it("Should fail if start time is in the past", async function () {
      const now = await time.latest();
      const startTime = now - 3600;
      const endTime = now + 3600;

      await expect(
        ticketNFT.createEvent("Test Event", "Description", startTime, endTime)
      ).to.be.revertedWith("Start time must be in future");
    });

    it("Should fail if end time is before start time", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime - 1800;

      await expect(
        ticketNFT.createEvent("Test Event", "Description", startTime, endTime)
      ).to.be.revertedWith("End time must be after start time");
    });

    it("Should grant organizer role to event creator", async function () {
      const now = await time.latest();
      const startTime = now + 3600;
      const endTime = startTime + 7200;

      await ticketNFT.connect(organizer).createEvent(
        "Test Event",
        "Description",
        startTime,
        endTime
      );

      const ORGANIZER_ROLE = await ticketNFT.ORGANIZER_ROLE();
      expect(await ticketNFT.hasRole(ORGANIZER_ROLE, organizer.address)).to.be.true;
    });
  });

  describe("Ticket Type Creation", function () {
    let eventId;
    let startTime, endTime;

    beforeEach(async function () {
      const now = await time.latest();
      startTime = now + 86400; // 1 day from now
      endTime = startTime + 86400; // 1 day duration

      await ticketNFT.createEvent(
        "Test Event",
        "Description",
        startTime,
        endTime
      );
      eventId = 0;
    });

    it("Should create a ticket type successfully", async function () {
      const price = ethers.parseEther("0.1");
      const maxSupply = 100;
      const saleStart = await time.latest() + 3600;
      const saleEnd = startTime - 3600;

      const tx = await ticketNFT.createTicketType(
        eventId,
        "VIP Pass",
        price,
        maxSupply,
        saleStart,
        saleEnd
      );

      await expect(tx)
        .to.emit(ticketNFT, "TicketTypeCreated")
        .withArgs(0, eventId, "VIP Pass", price, maxSupply);

      const ticketType = await ticketNFT.getTicketType(0);
      expect(ticketType.name).to.equal("VIP Pass");
      expect(ticketType.price).to.equal(price);
      expect(ticketType.maxSupply).to.equal(maxSupply);
    });

    it("Should fail if not authorized", async function () {
      const price = ethers.parseEther("0.1");
      const saleStart = await time.latest() + 3600;
      const saleEnd = startTime - 3600;

      await expect(
        ticketNFT.connect(addr1).createTicketType(
          eventId,
          "VIP Pass",
          price,
          100,
          saleStart,
          saleEnd
        )
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail if event is not active", async function () {
      await ticketNFT.updateEventStatus(eventId, false);

      const price = ethers.parseEther("0.1");
      const saleStart = await time.latest() + 3600;
      const saleEnd = startTime - 3600;

      await expect(
        ticketNFT.createTicketType(
          eventId,
          "VIP Pass",
          price,
          100,
          saleStart,
          saleEnd
        )
      ).to.be.revertedWith("Event not active");
    });
  });

  describe("Ticket Purchase", function () {
    let eventId, tokenId;
    let startTime, endTime;

    beforeEach(async function () {
      const now = await time.latest();
      startTime = now + 86400;
      endTime = startTime + 86400;

      await ticketNFT.createEvent(
        "Test Event",
        "Description",
        startTime,
        endTime
      );
      eventId = 0;

      const price = ethers.parseEther("0.1");
      const saleStart = now + 3600;
      const saleEnd = startTime - 3600;

      await ticketNFT.createTicketType(
        eventId,
        "Regular Pass",
        price,
        100,
        saleStart,
        saleEnd
      );
      tokenId = 0;

      // Fast forward to sale start
      await time.increaseTo(saleStart);
    });

    it("Should purchase ticket successfully", async function () {
      const price = ethers.parseEther("0.1");
      const amount = 2;

      const tx = await ticketNFT.connect(addr1).purchaseTicket(tokenId, amount, {
        value: price * BigInt(amount),
      });

      await expect(tx)
        .to.emit(ticketNFT, "TicketPurchased")
        .withArgs(tokenId, eventId, addr1.address, amount, price);

      expect(await ticketNFT.balanceOf(addr1.address, tokenId)).to.equal(amount);
      expect(await ticketNFT.totalSupply(tokenId)).to.equal(amount);
    });

    it("Should fail if payment is insufficient", async function () {
      const price = ethers.parseEther("0.1");
      const insufficientPayment = ethers.parseEther("0.05");

      await expect(
        ticketNFT.connect(addr1).purchaseTicket(tokenId, 1, {
          value: insufficientPayment,
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should refund excess payment", async function () {
      const price = ethers.parseEther("0.1");
      const excessPayment = ethers.parseEther("0.2");

      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      const tx = await ticketNFT.connect(addr1).purchaseTicket(tokenId, 1, {
        value: excessPayment,
      });

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      const expectedBalance = balanceBefore - price - gasUsed;
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should fail if exceeds max supply", async function () {
      const price = ethers.parseEther("0.1");

      await expect(
        ticketNFT.connect(addr1).purchaseTicket(tokenId, 101, {
          value: price * BigInt(101),
        })
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should fail if sale not active", async function () {
      // Fast forward past sale end time
      const ticketType = await ticketNFT.getTicketType(tokenId);
      await time.increaseTo(Number(ticketType.endSaleTime) + 1);

      const price = ethers.parseEther("0.1");

      await expect(
        ticketNFT.connect(addr1).purchaseTicket(tokenId, 1, {
          value: price,
        })
      ).to.be.revertedWith("Sale not active");
    });
  });

  describe("Admin Functions", function () {
    it("Should withdraw funds", async function () {
      // Setup and purchase ticket to get funds in contract
      const now = await time.latest();
      const startTime = now + 86400;
      const endTime = startTime + 86400;

      await ticketNFT.createEvent("Event", "Desc", startTime, endTime);

      const price = ethers.parseEther("0.1");
      const saleStart = now + 3600;
      const saleEnd = startTime - 3600;

      await ticketNFT.createTicketType(0, "Pass", price, 100, saleStart, saleEnd);
      await time.increaseTo(saleStart);

      await ticketNFT.connect(addr1).purchaseTicket(0, 1, { value: price });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ticketNFT.getBalance();

      const tx = await ticketNFT.withdraw(owner.address);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter).to.equal(balanceBefore + contractBalance - gasUsed);
      expect(await ticketNFT.getBalance()).to.equal(0);
    });

    it("Should pause and unpause contract", async function () {
      await ticketNFT.pause();

      const now = await time.latest();
      await expect(
        ticketNFT.createEvent("Event", "Desc", now + 3600, now + 7200)
      ).to.be.revertedWithCustomError(ticketNFT, "EnforcedPause");

      await ticketNFT.unpause();

      await expect(
        ticketNFT.createEvent("Event", "Desc", now + 3600, now + 7200)
      ).to.not.be.reverted;
    });
  });

  describe("Get Functions", function () {
    it("Should get event ticket types", async function () {
      const now = await time.latest();
      const startTime = now + 86400;
      const endTime = startTime + 86400;

      await ticketNFT.createEvent("Event", "Desc", startTime, endTime);

      const price = ethers.parseEther("0.1");
      const saleStart = now + 3600;
      const saleEnd = startTime - 3600;

      await ticketNFT.createTicketType(0, "Pass1", price, 100, saleStart, saleEnd);
      await ticketNFT.createTicketType(0, "Pass2", price, 200, saleStart, saleEnd);

      const ticketTypes = await ticketNFT.getEventTicketTypes(0);
      expect(ticketTypes.length).to.equal(2);
      expect(ticketTypes[0]).to.equal(0);
      expect(ticketTypes[1]).to.equal(1);
    });
  });
});
