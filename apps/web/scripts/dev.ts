import { spawn } from "child_process";

const asciiArt = `
  __  ____  ____  __ _  __  __ _   ___  ____ 
 /  \\(  _ \\/ ___)(  / )(  )(  ( \\ / __)/ ___)
(  O )) __/\\___ \\ )  (  )( /    /( (_ \\\\___ \\
 \\__/(__)  (____/(__\\_)(__)\_)__) \\___/(____/
`;

const colors = {
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
} as const;

function showSplash() {
  console.log(colors.cyan + asciiArt + colors.reset);
  console.log("");
  console.log(
    colors.bright +
      colors.yellow +
      '   "The details are not the details. They make the design."' +
      colors.reset,
  );
  console.log(
    colors.magenta + "                                        — Charles Eames" + colors.reset,
  );
  console.log("\n\n");
}

showSplash();

// Spawn Next.js dev server
const nextProcess = spawn("bun", ["run", "next", "dev", "--port=3001"], {
  stdio: "inherit",
  shell: true,
});

// Gracefully handle termination signals
function cleanup() {
  if (nextProcess && !nextProcess.killed) {
    console.log(colors.red + "\nKilling Next.js dev server..." + colors.reset);
    nextProcess.kill("SIGINT"); // send CTRL+C signal
  }
  process.exit();
}

// Listen for parent process exit signals
process.on("SIGINT", cleanup); // CTRL+C
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

nextProcess.on("error", (error) => {
  console.error("Failed to start Next.js dev server:", error);
  process.exit(1);
});

nextProcess.on("close", (code) => {
  process.exit(code ?? 0);
});