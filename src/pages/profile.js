import Layout from "@/components/layout";
import styles from '../styles/profile.module.css';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import HomeFeed from "@/components/homefeed";
import ProfileSection from "@/components/profilesection";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    async function fetchAuthuser() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.userId}`);
      const data = await res.json();
      setUserData(data.user);
    }
    if (session) {
      fetchAuthuser();
    }
  }, [session]);

  if (session) {
    return (
      <Layout>
        <div className="mt-4">
          <ProfileSection userData={userData} setUserData={setUserData} edit={true} />
          <HomeFeed feedType={'profile'} />
        </div>
      </Layout>
    );
  }
}