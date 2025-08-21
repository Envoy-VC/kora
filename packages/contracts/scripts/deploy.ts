import { ethers } from "hardhat";

const deploy = async () => {
  const [deployer, alice, bob] = await ethers.getSigners();
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

  const sepoliaUniswapV2RouterAddress =
    "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";

  const KoraExecutor = await ethers.getContractFactory("KoraExecutor");
  const koraExecutor = await KoraExecutor.deploy(
    await eWETH.getAddress(),
    await eUSDC.getAddress(),
    sepoliaUniswapV2RouterAddress,
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

  console.log("\n============== Deployed Contracts ==============\n");
  console.log("KoraExecutor:", koraExecutor.target);
  console.log("USDC:", usdc.target);
  console.log("WETH:", weth.target);
  console.log("eUSDC:", eUSDC.target);
  console.log("eWETH:", eWETH.target);
  console.log("BudgetHook:", budgetHook.target);
  console.log("PurchaseAmountHook:", purchaseAmountHook.target);
  console.log("TimeframeHook:", timeframeHook.target);
  console.log("FrequencyHook:", frequencyHook.target);
  console.log("\n================================================\n\n");
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
