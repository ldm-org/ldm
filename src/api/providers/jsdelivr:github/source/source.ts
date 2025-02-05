import { SourceSchema } from "@/api/models/source";
import { JSDelivrSource } from "../../jsdelivr/source";
import { ownerRepoRegex } from "../../github/source";

export class JSDelivrGithubSource extends JSDelivrSource {
  declare public readonly provider: "jsdelivr:github";

  public readonly owner: string;
  public readonly repo: string;

  constructor(properties: SourceSchema, opts?: JSDelivrSource.Options) {
    super(properties, opts);
    if (!ownerRepoRegex.test(this.uri)) {
      throw new Error(`Invalid URI for github: ${this.uri}`);
    }
    const [owner, repo] = this.uri.split("/");
    this.owner = owner;
    this.repo = repo;
  }
}
