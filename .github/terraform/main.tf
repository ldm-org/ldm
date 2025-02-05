# ---------------------------
# Github Repository
# ---------------------------
resource "github_repository" "ldm" {
  name       = "ldm"
  visibility = "public"

  has_issues      = true
  has_projects    = true
  has_downloads   = true
  has_discussions = false
  has_wiki        = false

  homepage_url = "https://www.npmjs.com/package/loose-dependency-manager"
  description  = "Wire-up fragmented codes and files from various sources with a single command."
  topics = [
    "dependency",
    "manager",
    "ci",
    "cd",
    "dx",
    "automation",
    "jsdelivr",
    "github"
  ]
}

#---------------------------
# Github Actions
#---------------------------
resource "github_actions_secret" "gh_pat" {
  repository      = github_repository.ldm.name
  secret_name     = "GH_PAT"
  plaintext_value = var.gh_pat
}

resource "github_actions_secret" "npm_token" {
  repository      = github_repository.ldm.name
  secret_name     = "NPM_TOKEN"
  plaintext_value = var.npm_token
}
