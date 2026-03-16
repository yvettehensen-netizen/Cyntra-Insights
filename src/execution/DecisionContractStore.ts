import { DecisionContract } from "./types";

let contracts: DecisionContract[] = [];

export function addContract(contract: DecisionContract) {
  contracts.push(contract);
}

export function getContracts(): DecisionContract[] {
  return contracts;
}
