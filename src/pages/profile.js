import Layout from "@/components/layout";
import styles from '../styles/profile.module.css';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import HomeFeed from "@/components/homefeed";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    async function fetchAuthuser() {
      const res = await fetch(`http://localhost:8080/api/users/${session.user.userId}`);
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
        <div className="container mt-4">
          <ProfileSection userData={userData} setUserData={setUserData} />
          <HomeFeed feedType={'profile'} />
        </div>
      </Layout>
    );
  }
}

function ProfileSection({ userData, setUserData }) {
  return (
    <div className={`mx-auto row ${styles.profileCard}`}>
      {userData.profile_pic_url
      ?
      <div className={`col m-2 p-0 ${styles.userProfilePicDiv}`}>
        <img className={`rounded-circle ${styles.userProfilePic}`} src={userData.profile_pic_url} />
      </div>
      :
      <div className={`col m-2 p-0 rounded-circle ${styles.userProfilePicDiv}`}>
        <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
          account_circle
        </span>
      </div>
      }
      <div className="col my-auto">
        <h1 className="mb-0"><strong>{userData.name}</strong></h1>
        <div>{`@${userData.username}`}</div>
        <div className="text-secondary">
          {userData.friends?.length > 0 ? `${userData.friends.length} friends` : ''}
        </div>
      </div>
      <ProfileEditModal userData={userData} setUserData={setUserData} />
    </div>
  );
}

function ProfileEditModal({ userData, setUserData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    const res = await fetch(`http://localhost:8080/api/authuser/edit-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        profile_pic_url: userData.profile_pic_url,
      }),
    });
    switch (res.status) {
      case 200:
        setIsLoading(false);
        setIsError(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
        break;
      default:
        setIsLoading(false);
        setIsError(true);
        setIsSuccess(false);
    }
  }

  return (
    <div className="col mt-auto">
      {/* <!-- Button trigger modal --> */}
      <button type="button" className="btn btn-outline-secondary d-flex text-nowrap py-1 px-2 ms-auto" 
        data-bs-toggle="modal" data-bs-target="#profileEditModal"
      >
        <span className="material-symbols-outlined">
          edit_note
        </span>
        Edit
      </button>

      {/* <!-- Modal --> */}
      <div className="modal fade" id="profileEditModal" tabIndex="-1" aria-labelledby="profileEditModal" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="profileEditModal">Edit profile</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form className="modal-body">
              <div className="mb-3">
                <label htmlFor="nameFormControlInput" className="form-label">Name</label>
                <input type="text" className="form-control" id="nameFormControlInput" required
                  value={userData.name ?? ''}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="profilePicUrlFormControlInput" className="form-label">Profile picture url</label>
                <input type="text" className="form-control" id="profilePicUrlFormControlInput" required
                  value={userData.profile_pic_url ?? ''}
                  onChange={(e) => setUserData({ ...userData, profile_pic_url: e.target.value })}
                />
              </div>
              {isError && 
              <div className="alert alert-danger px-3 py-2" role="alert">
                Failed to post, please try again
              </div>
              }
              {isSuccess && 
              <div className="alert alert-success px-3 py-2" role="alert">
                Profile updated, please log in again to see changes
              </div>
              }
            </form>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" 
                onClick={handleSaveChanges}
              >
                {!isLoading && 'Save changes'}
                {isLoading && 
                <div>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="visually-hidden">Loading...</span>
                </div>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}