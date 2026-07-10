/** @type {import('next').NextConfig} */
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgPage = repositoryName.endsWith(".github.io");
const basePath =
  isGitHubPagesBuild && repositoryName && !isUserOrOrgPage
    ? `/${repositoryName}`
    : "";

const nextConfig = {
  typedRoutes: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath
      }
    : {})
};

export default nextConfig;
