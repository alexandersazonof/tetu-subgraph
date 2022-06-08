import { handleVaultAndStrategy } from "../../src/mappings/controller";
import { VaultAndStrategyAdded } from "../../generated/Controller/Controller";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index"

export function handleVaultAndStrategies(events: VaultAndStrategyAdded[]): void {
  events.forEach(event => {
    handleVaultAndStrategy(event)
  })
}

export function createNewVaultAndStrategyEvent(vault: string, strategy: string): VaultAndStrategyAdded {
  let mockEvent = newMockEvent()
  let vaultAndStrategy = new VaultAndStrategyAdded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  vaultAndStrategy.parameters = []
  let vaultParam = new ethereum.EventParam("vault", ethereum.Value.fromAddress(Address.fromString(vault)))
  let strategyParam = new ethereum.EventParam("strategy", ethereum.Value.fromAddress(Address.fromString(strategy)))

  vaultAndStrategy.parameters.push(vaultParam)
  vaultAndStrategy.parameters.push(strategyParam)

  return vaultAndStrategy
}