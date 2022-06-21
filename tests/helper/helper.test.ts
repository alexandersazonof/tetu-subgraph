import { assert, test } from "matchstick-as/assembly/index";
import { toNumber } from "../../src/mappings/helper";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

test('convert number',() => {
  const result = toNumber(BigInt.fromI64(9977953881804439), BigInt.fromI64(18))
  assert.assertTrue(result == BigDecimal.fromString('0.009977953881804439'))
})