import axios from "axios";
import { pipe } from "fp-ts/lib/function";
import { indent } from "@/utils";
import { PrintableError } from "@/api/error";
import {
  ArtifactDownloader,
  DownloadedArtifact,
} from "@/api/models/dependency/plan";
import { HTTPMethod } from "../types";

export class HTTPArtifactDownloader extends ArtifactDownloader {
  public url: string;
  public method: HTTPMethod;
  public headers?: Record<string, string>;
  public params?: Record<string, string>;
  public data?: Record<string, string>;
  protected readonly axios: typeof axios;

  constructor(options: {
    url: string;
    method?: HTTPMethod;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    data?: any;
    path?: string;
    axios?: typeof axios;
  }) {
    const {
      url,
      headers,
      params,
      data,
      path = ".",
      method = "GET",
      axios: axiosInstance = axios,
    } = options;
    super(path || ".");
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.params = params;
    this.data = data;
    this.axios = axiosInstance;
  }

  async download(): Promise<DownloadedArtifact> {
    try {
      const response = await this.axios.request({
        url: this.url,
        method: this.method,
        headers: this.headers,
        params: this.params,
        data: this.data,
        responseType: "text",
        responseEncoding: "base64",
      });
      return new DownloadedArtifact(
        this.path,
        Buffer.from(response.data, "base64"),
      );
    } catch (error) {
      if (this.axios.isAxiosError(error)) {
        const { response, status } = error!;
        throw new PrintableError(
          `Failed to download artifact from ${this.url}: ${status ?? ""} ${response?.statusText ?? ""}` +
            (response?.data
              ? `\n\n${pipe(JSON.stringify(response!.data, null, 2), indent(2))}`
              : ""),
        );
      }
      throw error;
    }
  }
}
