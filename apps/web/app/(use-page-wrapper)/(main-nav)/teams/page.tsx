import { ShellMainAppDir } from "app/(use-page-wrapper)/(main-nav)/ShellMainAppDir";
import type { PageProps as ServerPageProps } from "app/_types";
import { _generateMetadata, getTranslate } from "app/_utils";
import dynamic from "next/dynamic";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

import { ServerTeamsListing } from "./server-page";

// Just execute the dynamic imports without assigning to variables
dynamic(() => import("@calcom/features/ee/teams/components/TeamsListing").then((mod) => mod.TeamsListing), {
  loading: () => <div>Loading teams list...</div>,
});

dynamic(() => import("./CTA").then((mod) => mod.TeamsCTA));

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("teams"),
    (t) => t("create_manage_teams_collaborative"),
    undefined,
    undefined,
    "/teams"
  );

const ServerPage = async ({ searchParams: _searchParams }: ServerPageProps) => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  const searchParams = await _searchParams;
  const token = Array.isArray(searchParams?.token) ? searchParams.token[0] : searchParams?.token;
  const callbackUrl = token ? `/teams?token=${encodeURIComponent(token)}` : null;

  if (!session) {
    redirect(callbackUrl ? `/auth/login?callbackUrl=${callbackUrl}` : "/auth/login");
  }

  const t = await getTranslate();
  const { Main, CTA } = await ServerTeamsListing({ searchParams, session });

  return (
    <ShellMainAppDir CTA={CTA} heading={t("teams")} subtitle={t("create_manage_teams_collaborative")}>
      {Main}
    </ShellMainAppDir>
  );
};
export default ServerPage;
