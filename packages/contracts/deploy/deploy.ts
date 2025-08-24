import { ethers, run } from "hardhat";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import type { DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const [deployer] = await ethers.getSigners();
  const { deploy } = hre.deployments;
  const deployerAddress = deployer.address;

  console.log("\n=================== Accounts ===================\n");
  console.log("Deployer:", deployer.address);

  console.log("\n============== Deployed Contracts ==============\n");

  const usdc = await deploy("MockERC20", {
    args: [deployerAddress, "USDC", "USDC"],
    from: deployer.address,
  });
  console.log("USDC:", usdc.address);
  const weth = await deploy("MockERC20", {
    args: [deployerAddress, "WETH", "WETH"],
    from: deployer.address,
  });
  console.log("WETH:", weth.address);

  const eUSDC = await deploy("EncryptedERC20", {
    args: ["Encrypted USDC", "eUSDC", deployerAddress, usdc.address],
    from: deployerAddress,
  });
  console.log("eUSDC:", eUSDC.address);
  const eWETH = await deploy("EncryptedERC20", {
    args: ["Encrypted WETH", "eWETH", deployerAddress, weth.address],
    from: deployerAddress,
  });
  console.log("eWETH:", eWETH.address);

  const sepoliaUniswapV2RouterAddress =
    "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

  const router = await ethers.getContractAt(
    "UniswapV2Router02",
    sepoliaUniswapV2RouterAddress,
  );
  const factory = await ethers.getContractAt(
    "UniswapV2Factory",
    await router.factory(),
  );

  const koraExecutor = await deploy("KoraExecutor", {
    args: [
      eWETH.address,
      eUSDC.address,
      sepoliaUniswapV2RouterAddress,
      deployerAddress,
    ],
    from: deployer.address,
  });
  console.log("KoraExecutor:", koraExecutor.address);

  // Deploy Hooks
  const budgetHook = await deploy("BudgetHook", {
    args: [koraExecutor.address],
    from: deployer.address,
  });
  console.log("BudgetHook:", budgetHook.address);

  const purchaseAmountHook = await deploy("PurchaseAmountHook", {
    args: [koraExecutor.address],
    from: deployer.address,
  });
  console.log("PurchaseAmountHook:", purchaseAmountHook.address);

  const timeframeHook = await deploy("TimeframeHook", {
    args: [koraExecutor.address],
    from: deployer.address,
  });
  console.log("TimeframeHook:", timeframeHook.address);

  const frequencyHook = await deploy("FrequencyHook", {
    args: [koraExecutor.address],
    from: deployer.address,
  });
  console.log("FrequencyHook:", frequencyHook.address);

  const amount0 = ethers.parseUnits((1_000_000).toString(), 6);
  const amount1 = ethers.parseUnits((1_000_000 * 4000).toString(), 6);

  const token0Address = weth.address;
  const token1Address = usdc.address;
  const token0 = await ethers.getContractAt("MockERC20", token0Address);
  const token1 = await ethers.getContractAt("MockERC20", token1Address);

  // Mint Tokens + Approve Router
  token0.mint(deployerAddress, amount0);
  token1.mint(deployerAddress, amount1);

  let tx = await token0
    .connect(deployer)
    .approve(await router.getAddress(), ethers.MaxUint256);
  await tx.wait();
  tx = await token1
    .connect(deployer)
    .approve(await router.getAddress(), ethers.MaxUint256);
  await tx.wait();

  tx = await factory.connect(deployer).createPair(token0Address, token1Address);
  await tx.wait();

  const pairAddress = await factory.getPair(token0Address, token1Address);

  tx = await router
    .connect(deployer)
    .addLiquidity(
      token0Address,
      token1Address,
      amount0,
      amount1,
      0,
      0,
      deployer.address,
      Math.floor(Date.now() / 1000) + 5000,
    );

  await tx.wait();

  console.log("\n================================================\n\n");

  console.log(`const usdcAddress = "${usdc.address}";`);
  console.log(`const wethAddress = "${weth.address}";`);
  console.log(`const eUSDCAddress = "${eUSDC.address}";`);
  console.log(`const eWETHAddress = "${eWETH.address}";`);
  console.log(`const pairAddress = "${pairAddress}";`);
  console.log(`const budgetHookAddress = "${budgetHook.address}";`);
  console.log(
    `const purchaseAmountHookAddress = "${purchaseAmountHook.address}";`,
  );
  console.log(`const timeframeHookAddress = "${timeframeHook.address}";`);
  console.log(`const frequencyHookAddress = "${frequencyHook.address}";`);
  console.log(`const koraExecutorAddress = "${koraExecutor.address}";`);
  console.log(`const deployerAddress = "${deployer.address}";`);
  console.log(
    `const sepoliaUniswapV2RouterAddress = "${sepoliaUniswapV2RouterAddress}";`,
  );

  console.log("\n================================================\n\n");

  console.log("Verifying Contracts...");
  await run("verify:verify", {
    address: usdc.address,
    constructorArguments: [deployerAddress, "USDC", "USDC"],
  });
  await run("verify:verify", {
    address: weth.address,
    constructorArguments: [deployerAddress, "WETH", "WETH"],
  });
  await run("verify:verify", {
    address: eUSDC.address,
    constructorArguments: [
      "Encrypted USDC",
      "eUSDC",
      deployerAddress,
      usdc.address,
    ],
  });
  await run("verify:verify", {
    address: eWETH.address,
    constructorArguments: [
      "Encrypted WETH",
      "eWETH",
      deployerAddress,
      weth.address,
    ],
  });
  await run("verify:verify", {
    address: koraExecutor.address,
    constructorArguments: [
      eWETH.address,
      eUSDC.address,
      "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
      deployerAddress,
    ],
  });

  await run("verify:verify", {
    address: budgetHook.address,
    constructorArguments: [koraExecutor.address],
  });
  await run("verify:verify", {
    address: purchaseAmountHook.address,
    constructorArguments: [koraExecutor.address],
  });
  await run("verify:verify", {
    address: timeframeHook.address,
    constructorArguments: [koraExecutor.address],
  });
  await run("verify:verify", {
    address: frequencyHook.address,
    constructorArguments: [koraExecutor.address],
  });
};

// biome-ignore lint/style/noDefaultExport: safe
export default deploy;
deploy.id = "deploy_kora";
deploy.tags = ["KoraExecutor"];
