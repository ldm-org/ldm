# ---------------------------
# Github Repository
# ---------------------------
resource "github_repository" "ldm" {
  name            = "ldm"
  visibility      = "public"
  has_issues      = true
  has_projects    = true
  has_downloads   = true
  has_discussions = false
  has_wiki        = false
}

#---------------------------
# Github Actions
#---------------------------
resource "github_actions_secret" "gh_pat" {
  repository      = github_repository.ldm.name
  secret_name     = "GH_PAT"
  plaintext_value = var.gh_pat
}
