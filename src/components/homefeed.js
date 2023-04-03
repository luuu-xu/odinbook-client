import styles from '../styles/homefeed.module.css';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DateTime } from 'luxon';

export default function HomeFeed(props) {
  return (
    <div className="container mt-4">
      <NewPostCard />
      <FeedList {...props} />
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

  const handleNewPost = async (e) => {
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
  }

  return (
    <>
      <div className='row justify-content-center'>
        <div className={`card shadow-sm p-3 ${styles.feedCard}`}>
          <div className="row g-0">
            {session.user.image ? 
            <img className={`my-auto rounded-circle ${styles.userProfilePic}`} src={session.user.image}/>
            :
            <div className={`my-auto rounded-circle ${styles.userProfilePic}`}>
              <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
                account_circle
              </span>
            </div>
            }
            <div className="col ms-2">
              <button className={`btn btn-light text-secondary rounded-5 w-100 text-start text-nowrap ${styles.userProfilePic}`}
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
                onClick={handleNewPost}
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

function FeedList({ posts }) {
  return (
    <ul className='ps-0'>
      {posts.map((post) => {
        return <FeedPostCard key={post._id} post={post} />
      })}
    </ul>
  );
}

function FeedPostCard({ post }) {
  return (
    <div className='row mt-3 justify-content-center' key={post._id}>
      <div className={`card shadow-sm p-3 ${styles.feedCard}`}>
        <div className='d-flex d-row gap-2'>
          {post.user.profile_pic_url ? 
          <img className={`my-auto rounded-circle ${styles.userProfilePic}`} src={post.user.profile_pic_url} />
          :
          <div className={`my-auto rounded-circle ${styles.userProfilePic}`}>
            <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
              account_circle
            </span>
          </div>
          }
          <div>
            <p className='p-0 mb-0'><strong>{post.user.name}</strong></p>
            <p className='p-0 mb-0'><small>{DateTime.fromISO(post.timestamp).toLocaleString(DateTime.DATETIME_SHORT)}</small></p>
          </div>
        </div>
        <div className='card-text mt-1'>
          <p className='my-2'>
            {post.content}
          </p>
        </div>
        <FeedPostCardLikeSection post={post} />
        <FeedPostCardCommentSection post={post} />
      </div>
    </div>
  );
}

function FeedPostCardLikeSection({ post }) {
  const { data: session } = useSession();
  const router = useRouter();
  // likeStatus: 'unliked' || 'liked' || 'loading' || 'error'
  const [likeStatus, setLikeStatus] = useState('unliked');

  useEffect(() => {
    if (post.likes.length > 0) {
      post.likes.some(like => like.toString() === session.user.userId) 
      ?
      setLikeStatus('liked') 
      : 
      setLikeStatus('unliked')
    }
  }, []);

  const handleClickComment = () => {
    const commentInputElement = document.getElementById('newCommentInput');
    commentInputElement.focus();
  }

  const handleClickLike = async () => {
    const res = await fetch(`http://localhost:8080/api/authuser/posts/${post._id}/give-like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    setLikeStatus('loading');
    const data = await res.json();
    switch (res.status) {
      // Already liked
      case 400:
        setLikeStatus('liked');
        break;
      // Successfully liked
      case 201:
        setLikeStatus('liked');
        console.log(data);
        router.reload();
        break;
      // Failed to like
      default:
        setLikeStatus('error');
    }
  }

  return (
    <>
      <div className='d-flex d-row justify-content-between'>
        <div className='text-secondary'>
          {post.likes.length > 0 && <span>{post.likes.length} {post.likes.length > 1 ? 'likes' : 'like'}</span>}
        </div>
        <div className='text-secondary'>
          {post.comments.length > 0 && <span>{post.comments.length} {post.comments.length > 1 ? 'comments' : 'comment'}</span>}
        </div>
      </div>
      <hr className='my-1 border-bottom'/>
      <div className='d-flex d-row gap-2'>
        <button className={`w-50 btn btn-outline-light text-secondary p-0 py-1 border-0 ${styles.iconTextButton}`} 
          onClick={handleClickLike}
        >
          {(() => {
            switch (likeStatus) {
              case 'unliked':
                return (
                  <div className='d-flex align-items-center'>
                    <span className="material-symbols-outlined fs-5 me-1">
                      thumb_up
                    </span>
                    Like
                  </div>
                );
              case 'loading':
                return (
                  <div>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span className="visually-hidden">Loading...</span>
                  </div>);
              case 'liked':
                return (
                  <div className='d-flex align-items-center text-primary fw-bold'>
                    <span className={`material-symbols-outlined fs-5 me-1 ${styles.iconBold}`}>
                      thumb_up
                    </span>
                    Like
                  </div>
                );
              default: 
                return (
                  <div className='d-flex align-items-center text-danger'>
                    <span className="material-symbols-outlined fs-5 me-1">
                      thumb_up
                    </span>
                    Error, try again
                  </div>
                );
          }})()}
        </button>
        <button className={`w-50 btn btn-outline-light text-secondary p-0 py-1 border-0 ${styles.iconTextButton}`} 
          onClick={handleClickComment}
        >
          <span className="material-symbols-outlined fs-5 me-1">
            comment
          </span>
          Comment
        </button>
      </div>
      <hr className='my-1 border-bottom'/>
    </>
  );
}

function FeedPostCardCommentSection({ post }) {
  return (
    <div>
      <FeedPostCardCommentSecitonNewComment postid={post._id} />
      <FeedPostCardCommentSectionCommentList comments={post.comments} />
    </div>
  );
}

function FeedPostCardCommentSecitonNewComment({ postid }) {
  const {data: session } = useSession();
  const router = useRouter();
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentError, setIsContentError] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const handleNewComment = async (e) => {
    e.preventDefault();
    console.log(commentInput);
    setIsLoading(true);
    setIsError(false);
    const res = await fetch(`http://localhost:8080/api/authuser/posts/${postid}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: commentInput,
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
  }

  return (
    <div className="row g-0 mt-1">
      {session.user.image ? 
      <img className={`my-auto rounded-circle ${styles.userProfilePic32}`} src={session.user.image}/>
      :
      <div className={`my-auto rounded-circle ${styles.userProfilePic32}`}>
        <span className={`material-symbols-outlined ${styles.userProfilePicIcon32}`}>
          account_circle
        </span>
      </div>
      }
      <form className="col ms-2" onSubmit={handleNewComment}>
        <div className={`input-group w-100 ${styles.userProfilePic32}`}>
          <input type='text' id='newCommentInput' className='form-control bg-light border-0 h-100 rounded-start-5' 
          placeholder='Write a comment...' aria-label='New comment' aria-describedby="button-addon"
          onChange={(e) => setCommentInput(e.target.value)} />
          <button className='btn btn-light border-0 h-100 rounded-end-5 d-flex align-items-center' type='submit' id='button-addon'>
            {!isLoading && 
            <span className="fs-4 material-symbols-outlined text-secondary">
              send
            </span>}
            {isLoading && 
            <div>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              <span className="visually-hidden">Loading...</span>
            </div>}
          </button>
        </div>
        {isError && 
        <div className="mt-2 mb-0 alert alert-danger px-3 py-1" role="alert">
          <small>Failed to comment, please try again</small>
        </div>
        }
        {isContentError && 
        <div className="mt-2 mb-0 alert alert-danger px-3 py-1" role="alert">
          Content is required
        </div>
        }
      </form>
    </div>
  );
}

function FeedPostCardCommentSectionCommentList({ comments }) {
  return (
    <ul className='ps-0'>
      {comments.map((comment) => {
        return (
          <div className='row g-0 mt-2 d-flex flex-nowrap' key={comment._id}>
            {comment.user.profile_pic_url ? 
            <img className={`my-auto rounded-circle ${styles.userProfilePic32}`} src={comment.user.profile_pic_url}/>
            :
            <div className={`my-auto rounded-circle ${styles.userProfilePic32}`}>
              <span className={`material-symbols-outlined ${styles.userProfilePicIcon32}`}>
                account_circle
              </span>
            </div>
            }
            <div className={`col-auto ms-2 ${styles.commentBubble} bg-light rounded-4 px-3 py-1 d-flex flex-column`}>
              <div className='fw-semibold'><small>{comment.user.name}</small></div>
              <div className=''>{comment.content}</div>
            </div>
          </div>
        );
      })}
    </ul>
  );
}