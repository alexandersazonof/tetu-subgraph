import { Withdraw, Deposit, AddedRewardToken, RemovedRewardToken } from "../../generated/templates/Vault/Vault";
import { PPFS, TVL, Underlying, Vault } from "../../generated/schema";
import { Address, ethereum, log } from "@graphprotocol/graph-ts";
import { fetchGetPrice, fetchPricePerFullShare, fetchRewardTokens, toNumber } from "./helper";


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

  const underlying = Underlying.load(vault.underlying)
  if (underlying == null) {
    log.log(log.Level.CRITICAL, `can not find underlying by address: ${vault.underlying}`)
    return;
  }

  // @ts-ignore
  vault.tvlUsdc = toNumber(fetchGetPrice(Address.fromString(underlying.id)), underlying.decimals) * vault.tvl.toBigDecimal()

  vault.pricePerFullShare = fetchPricePerFullShare(address)
  vault.save()

  createTvl(vault, event)
  createPpfs(vault, event)
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

  const underlying = Underlying.load(vault.underlying)
  if (underlying == null) {
    log.log(log.Level.CRITICAL, `can not find underlying by address: ${vault.underlying}`)
    return;
  }

  // @ts-ignore
  vault.tvlUsdc = toNumber(fetchGetPrice(Address.fromString(underlying.id)), underlying.decimals) * vault.tvl.toBigDecimal()
  vault.pricePerFullShare = fetchPricePerFullShare(address)
  vault.save()

  createTvl(vault, event)
  createPpfs(vault, event)
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
  // @ts-ignore
  vault.rewardTokens = fetchRewardTokens(address).map<string>((rewardToken: Address) => rewardToken.toHexString())
  vault.save()
}

export function createTvl(vault: Vault, event: ethereum.Event): void {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let tvl = TVL.load(id)
  if (tvl == null) {
    tvl = new TVL(id)
  }
  tvl.value = vault.tvl
  tvl.valueUsdc = vault.tvlUsdc
  tvl.address = vault.id
  tvl.block = event.block.number
  tvl.timestamp = event.block.timestamp
  tvl.save()
}

export function createPpfs(vault: Vault, event: ethereum.Event): void {
  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let ppfs = PPFS.load(id)
  if (ppfs == null) {
    ppfs = new PPFS(id)
  }
  ppfs.value = vault.pricePerFullShare
  ppfs.address = vault.id
  ppfs.block = event.block.number
  ppfs.timestamp = event.block.timestamp
  ppfs.save()
}