import HomeFeed from "@/components/homefeed";
import Layout from "@/components/layout";
import { useSession } from "next-auth/react";

export default function PostsPage() {
  const { data: session } = useSession(); 

  if (session) {
    return (
      <Layout>
        <div className="mt-4">
          <HomeFeed feedType={'all'} />
        </div>
      </Layout>
    );
  }
}