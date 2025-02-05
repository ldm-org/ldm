import z from "zod";
import { Octokit, RequestError } from "octokit";
import { JSONSerializable } from "@/api/json";
import { Source, SourceSchema } from "@/api/models/source";
import { match, P } from "ts-pattern";
import { raise } from "@/utils";
import { PrintableError } from "@/api/error";

export const ownerRepoRegex = /^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/;

export class GithubSource extends Source {
  declare public readonly provider: "github";
  public readonly auth?: GithubSourceAuthSchema;

  public readonly owner: string;
  public readonly repo: string;
  protected readonly client: Octokit;

  constructor(properties: GithubSourceSchema) {
    const parsed = GithubSourceSchema.parse(properties);
    super(parsed, { validate: false });
    this.auth = parsed.auth;

    if (!ownerRepoRegex.test(this.uri)) {
      throw new Error(
        `Invalid GitHub source URI: ${this.uri}. Expected format: <owner>/<repo>`,
      );
    }
    const [owner, repo] = this.uri.split("/");
    this.owner = owner;
    this.repo = repo;

    this.client = new Octokit({
      auth: this.auth?.token,
    });
  }

  async prepare() {
    await this.client.request("GET /octocat").catch((error: any) =>
      match({ error, status: error.status })
        .with({ error: P.instanceOf(RequestError), status: 401 }, () =>
          raise(
            new PrintableError(
              `Invalid GitHub token provided for source ${this.uri}`,
            ),
          ),
        )
        .otherwise(error => raise(error)),
    );
  }

  getClient(): Octokit {
    return this.client;
  }

  @JSONSerializable()
  override toJSON() {
    return {
      ...super.toJSON(),
      auth: this.auth,
    };
  }
}

const GithubSourceAuthSchema = z.object({
  token: z.string().optional(),
});

type GithubSourceAuthSchema = z.infer<typeof GithubSourceAuthSchema>;

export const GithubSourceSchema = z.intersection(
  SourceSchema,
  z.object({
    provider: z.literal("github"),
    auth: GithubSourceAuthSchema.optional(),
  }),
);

export type GithubSourceSchema = z.infer<typeof GithubSourceSchema>;
