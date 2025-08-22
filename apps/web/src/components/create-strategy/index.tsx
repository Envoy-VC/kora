import { CreateStrategyForm } from "./create-strategy-form";

export const CreateStrategy = () => {
  return (
    <div className="card-gradient flex w-full max-w-xl flex-col gap-2 rounded-3xl border p-6">
      <div className="flex flex-col gap-2">
        <div className="w-fit font-medium text-neutral-100 text-xl">
          Create Your Strategy
        </div>
        <p className="text-neutral-400 text-sm">
          Define how you want Kora to execute your DCA plan. Choose tokens, set
          amounts, and lock in frequency all encrypted with FHE so your strategy
          remains completely private while still running trustlessly on-chain.
        </p>
      </div>
      <div className="pt-5">
        <CreateStrategyForm />
      </div>
    </div>
  );
};
