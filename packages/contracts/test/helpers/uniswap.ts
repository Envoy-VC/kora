import { ethers } from "hardhat";

import type { MockERC20 } from "../../types";
import { getSigners } from ".";

export const deployMockUniswapV2 = async (
  token0: MockERC20,
  token1: MockERC20,
) => {
  const { deployer } = await getSigners();

  const token0Address = await token0.getAddress();
  const token1Address = await token1.getAddress();

  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address); // feeToSetter
  await factory.waitForDeployment();

  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();

  const Router = await ethers.getContractFactory("UniswapV2Router02");
  const router = await Router.deploy(
    await factory.getAddress(),
    await weth.getAddress(),
  );
  await router.waitForDeployment();

  // WETH/USDC

  const amount0 = ethers.parseUnits((1_000_000).toString(), 6);
  const amount1 = ethers.parseUnits((1_000_000 * 4000).toString(), 6);

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
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

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

  return { factory, pair, router };
};
