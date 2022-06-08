import { clearStore, test, assert, createMockedFunction } from 'matchstick-as/assembly/index'
import { Vault } from "../../generated/schema";
import { createNewVaultAndStrategyEvent, handleVaultAndStrategies } from "./utils";
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';

test('Can call mappings with custom events', () => {
  let vaultAddress = '0x002fe8b38f7c261dddd2125875413a6ebd7e40d3'
  let strategyAddress = '0x72db26d79fbd94ad7b84c5508c9720ae8528b347'
  let vault = new Vault(vaultAddress)
  let vaultContract = Address.fromString(vaultAddress)
  let strategyContract = Address.fromString(strategyAddress)

  vault.save()
  let newAddVaultAndStrategy = createNewVaultAndStrategyEvent(vaultAddress, strategyAddress)
  createMockedFunction(vaultContract, 'name', 'name():(string)')
    .returns([ethereum.Value.fromString('xVault')])
  createMockedFunction(vaultContract, 'decimals', 'decimals():(uint8)')
    .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(18))])
  createMockedFunction(vaultContract, 'symbol', 'symbol():(string)')
    .returns([ethereum.Value.fromString('xx')])
  createMockedFunction(vaultContract, 'underlying', 'underlying():(address)')
    .returns([ethereum.Value.fromAddress(Address.fromString('0x302fe8b38f7c261dddd2125875413a6ebd7e40d3'))])

  createMockedFunction(strategyContract, 'decimals', 'decimals():(uint8)')
    .returns([ethereum.Value.fromSignedBigInt(BigInt.fromI32(18))])
  createMockedFunction(strategyContract, 'name', 'name():(string)')
    .returns([ethereum.Value.fromString('xVault')])
  createMockedFunction(strategyContract, 'symbol', 'symbol():(string)')
    .returns([ethereum.Value.fromString('xx')])

  handleVaultAndStrategies([newAddVaultAndStrategy])
  assert.fieldEquals('Vault', vaultAddress, 'id', vaultAddress)
  assert.fieldEquals('Vault', vaultAddress, 'name', 'xVault')
  clearStore()
})