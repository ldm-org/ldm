import { LogUpdate } from "./log-update";

export class UpdatableSection {
  protected readonly lines: SectionLine[];

  constructor(protected readonly updatable: LogUpdate) {
    this.lines = [];
  }

  createLine(): LogUpdate {
    const render = this.render.bind(this);
    const lines = this.lines;

    const line = new SectionLine("");
    let isPushed = false;

    function logUpdate(...text: string[]) {
      if (!isPushed) {
        isPushed = true;
        lines.push(line);
      }
      line.content = text.join("");
      render();
    }
    logUpdate.done = () => {
      line.done();
      render();
    };
    logUpdate.clear = () => {
      line.content = "";
      render();
    };
    return logUpdate;
  }

  render() {
    if (this.lines.length === 0) {
      return;
    }
    this.updatable(this.lines.map(line => line.content).join("\n"));
    const isDone = this.lines.every(line => line.isDone);
    if (isDone) {
      this.updatable.done();
    }
  }

  done() {
    this.lines.forEach(line => line.done());
    this.render();
  }
}

class SectionLine {
  public isDone: boolean;

  constructor(public content: string) {
    this.isDone = false;
  }

  done() {
    this.isDone = true;
  }
}
