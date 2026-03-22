#!/usr/bin/env bun
import { Command } from "commander";
import { searchCommand } from "./commands/search.js";
import { installCommand } from "./commands/install.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";

const program = new Command();

program
  .name("vanta")
  .description("Universal MCU package manager")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize a new vanta project")
  .action(initCommand);

program
  .command("search <query>")
  .description("Search the vanta registry")
  .option("-p, --platform <platform>", "Filter by platform (esp32, stm32, rp2040)")
  .option("-f, --framework <framework>", "Filter by framework (arduino, espidf)")
  .action(searchCommand);

program
  .command("install [packages...]")
  .alias("i")
  .description("Install packages")
  .action(installCommand);

program
  .command("list")
  .alias("ls")
  .description("List installed packages")
  .action(listCommand);

program.parse();
