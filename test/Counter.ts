import { expect } from "chai";
import { ethers } from "hardhat";

describe("Counter", function () {
  it("Should emit the Increment event when calling the inc() function", async function () {
    const counterFactory = await ethers.getContractFactory("Counter");
    const counter = await counterFactory.deploy();
    await counter.deployed();

    await expect(counter.inc()).to.emit(counter, "Increment").withArgs(1);
  });

  it("The sum of the Increment events should match the current value", async function () {
    const counterFactory = await ethers.getContractFactory("Counter");
    const counter = await counterFactory.deploy();
    await counter.deployed();
    
    const deploymentBlockNumber = await ethers.provider.getBlockNumber();

    // run a series of increments
    for (let i = 1; i <= 10; i++) {
      await counter.incBy(i);
    }

    const events = await counter.queryFilter(
      counter.filters.Increment(),
      deploymentBlockNumber,
      "latest",
    );

    // check that the aggregated events match the current value
    let total = 0;
    for (const event of events) {
      total += event.args.by.toNumber();
    }

    const currentValue = await counter.x();
    expect(currentValue.toNumber()).to.equal(total);
  });
});