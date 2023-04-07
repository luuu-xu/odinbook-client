import HomeFeed from "@/components/homefeed";
import Layout from "@/components/layout";
import ProfileSection from "@/components/profilesection";
import { useSession } from "next-auth/react";

export async function getStaticPaths() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
  const data = await res.json();
  const paths = data.users.map((user) => ({
    params: { id: user._id },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const resUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`);
  const dataUser = await resUser.json();
  const resPosts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}/posts`);
  const dataPosts = await resPosts.json();
  return {
    props: {
      user: dataUser.user,
      posts: dataPosts.posts
    },
  }
}

export default function UserPage({ user, posts }) {
  const { data: session } = useSession();
  
  if (session) {
    return (
      <Layout>
        <div className="mt-4">
          <ProfileSection userData={user} edit={false} />
          <HomeFeed feedType={'user'} postsData={posts} />
        </div>
      </Layout>
    );
  }
}