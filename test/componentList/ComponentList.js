const log = require("../utils/log");
const ComponentList = artifacts.require("ComponentList");
const MockComponent = artifacts.require("MockComponent");

contract("ComponetList", accounts => {
  let list;
  before("ComponentList Test", async () => {
    list = await ComponentList.new();
  });
  it("Set and Get ", async () =>
    log.catch(async () => {
      const mockComponent = await MockComponent.new("New");
      await list.setComponent("reiumbrsable", mockComponent.address, { from: accounts[0] });
      const component = await list.getComponent("reiumbrsable", await mockComponent.version());
      assert.equal(component, mockComponent.address, "Checking the address is correct");
    }));

  it("Override component", async () =>
    log.catch(async () => {
      const olderMockComponent = await MockComponent.new("Older");
      const newMockComponent = await MockComponent.new("New");
      // set olderMockComponent's address into componentList contract.
      await list.setComponent("reiumbrsable", olderMockComponent.address, { from: accounts[0] });
      let component = await list.getComponent("reiumbrsable", await olderMockComponent.version());
      assert.equal(component, olderMockComponent.address, "Checking the address is correct");
      // Override the olderMockComponent's address
      await list.setComponent("reiumbrsable", newMockComponent.address, { from: accounts[0] });
      component = await list.getComponent("reiumbrsable", await newMockComponent.version());
      assert.equal(
        component,
        newMockComponent.address,
        "Override the component successfully: it is the same with newMockComponent"
      );
      assert.notEqual(
        component,
        olderMockComponent.address,
        "Override the component successfully: olderMockComponent is different with the address from component list"
      );
    }));

  it("update version", async () =>
    log.catch(async () => {
      const mockComponentV1 = await MockComponent.new("V1");
      const mockComponentV2 = await MockComponent.new("V2");
      // set olderMockComponent's address into componentList contract.
      await list.setComponent("reiumbrsable", mockComponentV1.address, { from: accounts[0] });
      await list.setComponent("reiumbrsable", mockComponentV2.address, { from: accounts[0] });
      //mockComponentV1
      let component = await list.getComponent("reiumbrsable", await mockComponentV1.version());
      assert.equal(component, mockComponentV1.address, "mockComponentV1's address is correct");
      //mockComponentV2
      component = await list.getComponent("reiumbrsable", await mockComponentV2.version());
      assert.equal(component, mockComponentV2.address, "mockComponentV2's address is correct");
    }));
});
