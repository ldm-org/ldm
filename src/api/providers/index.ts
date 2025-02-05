// Provider - Github
import * as github from "./github";
export * from "./github";
export { github };

// Provider - HTTP
import * as http from "./http";
export * from "./http";
export { http };

// Provider - JSDelivr
import * as jsdelivr from "./jsdelivr";
export * from "./jsdelivr";
export { jsdelivr };

declare module "./jsdelivr" {
  export const github: typeof jsdelivrgithub;
  export const npm: typeof jsdelivrnpm;
}

// Provider - JSDelivr:Github
import * as jsdelivrgithub from "./jsdelivr:github";
export * from "./jsdelivr:github";
Object.assign(jsdelivr, {
  github: jsdelivrgithub,
});

// Provider - JSDelivr:NPM
import * as jsdelivrnpm from "./jsdelivr:npm";
export * from "./jsdelivr:npm";
Object.assign(jsdelivr, {
  npm: jsdelivrnpm,
});
