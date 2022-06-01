import { ERC20 } from "../../generated/Controller/ERC20";
import { ERC20SymbolBytes } from "../../generated/Controller/ERC20SymbolBytes";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC20NameBytes } from "../../generated/Controller/ERC20NameBytes";
import { Vault } from "../../generated/templates/Vault/Vault";

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  // hardcode overrides
  let contract = ERC20.bind(tokenAddress)
  // try types uint8 for decimals
  // @ts-ignore
  let decimalValue: i32
  let decimalResult = contract.try_decimals()
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }
  // @ts-ignore
  return BigInt.fromI32(decimalValue as i32)
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress)

  // try types string and bytes32 for name
  let nameValue = 'unknown'
  let nameResult = contract.try_name()
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name()
    if (!nameResultBytes.reverted) {
      // for broken exchanges that have no name function exposed
      if (!isNullEthValue(nameResultBytes.value.toHexString())) {
        nameValue = nameResultBytes.value.toString()
      }
    }
  } else {
    nameValue = nameResult.value
  }

  return nameValue
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress)
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

  // try types string and bytes32 for symbol
  let symbolValue = 'unknown'
  let symbolResult = contract.try_symbol()
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol()
    if (!symbolResultBytes.reverted) {
      // for broken pairs that have no symbol function exposed
      if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
        symbolValue = symbolResultBytes.value.toString()
      }
    }
  } else {
    symbolValue = symbolResult.value
  }

  return symbolValue
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function fetchUnderlying(address: Address): Address {
  const contract = Vault.bind(address)
  return contract.underlying()
}