import { ethers } from "hardhat";

import { getSigners } from ".";
import { deployMockUniswapV2 } from "./uniswap";

export type Environment = Awaited<ReturnType<typeof createEnvironment>>;

export const createEnvironment = async () => {
  const { deployer } = await getSigners();
  const deployerAddress = deployer.address;

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
    deployerAddress,
  );
  await koraExecutor.waitForDeployment();

  // Deploy Hooks
  const BudgetHook = await ethers.getContractFactory("BudgetHook");
  const budgetHook = await BudgetHook.deploy(koraExecutor.target);
  await budgetHook.waitForDeployment();

  const PurchaseAmountHook =
    await ethers.getContractFactory("PurchaseAmountHook");
  const purchaseAmountHook = await PurchaseAmountHook.deploy(
    koraExecutor.target,
  );
  await purchaseAmountHook.waitForDeployment();

  const TimeframeHook = await ethers.getContractFactory("TimeframeHook");
  const timeframeHook = await TimeframeHook.deploy(koraExecutor.target);
  await timeframeHook.waitForDeployment();

  const FrequencyHook = await ethers.getContractFactory("FrequencyHook");
  const frequencyHook = await FrequencyHook.deploy(koraExecutor.target);
  await frequencyHook.waitForDeployment();

  const hooks = {
    budgetHook,
    frequencyHook,
    purchaseAmountHook,
    timeframeHook,
  };

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
