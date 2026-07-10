export type GitHubPullRequestStatus = "draft" | "open" | "merged" | "closed";

const parseGitHubPullRequestStatus = (
  value: string | null | undefined,
): GitHubPullRequestStatus | undefined => {
  const normalized = value
    ?.trim()
    .replace(/^status:\s*/i, "")
    .trim()
    .toLowerCase();
  if (normalized === undefined) {
    return undefined;
  }
  switch (normalized) {
    case "draft":
      return "draft";
    case "pullopened":
    case "open":
      return "open";
    case "pullmerged":
    case "merged":
      return "merged";
    case "pullclosed":
    case "closed":
      return "closed";
    default:
      return undefined;
  }
};

const githubPullRequestStatusSelector = "header [data-status]";
const githubReviewableStateSelector = "span[reviewable_state]";

export const getGitHubPullRequestStatus = ():
  | GitHubPullRequestStatus
  | undefined => {
  const statusElement = document.querySelector<HTMLElement>(
    githubPullRequestStatusSelector,
  );
  const dataStatus = parseGitHubPullRequestStatus(
    statusElement?.dataset.status,
  );
  if (dataStatus !== undefined) {
    return dataStatus;
  }

  // TODO: This will be unneeded as GitHub updates its DOM structure
  const reviewableStateElements = document.querySelectorAll<HTMLElement>(
    githubReviewableStateSelector,
  );
  for (const reviewableStateElement of reviewableStateElements) {
    const status = parseGitHubPullRequestStatus(
      reviewableStateElement.textContent,
    );
    if (status !== undefined) {
      return status;
    }
  }

  return undefined;
};
