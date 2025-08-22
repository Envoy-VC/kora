import {
  createInstance,
  type FhevmInstance,
  initSDK,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/bundle";
import { create } from "zustand";

interface FheVmStore {
  fhevm: FhevmInstance | undefined;
  setFhevm: (instance: FhevmInstance) => void;
}

const useFhevmStore = create<FheVmStore>((set) => ({
  fhevm: undefined,
  setFhevm: (instance: FhevmInstance) => set({ fhevm: instance }),
}));

export const useFhevm = () => {
  const { fhevm, setFhevm } = useFhevmStore();

  const getFhevmInstance = async () => {
    if (!fhevm) {
      await initSDK();
      const instance = await createInstance(SepoliaConfig);
      setFhevm(instance);
      return instance;
    }
    return fhevm;
  };

  return { getFhevmInstance };
};
