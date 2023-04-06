import styles from '../styles/homefeed.module.css';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DateTime } from 'luxon';
import Link from 'next/link';

// feedType: 'all' || 'home' || 'profile'
export default function HomeFeed({ feedType }) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [authuserData, setAuthuserData] = useState({});

  // Fetch authuser form session.user.userId and pass along the authuserData
  useEffect(() => {
    async function fetchAuthuser() {
      const res = await fetch(`${process.env.API_URL}/api/users/${session.user.userId}`);
      const data = await res.json();
      setAuthuserData(data.user);
    }
    if (session) {
      fetchAuthuser();
    }
  }, [session]);

  // Fetch posts according to the home feedType
  useEffect(() => {
    async function fetchAuthuserPosts() {
      const res = await fetch(`${process.env.API_URL}/api/authuser/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      return data.posts;
      // setPosts(posts);
    }
    async function fetchFriendsPosts() {
      const res = await fetch(`${process.env.API_URL}/api/authuser/friends-posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      return data.posts;
      // setPosts(data.posts);
    }
    async function sortAndSetPosts() {
      const authuserPosts = await fetchAuthuserPosts();
      const friendsPosts = await fetchFriendsPosts();
      const posts = [].concat(authuserPosts, friendsPosts);
      posts.sort((a, b) => {
        if (a.timestamp < b.timestamp) {
          return 1;
        }
        if (a.timestamp > b.timestamp) {
          return -1;
        }
      });
      setPosts(posts);
      setPostsLoading(false);
    }
    async function setAuthuserPosts() {
      const authuserPosts = await fetchAuthuserPosts();
      setPosts(authuserPosts);
      setPostsLoading(false);
    }
    async function fetchAllPostsandSetPosts() {
      const res = await fetch(`${process.env.API_URL}/api/posts`);
      const data = await res.json();
      setPosts(data.posts);
      setPostsLoading(false);
    }
    if (feedType === 'profile') {
      setAuthuserPosts();
    } else if (feedType === 'home') {
      sortAndSetPosts();
    } else if (feedType === 'all') {
      fetchAllPostsandSetPosts();
    }
  }, [session]);

  return (
    <div className="container mt-4">
      <NewPostCard authuserData={authuserData}/>
      {feedType === 'home' && <h3 className={`mx-auto mt-4 mb-0 ${styles.feedCard}`}>Your feed</h3>}
      {feedType === 'profile' && <h3 className={`mx-auto mt-4 mb-0 ${styles.feedCard}`}>Your posts</h3>}
      {feedType === 'all' && <h3 className={`mx-auto mt-4 mb-0 ${styles.feedCard}`}>All posts</h3>}
      <FeedList posts={posts} postsLoading={postsLoading} authuserData={authuserData} />
    </div>
  );
}

function NewPostCard({ authuserData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [contentInput, setContentInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentError, setIsContentError] = useState(false);
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    const newPostModal = document.getElementById('newPostModal');
    const formTextarea = document.getElementById('formTextarea');

    newPostModal.addEventListener('shown.bs.modal', () => {
      formTextarea.focus();
    });
  }, []);

  const handleNewPost = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    const formData = new FormData();
    formData.append('content', contentInput);
    if (imageInput) {
      formData.append('image', imageInput);
    }
    // console.log(Object.fromEntries(formData));
    const res = await fetch(`${process.env.API_URL}/api/authuser/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });
    // const data = await res.json();
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
        // console.log(data);
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
            {authuserData.profile_pic_url ? 
            <img className={`my-auto rounded-circle ${styles.userProfilePic}`} src={authuserData.profile_pic_url}/>
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
                What's on your mind, {authuserData.name}?
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* New Post Modal */}
      <div className="modal fade" id="newPostModal" tabIndex="-1" aria-labelledby="newPostModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" encType="multipart/form-data" onSubmit={handleNewPost}>
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="newPostModalLabel">Create Post</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {/* <form encType="multipart/form-data" onSubmit={handleNewPost}> */}
                <div className=''>
                  <label htmlFor="formTextarea" className='form-label ms-2'>Content*</label>
                  <textarea className={`form-control ${styles.newPostModalTextarea}`} placeholder="What's on your mind?" id="formTextarea" required
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <label htmlFor="formImage" className="form-label ms-2">{`Upload photo (JPG/JPEG not exceeding 16Mb)`}</label>
                  <input className="form-control" type="file" id="formImage" name="formImage" 
                    onChange={(e) => setImageInput(e.target.files[0])}
                  />
                </div>
              {/* </form> */}
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
              <button type="submit" className="btn btn-primary"
              >
                {!isLoading && 'Post'}
                {isLoading && 
                <div>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="visually-hidden">Loading...</span>
                </div>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function FeedList({ posts, postsLoading, authuserData }) {
  if (postsLoading) {
    return (
      <div className={`mx-auto ${styles.feedCard} text-center`}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (posts.length > 0) {
    return (
      <ul className='ps-0'>
        {posts.map((post) => {
          return <FeedPostCard key={post._id} post={post} authuserData={authuserData} />
        })}
      </ul>
    );
  } else {
    return (
      <div className={`row mx-auto mt-3 ${styles.feedCard}`}>
        <p className=''>No posts from you or your friends yet...</p>
        <div className=''>
          <p>Check out:</p>
          <div className='d-flex gap-2'>
            <Link href='/posts' className='btn btn-outline-secondary px-3 py-1'>All posts</Link>
            <Link href='/friends' className='btn btn-outline-secondary px-3 py-1'>All users</Link>
          </div>
        </div>
      </div>
    );
  }
}

function FeedPostCard({ post, authuserData }) {
  const [comments, setComments] = useState(post.comments);

  return (
    <div className='row mt-3 justify-content-center' key={post._id}>
      <div className={`card shadow-sm py-3 px-0 ${styles.feedCard}`}>
        <div className='mx-3 d-flex d-row gap-2'>
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
        <div className='mx-3 card-text mt-1'>
          <p className='my-2'>
            {post.content}
          </p>
        </div>
        <div className=''>
          {post.image && 
          <img className={`w-100 mb-2 ${styles.feedCardImage}`}
            src={`data:${post.image.contentType};base64,${Buffer.from(post.image.data).toString('base64')}`} 
          />}
        </div>
        <FeedPostCardLikeSection post={post} comments={comments} />
        <FeedPostCardCommentSection post={post} comments={comments} setComments={setComments} authuserData={authuserData} />
      </div>
    </div>
  );
}

function FeedPostCardLikeSection({ post, comments }) {
  const { data: session } = useSession();
  // likeStatus: 'unliked' || 'liked' || 'loading' || 'error'
  const [likeStatus, setLikeStatus] = useState('unliked');
  const [likes, setLikes] = useState(post.likes);

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
    const commentInputElement = document.getElementById(`newCommentInput${post._id}`);
    commentInputElement.focus();
  }

  const handleClickLike = async () => {
    setLikeStatus('loading');
    if (likeStatus === 'unliked') {
      const res = await fetch(`${process.env.API_URL}/api/authuser/posts/${post._id}/give-like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
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
          setLikes(data.post.likes);
          break;
        // Failed to like
        default:
          setLikeStatus('error');
      }
    } else if (likeStatus === 'liked') {
      const res = await fetch(`${process.env.API_URL}/api/authuser/posts/${post._id}/cancel-like`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      switch (res.status) {
        // Already cancelled
        case 400:
          setLikeStatus('unliked');
          break;
        // Successfully unliked
        case 201:
          setLikeStatus('unliked');
          console.log(data);
          setLikes(data.post.likes);
          break;
        // Failed to like
        default:
          setLikeStatus('error');
      }
    }
  }

  return (
    <>
      <div className='mx-3 d-flex d-row justify-content-between'>
        <div className='text-secondary'>
          {likes.length > 0 && <span>{likes.length} {likes.length > 1 ? 'likes' : 'like'}</span>}
        </div>
        <div className='text-secondary'>
          {comments.length > 0 && <span>{comments.length} {comments.length > 1 ? 'comments' : 'comment'}</span>}
        </div>
      </div>
      {((likes.length > 0 || comments.length > 0) || !post.image ) && <hr className='mx-3 my-1 border-bottom'/>}
      <div className='mx-3 d-flex d-row gap-2'>
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
      <hr className='mx-3 my-1 border-bottom'/>
    </>
  );
}

function FeedPostCardCommentSection({ post, comments, setComments, authuserData }) {
  return (
    <div className='mx-3'>
      <FeedPostCardCommentSecitonNewComment postid={post._id} comments={comments} setComments={setComments} authuserData={authuserData} />
      <FeedPostCardCommentSectionCommentList comments={comments} />
    </div>
  );
}

function FeedPostCardCommentSecitonNewComment({ postid, comments, setComments, authuserData }) {
  const {data: session } = useSession();
  const [commentInput, setCommentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isContentError, setIsContentError] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const handleNewComment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    const res = await fetch(`${process.env.API_URL}/api/authuser/posts/${postid}/comments`, {
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
        setCommentInput('');
        setComments([...comments, {
          ...data.comment, 
          user: {
            ...data.comment.user, 
            profile_pic_url: authuserData.profile_pic_url,
            name: authuserData.name,
          }
        }]);
        break;
      default:
        setIsLoading(false);
        setIsContentError(false);
        setIsError(true);
    }
  }

  return (
    <div className="row g-0 mt-1">
      {authuserData.profile_pic_url ? 
      <img className={`my-auto rounded-circle ${styles.userProfilePic32}`} src={authuserData.profile_pic_url}/>
      :
      <div className={`my-auto rounded-circle ${styles.userProfilePic32}`}>
        <span className={`material-symbols-outlined ${styles.userProfilePicIcon32}`}>
          account_circle
        </span>
      </div>
      }
      <form className="col ms-2" onSubmit={handleNewComment}>
        <div className={`input-group w-100 ${styles.userProfilePic32}`}>
          <input type='text' id={`newCommentInput${postid}`} className='form-control bg-light border-0 h-100 rounded-start-5' 
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