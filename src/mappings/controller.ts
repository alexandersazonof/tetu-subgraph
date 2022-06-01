import { VaultAndStrategyAdded } from "../../generated/Controller/Controller";
import { Strategy, Vault } from "../../generated/schema";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchUnderlying } from "./helper";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function handleVaultAndStrategy(event: VaultAndStrategyAdded): void {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  const strategyAddress = event.params.strategy
  const vaultAddress = event.params.vault

  let strategy = Strategy.load(id)

  if (strategy == null) {
    strategy = new Strategy(id);
  }
  strategy.address = strategyAddress.toHexString()
  strategy.name = fetchTokenName(strategyAddress)
  strategy.decimals = fetchTokenDecimals(strategyAddress)
  strategy.symbol = fetchTokenSymbol(strategyAddress)
  strategy.save()

  let vault = Vault.load(id)
  if (vault == null) {
    vault = new Vault(id);
    vault.txCount = 0
  }
  vault.txCount = vault.txCount + 1
  vault.strategy = strategy.id
  vault.address = event.params.vault.toHexString()
  vault.name = fetchTokenName(vaultAddress)
  vault.decimals = fetchTokenDecimals(vaultAddress)
  vault.symbol = fetchTokenSymbol(vaultAddress)
  vault.active = true
  vault.underlying = fetchUnderlying(vaultAddress).toHexString()
  vault.tvl = BigInt.fromString('0')
  vault.save()
}