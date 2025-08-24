// Uniswap artifacts
import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import pairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import { ethers } from "hardhat";

import type {
  MockERC20,
  UniswapV2Factory__factory,
  UniswapV2Router02__factory,
} from "../../types";
import { getSigners } from ".";

export const deployMockUniswapV2 = async (
  token0: MockERC20,
  token1: MockERC20,
) => {
  const { deployer } = await getSigners();

  const token0Address = await token0.getAddress();
  const token1Address = await token1.getAddress();

  // --- Deploy WETH (still from local contract factory) ---
  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();
  await weth.waitForDeployment();

  // --- Deploy Factory ---
  const Factory = new ethers.ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    deployer,
  ) as UniswapV2Factory__factory;
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();

  // --- Deploy Router ---
  const Router = new ethers.ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    deployer,
  ) as UniswapV2Router02__factory;
  const router = await Router.deploy(
    await factory.getAddress(),
    await weth.getAddress(),
  );
  await router.waitForDeployment();

  // --- Provide liquidity: token0/token1 ---
  const amount0 = ethers.parseUnits("1000000", 6);
  const amount1 = ethers.parseUnits((1_000_000 * 4000).toString(), 6);

  await token0.connect(deployer).mint(deployer.address, amount0);
  await token1.connect(deployer).mint(deployer.address, amount1);

  await (
    await token0.approve(await router.getAddress(), ethers.MaxUint256)
  ).wait();
  await (
    await token1.approve(await router.getAddress(), ethers.MaxUint256)
  ).wait();

  await (await factory.createPair(token0Address, token1Address)).wait();
  const pairAddress = await factory.getPair(token0Address, token1Address);

  const pair = new ethers.Contract(pairAddress, pairArtifact.abi, deployer);

  await (
    await router.addLiquidity(
      token0Address,
      token1Address,
      amount0,
      amount1,
      0,
      0,
      deployer.address,
      Math.floor(Date.now() / 1000) + 5000,
    )
  ).wait();

  return { factory, pair, router };
};
