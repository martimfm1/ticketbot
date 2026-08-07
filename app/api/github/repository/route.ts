import { NextResponse } from "next/server";

const GITHUB_REPOSITORY = "martimfm1/silentra-ticket";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPOSITORY}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch repository information",
        },
        {
          status: response.status,
        }
      );
    }

    const repository = await response.json();

    return NextResponse.json({
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      watchers: repository.watchers_count,
      language: repository.language,
      license: repository.license?.spdx_id ?? null,
      htmlUrl: repository.html_url,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Unable to fetch GitHub repository",
      },
      {
        status: 500,
      }
    );
  }
}