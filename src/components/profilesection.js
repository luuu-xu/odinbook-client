import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from '../styles/profile.module.css';
import { useState } from "react";

// edit: boolean - whether the user can edit the profile
export default function ProfileSection({ userData, setUserData, edit }) {
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
          {userData.friends?.length > 1 ? `${userData.friends?.length} friends` : `${userData.friends?.length} friend`}
        </div>
      </div>
      {edit && <ProfileEditModal userData={userData} setUserData={setUserData} />}
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authuser/edit-profile`, {
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
          router.reload();
          setIsSuccess(false);
        }, 1500);
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
                  disabled={userData.username === 'visitor' ? true : false}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="profilePicUrlFormControlInput" className="form-label">Profile picture url</label>
                <input type="text" className="form-control" id="profilePicUrlFormControlInput" required
                  value={userData.profile_pic_url ?? ''}
                  onChange={(e) => setUserData({ ...userData, profile_pic_url: e.target.value })}
                  disabled={userData.username === 'visitor' ? true : false}
                />
              </div>
              {isError && 
              <div className="alert alert-danger px-3 py-2" role="alert">
                Failed to post, please try again
              </div>
              }
              {isSuccess && 
              <div className="alert alert-success px-3 py-2" role="alert">
                Profile updated, refreshing...
              </div>
              }
              {userData.username === 'visitor' &&
              <div className="alert alert-warning px-3 py-2" role="alert">
                You can't edit the visitor's profile
              </div>
              }
            </form>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary"
                onClick={handleSaveChanges}

                // Disabling the Edit Profile button if the user is the general visitor
                disabled={userData.username === 'visitor' ? true : false}
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