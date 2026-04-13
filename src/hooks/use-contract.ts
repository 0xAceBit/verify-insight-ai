import { useMemo } from "react";
import Web3Evaluator from "@/lib/contracts/Web3Evaluator";
import { useWallet } from "@/lib/genlayer/WalletProvider";

/**
 * Hook that returns a Web3Evaluator contract instance,
 * automatically bound to the connected wallet address.
 */
export function useContract() {
  const { address } = useWallet();

  const contract = useMemo(
    () => new Web3Evaluator(undefined, address),
    [address]
  );

  return contract;
}
