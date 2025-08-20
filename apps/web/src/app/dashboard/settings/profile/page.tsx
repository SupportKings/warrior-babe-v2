import { Suspense } from "react";

import { redirect } from "next/navigation";

import MainLayout from "@/components/layout/main-layout";

import ProfileHeader from "@/features/profile/components/layout/profile-header";

import { getUser } from "@/queries/getUser";

import ProfilePageLoading from "./loading";
import { ProfileForm } from "./profile-client";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageLoading />}>
      <ProfilePageAsync />
    </Suspense>
  );
}

async function ProfilePageAsync() {
  const session = await getUser();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <MainLayout headers={[<ProfileHeader key="profile-header" />]}>
      <ProfileForm user={session.user} />
    </MainLayout>
  );
}
