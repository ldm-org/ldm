variable "github_owner" {
  type        = string
  description = <<EOT
    Variable for GitHub owner.

    This represents what account or organization the repository will be created under.
  EOT
}

variable "gh_pat" {
  type        = string
  sensitive   = true
  description = <<EOT
    Variable for GitHub Personal Access Token.

    This is used to authenticate with the GitHub API.
  EOT
}

variable "npm_token" {
  type        = string
  sensitive   = true
  description = "Variable for NPM token for publishing packages."
}
