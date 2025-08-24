import { run } from "hardhat";

const verify = async () => {
  const usdcAddress = "0x2d83Fff32862A6FBB7518DBfEa113979B8631797";
  const wethAddress = "0x0C013Aa8CfE54Af1D892759fBc35F8835Ad163F7";
  const eUSDCAddress = "0xCe4Fd687fa2EFE9a04d8745753C9E364DF91De1E";
  const eWETHAddress = "0xE6184Bb67cd3B797C7e36DC460c83a7A5AB87063";
  const budgetHookAddress = "0x1A34059f5015362fBa4255B9ef30e884a7B142E4";
  const purchaseAmountHookAddress =
    "0xC92e075c52F2Fe38d6389aC2b39bEE5788C341c2";
  const timeframeHookAddress = "0x9dc301778C7EE60E30C7F8F89814bC5b7b3c4F41";
  const frequencyHookAddress = "0xD7e7a322EaADA366C718e487FD3f2255a95C092f";
  const koraExecutorAddress = "0xc82Fa85409D50De86396dCb57C08506522C33991";
  const deployerAddress = "0x9A36a8EDAF9605F7D4dDC72F4D81463fb6f841d8";

  await run("verify:verify", {
    address: usdcAddress,
    constructorArguments: [deployerAddress, "USDC", "USDC"],
  });
  await run("verify:verify", {
    address: wethAddress,
    constructorArguments: [deployerAddress, "WETH", "WETH"],
  });
  await run("verify:verify", {
    address: eUSDCAddress,
    constructorArguments: [
      "Encrypted USDC",
      "eUSDC",
      deployerAddress,
      usdcAddress,
    ],
  });
  await run("verify:verify", {
    address: eWETHAddress,
    constructorArguments: [
      "Encrypted WETH",
      "eWETH",
      deployerAddress,
      wethAddress,
    ],
  });
  await run("verify:verify", {
    address: koraExecutorAddress,
    constructorArguments: [
      eWETHAddress,
      eUSDCAddress,
      "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
      deployerAddress,
    ],
  });

  await run("verify:verify", {
    address: budgetHookAddress,
    constructorArguments: [koraExecutorAddress],
  });
  await run("verify:verify", {
    address: purchaseAmountHookAddress,
    constructorArguments: [koraExecutorAddress],
  });
  await run("verify:verify", {
    address: timeframeHookAddress,
    constructorArguments: [koraExecutorAddress],
  });
  await run("verify:verify", {
    address: frequencyHookAddress,
    constructorArguments: [koraExecutorAddress],
  });
};

verify()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
