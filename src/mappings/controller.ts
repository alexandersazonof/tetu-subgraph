import { UpdatedAddressSlot, VaultAndStrategyAdded, Controller } from "../../generated/Controller/Controller";
import { Strategy, TetuContract, Underlying, Vault } from "../../generated/schema";
import { Vault as VaultTemplate } from "../../generated/templates";
import { fetchRewardTokens, fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchUnderlying } from "./helper";
import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

const DEFAULT_PPFS = '1000000000000000000'

export function handleVaultAndStrategy(event: VaultAndStrategyAdded): void {
  const controllerAddress = event.address
  const tx = event.transaction.hash.toHex()
  const block = event.block.number.toI32()
  log.log(log.Level.INFO, `handleVaultAndStrategy tx ${tx}, vault: ${event.params.vault.toHexString()}, strategy: ${event.params.strategy.toHexString()}`)
  const strategyAddress = event.params.strategy
  const vaultAddress = event.params.vault

  let strategy = Strategy.load(strategyAddress.toHexString())

  if (strategy == null) {
    strategy = new Strategy(strategyAddress.toHexString());
  }
  strategy.name = fetchTokenName(strategyAddress)
  strategy.decimals = fetchTokenDecimals(strategyAddress)
  strategy.symbol = fetchTokenSymbol(strategyAddress)
  strategy.save()
  log.log(log.Level.INFO, 'strategy saved')

  let underlyingAddress = fetchUnderlying(vaultAddress)
  let underlying = Underlying.load(underlyingAddress.toHexString())

  if (underlying == null) {
    underlying = new Underlying(underlyingAddress.toHexString())
  }
  underlying.decimals = fetchTokenDecimals(underlyingAddress)
  underlying.save()
  log.log(log.Level.INFO, 'underlying saved')

  let vault = Vault.load(vaultAddress.toHexString())
  VaultTemplate.create(vaultAddress)
  if (vault == null) {
    vault = new Vault(vaultAddress.toHexString());
  }
  vault.createdAtBlock = event.block.number
  vault.strategy = strategy.id
  vault.name = fetchTokenName(vaultAddress)
  vault.decimals = fetchTokenDecimals(vaultAddress)
  vault.symbol = fetchTokenSymbol(vaultAddress)
  vault.active = true
  vault.underlying = underlying.id
  vault.tvl = BigInt.fromString('0')
  vault.tvlUsdc = BigDecimal.fromString('0')

  // default value for ppfs is 1000000000000000000
  vault.pricePerFullShare = BigInt.fromString(DEFAULT_PPFS)
  // @ts-ignore
  vault.rewardTokens = fetchRewardTokens(vaultAddress).map<string>((rewardToken: Address) => rewardToken.toHexString())
  vault.save()
  log.log(log.Level.INFO, 'vault saved')
  updateContractMetadata(controllerAddress, block)
}

export function handleUpdatedAddressSlot(event: UpdatedAddressSlot): void {
  log.log(log.Level.INFO, `handleUpdatedAddressSlot name is ${event.params.name}`)
}

function updateContractMetadata(address: Address, block: number): void {
  log.log(log.Level.INFO, `updateContractMetadata name is ${address.toHexString()}`)

  let contract = Controller.bind(address)

  // controller
  let controller = TetuContract.load('Controller')
  if (controller == null) {
    controller = new TetuContract('Controller')
  }
  controller.address = contract.controller().toHexString()
  controller.save()

  // bookkeeper
  let bookkeeper = TetuContract.load('Bookkeeper')
  if (bookkeeper == null) {
    bookkeeper = new TetuContract('Bookkeeper')
  }
  bookkeeper.address = contract.bookkeeper().toHexString()
  bookkeeper.save()

  // announcer
  let announcer = TetuContract.load('Annoouncer')
  if (announcer == null) {
    announcer = new TetuContract('Annoouncer')
  }
  announcer.address = contract.announcer().toHexString()
  announcer.save()

  // dao
  let dao = TetuContract.load('Dao')
  if (dao == null) {
    dao = new TetuContract('Dao')
  }
  dao.address = contract.dao().toHexString()
  dao.save()

  // distributor
  let distributorResult = contract.try_distributor()
  if (!distributorResult.reverted) {
    let distributor = TetuContract.load('Distributor')
    if (distributor == null) {
      distributor = new TetuContract('Distributor')
    }
    distributor.address = distributorResult.value.toHexString()
    distributor.save()
  }


  // feeRewardForwarder
  let feeRewardForwarder = TetuContract.load('FeeRewardForwarder')
  if (feeRewardForwarder == null) {
    feeRewardForwarder = new TetuContract('FeeRewardForwarder')
  }
  feeRewardForwarder.address = contract.feeRewardForwarder().toHexString()
  feeRewardForwarder.save()

  // fund
  let fund = TetuContract.load('Fund')
  if (fund == null) {
    fund = new TetuContract('Fund')
  }
  fund.address = contract.fund().toHexString()
  fund.save()

  // fundToken
  let fundToken = TetuContract.load('FundToken')
  if (fundToken == null) {
    fundToken = new TetuContract('FundToken')
  }
  fundToken.address = contract.fundToken().toHexString()
  fundToken.save()

  // governance
  let governance = TetuContract.load('Governance')
  if (governance == null) {
    governance = new TetuContract('Governance')
  }
  governance.address = contract.governance().toHexString()
  governance.save()

  // mintHelper
  let mintHelper = TetuContract.load('MintHelper')
  if (mintHelper == null) {
    mintHelper = new TetuContract('MintHelper')
  }
  mintHelper.address = contract.mintHelper().toHexString()
  mintHelper.save()

  // psVault
  let psVault = TetuContract.load('PsVault')
  if (psVault == null) {
    psVault = new TetuContract('PsVault')
  }
  psVault.address = contract.psVault().toHexString()
  psVault.save()

  // rewardToken
  let rewardToken = TetuContract.load('RewardToken')
  if (rewardToken == null) {
    rewardToken = new TetuContract('RewardToken')
  }
  rewardToken.address = contract.rewardToken().toHexString()
  rewardToken.save()

  // vaultController
  let vaultControllerResponse = contract.try_vaultController()
  if (!vaultControllerResponse.reverted) {
    log.log(log.Level.INFO, `vaultController reverted, value: ${vaultControllerResponse.value.toHexString()}`)
    let vaultController = TetuContract.load('VaultController')
    if (vaultController == null) {
      vaultController = new TetuContract('VaultController')
    }
    vaultController.address = vaultControllerResponse.value.toHexString()
    vaultController.save()
  }
  log.log(log.Level.INFO, `updateContractMetadata end`)
}