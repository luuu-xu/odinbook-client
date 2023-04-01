import styles from '../styles/homefeed.module.css';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function HomeFeed() {
  return (
    <div className="container mt-4">
      <NewPostCard />
      <FeedList />
    </div>
  );
}

function NewPostCard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [contentInput, setContentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentError, setIsContentError] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const newPostModal = document.getElementById('newPostModal');
    const floatingTextarea = document.getElementById('floatingTextarea');

    newPostModal.addEventListener('shown.bs.modal', () => {
      floatingTextarea.focus();
    });
  }, []);

  return (
    <>
      <div className='row justify-content-center'>
        <div className={`card shadow-sm p-3 ${styles.feedCard}`}>
          <div className="row g-0">
            <img className={`my-auto rounded-circle ${styles.userProfilePic}`} src="https://scontent.fyto3-1.fna.fbcdn.net/v/t1.6435-1/40685331_1671740149601769_7083282385508237312_n.jpg?stp=cp0_dst-jpg_p80x80&_nc_cat=103&ccb=1-7&_nc_sid=7206a8&_nc_ohc=_iijVqPNV-kAX_u0S5D&_nc_ht=scontent.fyto3-1.fna&oh=00_AfAWS51l6ga3RErZUQWmQh1ob-bsJTUhI17JCjQvMe2xkw&oe=644D6DA9"/>
            <div className="col ms-2">
              <button className={`btn btn-outline-secondary rounded-5 w-100 text-start text-nowrap ${styles.userProfilePic}`}
                data-bs-toggle="modal" data-bs-target="#newPostModal"
              >
                What's on your mind, {session.user.name}?
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* New Post Modal */}
      <div className="modal fade" id="newPostModal" tabIndex="-1" aria-labelledby="newPostModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="newPostModalLabel">Create Post</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className='form-floating'>
                  <textarea className={`form-control ${styles.newPostModalTextarea}`} placeholder="What's on your mind?" id="floatingTextarea" required
                    onChange={(e) => setContentInput(e.target.value)}
                  ></textarea>
                  <label htmlFor="floatingTextarea">Content</label>
                </div>
              </form>
            </div>
            {isError && 
            <div className="alert alert-danger px-3 py-2 mx-3" role="alert">
              Failed to post, please try again
            </div>
            }
            {isContentError && 
            <div className="alert alert-danger px-3 py-2 mx-3" role="alert">
              Content is required
            </div>
            }
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary"
                onClick={async () => {
                  setIsLoading(true);
                  setIsError(false);
                  const res = await fetch('http://localhost:8080/api/authuser/posts', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session.accessToken}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      content: contentInput,
                    }),
                  });
                  const data = await res.json();
                  switch (res.status) {
                    case 400:
                      setIsLoading(false);
                      setIsError(false);
                      setIsContentError(true);
                      break;
                    case 201:
                      setIsLoading(false);
                      setIsContentError(false);
                      setIsError(false);
                      console.log(data);
                      router.reload();
                      break;
                    default:
                      setIsLoading(false);
                      setIsContentError(false);
                      setIsError(true);
                  }
                }}
              >
                {!isLoading && 'Post'}
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
    </>
  );
}

function FeedList() {
  const { data: session } = useSession();

  return (
    <ul className='ps-0'>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <div className='row mt-4 justify-content-center' key={i}>
            <div className={`card shadow-sm p-3 ${styles.feedCard}`}>
              <div className='d-flex d-row'>
                <img className={`my-auto rounded-circle ${styles.userProfilePic}`} src="https://scontent.fyto3-1.fna.fbcdn.net/v/t1.6435-1/40685331_1671740149601769_7083282385508237312_n.jpg?stp=cp0_dst-jpg_p80x80&_nc_cat=103&ccb=1-7&_nc_sid=7206a8&_nc_ohc=_iijVqPNV-kAX_u0S5D&_nc_ht=scontent.fyto3-1.fna&oh=00_AfAWS51l6ga3RErZUQWmQh1ob-bsJTUhI17JCjQvMe2xkw&oe=644D6DA9"/>
                <p>{session.user.name}</p>
              </div>
              <div className='card-text'>
                Some random text from post {i}
              </div>
            </div>
          </div>
        );
      })}
    </ul>
  );
}