import { clearStore, test, assert, createMockedFunction } from 'matchstick-as/assembly/index'
import { Vault } from "../../generated/schema";
import { createNewVaultAndStrategyEvent, handleVaultAndStrategies } from "./utils";
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';

test('Can call mappings with custom events', () => {
  let vaultAddress = '0x002fe8b38f7c261dddd2125875413a6ebd7e40d3'
  let strategyAddress = '0x72db26d79fbd94ad7b84c5508c9720ae8528b347'
  let underlyingAddress = '0x302fe8b38f7c261dddd2125875413a6ebd7e40d1';
  let vault = new Vault(vaultAddress)
  let vaultContract = Address.fromString(vaultAddress)
  let strategyContract = Address.fromString(strategyAddress)
  let underlyingContract = Address.fromString(underlyingAddress)


  vault.save()
  let newAddVaultAndStrategy = createNewVaultAndStrategyEvent(vaultAddress, strategyAddress)
  // strategy
  createMockedFunction(strategyContract, 'decimals', 'decimals():(uint8)')
    .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(18))])
  createMockedFunction(strategyContract, 'name', 'name():(string)')
    .returns([ethereum.Value.fromString('xVault')])
  createMockedFunction(strategyContract, 'symbol', 'symbol():(string)')
    .returns([ethereum.Value.fromString('xx')])

  // underlying
  createMockedFunction(underlyingContract, 'decimals', 'decimals():(uint8)')
    .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(18))])

  // vault
  createMockedFunction(vaultContract, 'name', 'name():(string)')
    .returns([ethereum.Value.fromString('xVault')])
  createMockedFunction(vaultContract, 'decimals', 'decimals():(uint8)')
    .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(18))])
  createMockedFunction(vaultContract, 'symbol', 'symbol():(string)')
    .returns([ethereum.Value.fromString('xx')])
  createMockedFunction(vaultContract, 'underlying', 'underlying():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString(underlyingAddress))])


  createMockedFunction(vaultContract, 'rewardTokens', 'rewardTokens():(address[])')
    .returns([ethereum.Value.fromArray(
      [ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b347'))]
    )])

  // controller
  createMockedFunction(newAddVaultAndStrategy.address, 'controller', 'controller():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'bookkeeper', 'bookkeeper():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'announcer', 'announcer():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'dao', 'dao():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'distributor', 'distributor():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'feeRewardForwarder', 'feeRewardForwarder():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'fund', 'fund():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'fundToken', 'fundToken():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'governance', 'governance():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'mintHelper', 'mintHelper():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'psVault', 'psVault():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'rewardToken', 'rewardToken():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])
  createMockedFunction(newAddVaultAndStrategy.address, 'vaultController', 'vaultController():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x72db26d79fbd94ad7b84c5508c9720ae8528b342'))])


  handleVaultAndStrategies([newAddVaultAndStrategy])
  assert.fieldEquals('Vault', vaultAddress, 'id', vaultAddress)
  assert.fieldEquals('Vault', vaultAddress, 'name', 'xVault')
  clearStore()
})