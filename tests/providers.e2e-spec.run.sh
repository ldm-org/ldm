#!/bin/sh

#
# Run one of the following commands to run the tests for a specific provider
#
pnpm test:e2e -t HTTPDependency:E2E # http.e2e-spec.ts
pnpm test:e2e -t GithubDependency:E2E # github.e2e-spec.ts
pnpm test:e2e -t JSDelivrNPMDependency:E2E # jsdelivr-npm.e2e-spec.ts
pnpm test:e2e -t JSDelivrGithubDependency:E2E # jsdelivr-github.e2e-spec.ts

#
# Run the following command to run all the tests
#
pnpm test:e2e -t Dependency:E2E # *.e2e-spec.ts
