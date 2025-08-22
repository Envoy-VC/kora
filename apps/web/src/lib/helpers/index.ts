export const truncateEthAddress = (address: string | undefined) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

type Duration = `${number}ms` | `${number}s` | `${number}m` | `${number}h`;

export const sleep = (duration: Duration) => {
  let time: number;
  if (duration.endsWith("ms")) {
    time = parseInt(duration.slice(0, -2));
  } else if (duration.endsWith("s")) {
    time = parseInt(duration.slice(0, -1)) * 1000;
  } else if (duration.endsWith("m")) {
    time = parseInt(duration.slice(0, -1)) * 1000 * 60;
  } else if (duration.endsWith("h")) {
    time = parseInt(duration.slice(0, -1)) * 1000 * 60 * 60;
  } else {
    throw new Error("Invalid duration");
  }
  return new Promise((resolve) => setTimeout(resolve, time));
};
