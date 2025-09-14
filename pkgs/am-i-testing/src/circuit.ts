import { readFile } from "node:fs/promises";
import { join, parse } from "node:path";

export class Circuit {
  mainFilePath: string;
  inputsFilePath: string;
  artifactDir: string;
  private name: string;

  constructor(mainPath: string, inputsFilePath: string, artifactDir: string) {
    this.mainFilePath = mainPath;
    this.inputsFilePath = inputsFilePath;
    this.artifactDir = artifactDir;
    this.name = parse(this.mainFilePath).name;
  }

  async symFile(): Promise<string> {
    return readFile(join(this.artifactDir, `${this.name}.sym`)).then(buf => buf.toString());
  }
}
