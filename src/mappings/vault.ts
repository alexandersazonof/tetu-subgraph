import { Withdraw, Deposit, AddedRewardToken, RemovedRewardToken } from "../../generated/templates/Vault/Vault";
import { Vault } from "../../generated/schema";
import { Address, log } from "@graphprotocol/graph-ts";
import { fetchGetPrice, fetchPricePerFullShare, fetchRewardTokens } from "./helper";


export function handleDeposit(event: Deposit): void {
  const address = event.address
  const addressString = event.address.toHexString()
  const amount = event.params.amount
  log.log(log.Level.INFO, `handleDeposit address: ${addressString}, amount: ${addressString}`)

  let vault = Vault.load(addressString)
  if (vault == null) {
    log.log(log.Level.CRITICAL, `can not find vault by address: ${addressString}`)
    return;
  }
  vault.tvl = vault.tvl.plus(amount)
  vault.tvlUsdc = fetchGetPrice(Address.fromString(vault.underlying)) * vault.tvl
  vault.pricePerFullShare = fetchPricePerFullShare(address)
  vault.save()
}

export function handleWithdraw(event: Withdraw): void {
  const address = event.address
  const addressString = event.address.toHexString()
  const amount = event.params.amount
  log.log(log.Level.INFO, `handleWithdraw address: ${addressString}`)

  let vault = Vault.load(addressString)
  if (vault == null) {
    log.log(log.Level.CRITICAL, `can not find vault by address: ${addressString}`)
    return;
  }
  vault.tvl = vault.tvl.minus(amount)
  vault.tvlUsdc = fetchGetPrice(Address.fromString(vault.underlying)) * vault.tvl
  vault.pricePerFullShare = fetchPricePerFullShare(address)
  vault.save()
}

export function handleAddedRewardToken(event: AddedRewardToken): void {
  const address = event.address
  log.log(log.Level.INFO, `handleAddedRewardToken address: ${address.toHexString()}`)
  updateRewardToken(address)
}

export function handleRemovedRewardToken(event: RemovedRewardToken): void {
  const address = event.address
  log.log(log.Level.INFO, `handleRemovedRewardToken address: ${address.toHexString()}`)
  updateRewardToken(address)
}

export function updateRewardToken(address: Address): void {
  const addressString = address.toHexString()
  log.log(log.Level.INFO, `updateRewardToken address: ${addressString}`)
  let vault = Vault.load(addressString)
  if (vault == null) {
    log.log(log.Level.CRITICAL, `can not find vault by address: ${addressString}`)
    return;
  }
  vault.rewardTokens = fetchRewardTokens(address).map<string>((rewardToken: Address) => rewardToken.toHexString())
  vault.save()
}