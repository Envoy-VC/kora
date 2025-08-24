import { ethers, run } from "hardhat";

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;

  console.log("\n=================== Accounts ===================\n");
  console.log("Deployer:", deployer.address);

  console.log("\n============== Deployed Contracts ==============\n");

  const mockTokenFactory = await ethers.getContractFactory("MockERC20");
  const encryptedTokenFactory =
    await ethers.getContractFactory("EncryptedERC20");

  const usdc = await mockTokenFactory.deploy(deployerAddress, "USDC", "USDC");
  await usdc.waitForDeployment();
  console.log("USDC:", usdc.target);
  const weth = await mockTokenFactory.deploy(deployerAddress, "WETH", "WETH");
  await weth.waitForDeployment();
  console.log("WETH:", weth.target);

  const eUSDC = await encryptedTokenFactory.deploy(
    "Encrypted USDC",
    "eUSDC",
    deployerAddress,
    await usdc.getAddress(),
  );
  await eUSDC.waitForDeployment();
  console.log("eUSDC:", eUSDC.target);
  const eWETH = await encryptedTokenFactory.deploy(
    "Encrypted WETH",
    "eWETH",
    deployerAddress,
    await weth.getAddress(),
  );
  await eUSDC.waitForDeployment();
  console.log("eWETH:", eWETH.target);

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

  const KoraExecutor = await ethers.getContractFactory("KoraExecutor");
  const koraExecutor = await KoraExecutor.deploy(
    await eWETH.getAddress(),
    await eUSDC.getAddress(),
    sepoliaUniswapV2RouterAddress,
    deployerAddress,
  );
  await koraExecutor.waitForDeployment();
  console.log("KoraExecutor:", koraExecutor.target);

  // Deploy Hooks
  const BudgetHook = await ethers.getContractFactory("BudgetHook");
  const budgetHook = await BudgetHook.deploy(koraExecutor.target);
  await budgetHook.waitForDeployment();
  console.log("BudgetHook:", budgetHook.target);

  const PurchaseAmountHook =
    await ethers.getContractFactory("PurchaseAmountHook");
  const purchaseAmountHook = await PurchaseAmountHook.deploy(
    koraExecutor.target,
  );
  await purchaseAmountHook.waitForDeployment();
  console.log("PurchaseAmountHook:", purchaseAmountHook.target);

  const TimeframeHook = await ethers.getContractFactory("TimeframeHook");
  const timeframeHook = await TimeframeHook.deploy(koraExecutor.target);
  await timeframeHook.waitForDeployment();
  console.log("TimeframeHook:", timeframeHook.target);

  const FrequencyHook = await ethers.getContractFactory("FrequencyHook");
  const frequencyHook = await FrequencyHook.deploy(koraExecutor.target);
  await frequencyHook.waitForDeployment();
  console.log("FrequencyHook:", frequencyHook.target);

  const amount0 = ethers.parseUnits((1_000_000).toString(), 6);
  const amount1 = ethers.parseUnits((1_000_000 * 4000).toString(), 6);

  const token0 = weth;
  const token1 = usdc;
  const token0Address = await token0.getAddress();
  const token1Address = await token1.getAddress();

  // Mint Tokens + Approve Router
  await token0.connect(deployer).mint(deployer.address, amount0);
  await token1.connect(deployer).mint(deployer.address, amount1);

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

  console.log(`const usdcAddress = "${usdc.target}";`);
  console.log(`const wethAddress = "${weth.target}";`);
  console.log(`const eUSDCAddress = "${eUSDC.target}";`);
  console.log(`const eWETHAddress = "${eWETH.target}";`);
  console.log(`const pairAddress = "${pairAddress}";`);
  console.log(`const budgetHookAddress = "${budgetHook.target}";`);
  console.log(
    `const purchaseAmountHookAddress = "${purchaseAmountHook.target}";`,
  );
  console.log(`const timeframeHookAddress = "${timeframeHook.target}";`);
  console.log(`const frequencyHookAddress = "${frequencyHook.target}";`);
  console.log(`const koraExecutorAddress = "${koraExecutor.target}";`);
  console.log(`const deployerAddress = "${deployer.address}";`);
  console.log(
    `const sepoliaUniswapV2RouterAddress = "${sepoliaUniswapV2RouterAddress}";`,
  );

  console.log("\n================================================\n\n");

  console.log("Verifying Contracts...");
  await run("verify:verify", {
    address: usdc.target,
    constructorArguments: [deployerAddress, "USDC", "USDC"],
  });
  await run("verify:verify", {
    address: weth.target,
    constructorArguments: [deployerAddress, "WETH", "WETH"],
  });
  await run("verify:verify", {
    address: eUSDC.target,
    constructorArguments: [
      "Encrypted USDC",
      "eUSDC",
      deployerAddress,
      usdc.target,
    ],
  });
  await run("verify:verify", {
    address: eWETH.target,
    constructorArguments: [
      "Encrypted WETH",
      "eWETH",
      deployerAddress,
      weth.target,
    ],
  });
  await run("verify:verify", {
    address: koraExecutor.target,
    constructorArguments: [
      eWETH.target,
      eUSDC.target,
      "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
      deployerAddress,
    ],
  });

  await run("verify:verify", {
    address: budgetHook.target,
    constructorArguments: [koraExecutor.target],
  });
  await run("verify:verify", {
    address: purchaseAmountHook.target,
    constructorArguments: [koraExecutor.target],
  });
  await run("verify:verify", {
    address: timeframeHook.target,
    constructorArguments: [koraExecutor.target],
  });
  await run("verify:verify", {
    address: frequencyHook.target,
    constructorArguments: [koraExecutor.target],
  });
};

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
