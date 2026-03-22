import { select, input } from "@inquirer/prompts";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename } from "path";
import chalk from "chalk";
import { log } from "../utils/logger.js";
import type { VantaConfig } from "../core/config.js";

const BOARDS = [
  { name: "ESP32-DevKitC-V4", value: "esp32-devkitc-v4", chip: "esp32" },
  { name: "ESP32-S3-DevKitC-1", value: "esp32-s3-devkitc-1", chip: "esp32s3" },
  { name: "ESP32-C3-DevKitM-1", value: "esp32-c3-devkitm-1", chip: "esp32c3" },
  { name: "ESP32-S2-Saola-1", value: "esp32-s2-saola-1", chip: "esp32s2" },
  { name: "ESP32-C6-DevKitC-1", value: "esp32-c6-devkitc-1", chip: "esp32c6" },
  { name: "STM32 Nucleo-F446RE", value: "nucleo-f446re", chip: "stm32" },
  { name: "Raspberry Pi Pico", value: "rpi-pico", chip: "rp2040" },
  { name: "Raspberry Pi Pico 2", value: "rpi-pico2", chip: "rp2350" },
  { name: "Arduino Uno R3", value: "arduino-uno", chip: "avr" },
  { name: "Arduino Nano ESP32", value: "arduino-nano-esp32", chip: "esp32s3" },
  { name: "Adafruit Feather nRF52840", value: "feather-nrf52840", chip: "nrf52" },
];

const FRAMEWORKS = [
  { name: "Arduino", value: "arduino" },
  { name: "ESP-IDF", value: "espidf" },
  { name: "MicroPython", value: "micropython" },
  { name: "Zephyr RTOS", value: "zephyr" },
  { name: "STM32 HAL", value: "stm32hal" },
  { name: "Pico SDK", value: "picoSDK" },
  { name: "Bare Metal", value: "bare-metal" },
];

export async function initCommand() {
  const cwd = process.cwd();

  // Check if already initialized
  if (existsSync(join(cwd, "vanta.toml"))) {
    log.warn("vanta.toml already exists in this directory.");
    return;
  }

  console.log();
  log.info("Initializing new vanta project...\n");

  // Project name — default to folder name
  const defaultName = basename(cwd).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const projectName = await input({
    message: "Project name:",
    default: defaultName,
  });

  // Target board
  const boardChoice = await select({
    message: "Target board:",
    choices: BOARDS.map((b) => ({ name: b.name, value: b.value })),
  });
  const board = BOARDS.find((b) => b.value === boardChoice)!;

  // Framework
  const framework = await select({
    message: "Framework:",
    choices: FRAMEWORKS.map((f) => ({ name: f.name, value: f.value })),
  });

  // Build config
  const config: VantaConfig = {
    project: {
      name: projectName,
      version: "0.1.0",
    },
    target: {
      board: board.value,
      chip: board.chip,
      framework,
    },
    dependencies: {},
  };

  // Write vanta.toml
  const { stringify } = await import("@iarna/toml");
  writeFileSync(join(cwd, "vanta.toml"), stringify(config as any));
  log.success("Created vanta.toml");

  // Create src/main.cpp if it doesn't exist
  const srcDir = join(cwd, "src");
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true });
    const mainContent = framework === "arduino"
      ? `#include <Arduino.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("Hello from ${projectName}!");\n}\n\nvoid loop() {\n  // your code here\n}\n`
      : framework === "espidf"
        ? `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n\nvoid app_main(void) {\n    printf("Hello from ${projectName}!\\n");\n    while (1) {\n        vTaskDelay(pdMS_TO_TICKS(1000));\n    }\n}\n`
        : `// ${projectName} — main entry point\n\nint main() {\n    return 0;\n}\n`;
    const ext = framework === "espidf" ? "c" : "cpp";
    writeFileSync(join(srcDir, `main.${ext}`), mainContent);
    log.success(`Created src/main.${ext}`);
  }

  // Create .gitignore
  if (!existsSync(join(cwd, ".gitignore"))) {
    writeFileSync(
      join(cwd, ".gitignore"),
      `.vanta/\nbuild/\n*.o\n*.elf\n*.bin\n*.hex\n.DS_Store\n`
    );
    log.success("Created .gitignore");
  }

  // Create .vanta/ directory
  mkdirSync(join(cwd, ".vanta", "packages"), { recursive: true });

  console.log();
  log.info(
    `Next: ${chalk.green("vanta search <query>")} to find libraries, then ${chalk.green("vanta install <package>")} to add them.`
  );
}
