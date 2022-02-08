const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

describe("MyCoin Contract", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("MyCoin");
    [owner, addr1] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
      const ownerBalanceNumber = parseInt(utils.formatEther(ownerBalance));
      expect(ownerBalanceNumber).to.equal(1000);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      const addr1InitialBalance = await hardhatToken.balanceOf(addr1.address);
      const addr1InitialBalanceNumber = parseInt(
        utils.formatEther(addr1InitialBalance)
      );
      await hardhatToken.transfer(addr1.address, utils.parseEther("50"));
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      const addr1BalanceNumber = parseInt(utils.formatEther(addr1Balance));
      expect(addr1BalanceNumber).to.equal(addr1InitialBalanceNumber + 50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      const initialOwnerBalanceNumber = parseInt(
        utils.formatEther(initialOwnerBalance)
      );
      await hardhatToken
        .connect(addr1)
        .transfer(owner.address, utils.parseEther("50"));
      const addr2Balance = await hardhatToken.balanceOf(owner.address);
      const addr2BalanceNumber = parseInt(utils.formatEther(addr2Balance));
      expect(addr2BalanceNumber).to.equal(initialOwnerBalanceNumber + 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken
          .connect(addr1)
          .transfer(owner.address, utils.parseEther("1"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);
      const initialOwnerBalanceNumber = parseInt(
        utils.formatEther(initialOwnerBalance)
      );

      // Transfer 100 tokens from owner to addr1.
      await hardhatToken.transfer(addr1.address, utils.parseEther("100"));

      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      const finalOwnerBalanceNumber = parseInt(
        utils.formatEther(finalOwnerBalance)
      );
      expect(initialOwnerBalanceNumber).to.equal(finalOwnerBalanceNumber + 100);

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      const addr1BalanceNumber = parseInt(utils.formatEther(addr1Balance));
      expect(addr1BalanceNumber).to.equal(100);
    });
  });

  describe("mint or burn", function () {
    it("Should increase or decrease balance after minting or burning", async function () {
      const initialAddr1Balance = await hardhatToken.balanceOf(addr1.address);
      const initialAddr1BalanceNumber = parseInt(
        utils.formatEther(initialAddr1Balance)
      );
      //Mint 100 tokens to addr1.
      await hardhatToken.mint(addr1.address, utils.parseEther("100"));
      //Check balances.
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      const addr1BalanceNumber = parseInt(utils.formatEther(addr1Balance));
      expect(addr1BalanceNumber).to.equal(initialAddr1BalanceNumber + 100);

      await hardhatToken.burnFrom(addr1.address, utils.parseEther("30"));
      //Check balances.
      const addr1Balance1 = await hardhatToken.balanceOf(addr1.address);
      const addr1Balance1Number = parseInt(utils.formatEther(addr1Balance1));
      expect(addr1Balance1Number).to.equal(addr1BalanceNumber - 30);
    });
  });
});
