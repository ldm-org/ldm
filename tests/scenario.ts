export interface Scenario {
  name: string;
  command: string;
  given: string;
  project: string;
  expected?: {
    output?: string;
    error?: (error: any) => void;
  };
}
