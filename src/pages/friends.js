import Layout from "@/components/layout";
import styles from '../styles/friends.module.css';
import { useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export async function getStaticProps() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
  const data = await res.json();
  return {
    props: {
      users: data.users,
    }
  }
}

export default function FriendsPage({ users }) {
  const { data: session } = useSession();
  const [friends, setFriends] = useState([]);
  const [friendRequestsSent, setFriendRequestsSent] = useState([]);
  const [friendRequestsReceived, setFriendRequestsReceived] = useState([]);

  useEffect(() => {
    async function getAuthuser() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.userId}`);
      const data = await res.json();
      setFriendRequestsSent(data.user.friend_requests_sent);
      setFriendRequestsReceived(data.user.friend_requests_received);
      setFriends(data.user.friends);
    }
    if (session) {
      getAuthuser();
    }
  }, [session]);

  if (session) {
    return (
      <Layout>
        <div className="container mt-4">
          <FriendRequestsReceivedSection friendRequestsReceived={friendRequestsReceived} />
          <FriendsSection friends={friends} />
          <AllUsersSection users={users} authuserId={session.user.userId} 
            friends={friends} friendRequestsReceived={friendRequestsReceived} friendRequestsSent={friendRequestsSent} 
          />
        </div>
      </Layout>
    );
  }
}

function FriendRequestsReceivedSection({ friendRequestsReceived }) {
  if (friendRequestsReceived.length > 0) {
    return (
      <ul className={`ps-0 mx-auto ${styles.userCard}`}>
        <h1 className="fs-3 mb-0">Friend requests</h1>
        {friendRequestsReceived.map((user) => (
          <FriendRequestCard key={user._id} user={user} />
        ))}
      </ul>
    );
  }
}

function FriendRequestCard({ user }) {
  const { data: session } = useSession();
  const router = useRouter();
  // friendRequestStatus: 'received' || 'loading' || 'error'
  const [friendRequestStatus, setFriendRequestStatus] = useState('received');

  const handleAcceptFriendRequest = async () => {
    setFriendRequestStatus('loading');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authuser/accept-friend-request/${user._id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    switch (res.status) {
      // Friend request accepted
      case 200:
        // setFriendRequestStatus('sent');
        router.reload();
        break;
      default:
        setFriendRequestStatus('error');
    }
  }

  const handleClickProfilePic = () => {
    router.push(`/users/${user._id}`);
  }

  return (
    <li className="row mt-3 justify-content-center">
      <div className={`card shadow-sm p-3`}>
        <div className='d-flex d-row align-items-center gap-2'>
          {user.profile_pic_url ? 
          <img className={`my-auto rounded-circle ${styles.userProfilePic}`} 
            src={user.profile_pic_url} onClick={handleClickProfilePic}
          />
          :
          <div className={`my-auto rounded-circle ${styles.userProfilePic}`} onClick={handleClickProfilePic}>
            <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
              account_circle
            </span>
          </div>
          }
          <div>
            <Link href={`/users/${user._id}`} className='p-0 mb-0'><strong>{user.name}</strong></Link>
          </div>
          {(() => {switch (friendRequestStatus) {
            case 'received':
              return (
                <button className="btn btn-outline-primary ms-auto px-3 py-1"
                  onClick={handleAcceptFriendRequest}>Accept
                </button>
              );
            case 'loading':
              return (
                <button className="btn btn-outline-primary disabled ms-auto px-3 py-1">
                  <div>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </button>
              );
            default:
              return (
                <button className="btn btn-outline-primary ms-auto px-3 py-1">
                  Error, try again
                </button>
              );
          }})()}
        </div>
      </div>
    </li>
  );
}

function FriendsSection({ friends }) {
  if (friends.length > 0) {
    return (
      <ul className={`ps-0 mx-auto ${styles.userCard}`}>
        <h1 className="fs-3 mb-0">Friends</h1>
        {friends.map((user) => (
          <FriendCard key={user._id} user={user} />
        ))}
      </ul>
    );
  }
}

function FriendCard({ user }) {
  const router = useRouter();

  const handleClickProfilePic = () => {
    router.push(`/users/${user._id}`);
  }

  return (
    <li className="row mt-3 justify-content-center">
      <div className={`card shadow-sm p-3`}>
        <div className='d-flex d-row align-items-center gap-2'>
          {user.profile_pic_url ? 
          <img className={`my-auto rounded-circle ${styles.userProfilePic}`} 
            onClick={handleClickProfilePic} src={user.profile_pic_url} 
          />
          :
          <div className={`my-auto rounded-circle ${styles.userProfilePic}`} onClick={handleClickProfilePic}>
            <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
              account_circle
            </span>
          </div>
          }
          <div>
            <Link href={`/users/${user._id}`} className='p-0 mb-0'><strong>{user.name}</strong></Link>
          </div>
        </div>
      </div>
    </li>
  );
}

function AllUsersSection({ users, friends, authuserId, friendRequestsReceived, friendRequestsSent }) {
  const noFriendSelfFriendRequestsReceivedUsers = () => {
    const noSelfUsers = users.filter((user) => user._id !== authuserId);
    const friendsIds = friends.map((friend) => friend._id);
    const noFriendSlefUsers = noSelfUsers.filter((user) => !friendsIds.includes(user._id));
    const friendRequestsReceivedIds = friendRequestsReceived.map((friendRequest) => friendRequest._id);
    const noFriendSelfFriendRequestsReceivedUsers = noFriendSlefUsers.filter((user) => !friendRequestsReceivedIds.includes(user._id));
    return noFriendSelfFriendRequestsReceivedUsers;
  }

  const friendRequestsSentIds = () => {
    return friendRequestsSent.map((friendRequest) => friendRequest._id);
  }

  return (
    <ul className={`ps-0 mx-auto ${styles.userCard}`}>
      <h1 className={`fs-3 mb-0`}>All users</h1>
      {noFriendSelfFriendRequestsReceivedUsers().map((user) => (
        <UserCard key={user._id} user={user} 
        friendRequestsSentIds={friendRequestsSentIds()} 
        />
      ))}
    </ul>
  );
}

function UserCard({ user, friendRequestsSentIds }) {
  const { data: session } = useSession();
  const router = useRouter();
  // friendRequestStatus: 'none' || 'sent' || 'loading' || 'error'
  const [friendRequestStatus, setFriendRequestStatus] = useState('none');

  useEffect(() => {
    if (friendRequestsSentIds.includes(user._id)) {
      setFriendRequestStatus('sent');
    }
  }, [friendRequestsSentIds]);

  const handleAddFriend = async () => {
    setFriendRequestStatus('loading');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authuser/send-friend-request/${user._id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    const data = await res.json();
    switch (res.status) {
      // Friend request sent
      case 200:
        setFriendRequestStatus('sent');
        // router.reload();
        break;
      default:
        setFriendRequestStatus('error');
    }
  }

  const handleClickProfilePic = () => {
    router.push(`/users/${user._id}`);
  }

  return (
    <li className="row mt-3 justify-content-center">
      <div className={`card shadow-sm p-3`}>
        <div className='d-flex d-row align-items-center gap-2'>
          {user.profile_pic_url ? 
          <img className={`my-auto rounded-circle ${styles.userProfilePic}`} 
            onClick={handleClickProfilePic} src={user.profile_pic_url} 
          />
          :
          <div className={`my-auto rounded-circle ${styles.userProfilePic}`} onClick={handleClickProfilePic}>
            <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
              account_circle
            </span>
          </div>
          }
          <div>
            <Link href={`/users/${user._id}`} className='p-0 mb-0'><strong>{user.name}</strong></Link>
          </div>
          {(() => {switch (friendRequestStatus) {
            case 'none':
              return (
                <button className="btn btn-outline-primary ms-auto px-3 py-1"
                  onClick={handleAddFriend}>Add friend
                </button>
              );
            case 'sent':
              return (
                <button className="btn btn-primary disabled ms-auto px-3 py-1"
                  onClick={handleAddFriend}>Friend request sent
                </button>
              );
            case 'loading':
              return (
                <button className="btn btn-outline-primary disabled ms-auto px-3 py-1">
                  <div>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </button>
              );
            default:
              return (
                <button className="btn btn-outline-primary ms-auto px-3 py-1">
                  Error, try again
                </button>
              );
          }})()}
        </div>
      </div>
    </li>
  );
}