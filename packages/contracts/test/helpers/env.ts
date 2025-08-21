import { ethers } from "hardhat";

import { getSigners } from ".";
import { deployMockUniswapV2 } from "./uniswap";

export type Environment = Awaited<ReturnType<typeof createEnvironment>>;

export const createEnvironment = async () => {
  const { deployer, alice, bob } = await getSigners();
  const deployerAddress = deployer.address;

  console.log("\n=================== Accounts ===================\n");
  console.log("Deployer:", deployer.address);
  console.log("Alice:", alice.address);
  console.log("Bob:", bob.address);

  const mockTokenFactory = await ethers.getContractFactory("MockERC20");
  const encryptedTokenFactory =
    await ethers.getContractFactory("EncryptedERC20");

  const usdc = await mockTokenFactory.deploy(deployerAddress, "USDC", "USDC");
  await usdc.waitForDeployment();
  const weth = await mockTokenFactory.deploy(deployerAddress, "WETH", "WETH");
  await weth.waitForDeployment();

  const eUSDC = await encryptedTokenFactory.deploy(
    "Encrypted USDC",
    "eUSDC",
    deployerAddress,
    await usdc.getAddress(),
  );
  const eWETH = await encryptedTokenFactory.deploy(
    "Encrypted WETH",
    "eWETH",
    deployerAddress,
    await weth.getAddress(),
  );
  await eUSDC.waitForDeployment();

  const { factory, pair, router } = await deployMockUniswapV2(weth, usdc);

  const KoraExecutor = await ethers.getContractFactory("KoraExecutor");
  const koraExecutor = await KoraExecutor.deploy(
    await eWETH.getAddress(),
    await eUSDC.getAddress(),
    await router.getAddress(),
  );
  await koraExecutor.waitForDeployment();

  // Deploy Hooks
  const BudgetHook = await ethers.getContractFactory("BudgetHook");
  const budgetHook = await BudgetHook.deploy(koraExecutor.target);
  await budgetHook.waitForDeployment();

  const hooks = { budgetHook };

  console.log("\n============== Deployed Contracts ==============\n");
  console.log("KoraExecutor:", koraExecutor.target);
  console.log("USDC:", usdc.target);
  console.log("WETH:", weth.target);
  console.log("eUSDC:", eUSDC.target);
  console.log("eWETH:", eWETH.target);
  console.log("\n================================================\n\n");

  return {
    eUSDC,
    eWETH,
    factory,
    hooks,
    koraExecutor,
    pair,
    router,
    usdc,
    weth,
  };
};
