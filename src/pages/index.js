import Head from 'next/head'
import styles from '../styles/Home.module.css';
import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'
import Layout from '@/components/layout';
import NavBar from '@/components/navbar';
import HomeFeed from '@/components/homefeed';

export async function getStaticProps() {
  const res = await fetch('http://localhost:8080/api/posts');
  const data = await res.json();
  // console.log(data);

  return {
    props: {
      posts: data.posts,
    }
  }
}

export default function Home({ posts }) {
  const { data: session } = useSession();
  const [signupCard, setSignupCard] = useState(false);

  if (session) {
    return (
      <>
        <Head>
          <title>Odinbook</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout>
          <HomeFeed posts={posts} />
        </Layout>
      </>
    );
  }
  return (
    <>
      <NavBar />
      <div className='container-fluid py-5 bg-light'>
        <div className='container-sm'>
          <div className='row align-items-center justify-content-center gx-5'>
            <div className='col-sm-6'>
              <HomeBanner />
            </div>
            <div className='col-sm'>
              {signupCard ? 
              <CardSignup switchToSignup={setSignupCard} /> 
              : 
              <CardLogin switchToSignup={setSignupCard} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function HomeBanner() {
  return (
    <div className='text-end'>
      <p className='text-primary fs-1'><strong>odinbook</strong></p>
      <p className='fs-4'>Connect with friends and the world around you on Odinbook.</p>
    </div>
  );
}

function CardLogin({ switchToSignup }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  return (
    <div className={`card shadow-sm p-4 ${styles.cardlogin}`}>
      <form>
        <div className='form-floating mb-3'>
          <input type='text' className='form-control' id='username' placeholder='name@example.com' required
            onChange={(e) => setUsernameInput(e.target.value)}
            value={usernameInput}
          />
          <label htmlFor='username'>Username</label>
        </div>
        <div className='form-floating mb-3'>
          <input type='password' className='form-control' id='password' placeholder='password' required 
            onChange={(e) => setPasswordInput(e.target.value)}
            value={passwordInput}
          />
          <label htmlFor='password' className='form-label'>Password</label>
        </div>
        <button type='submit' className='btn btn-primary w-100' disabled={loginLoading}
          onClick={
            async (e) => {
              e.preventDefault();
              setLoginLoading(true);
              setLoginFailed(false);
              const res = await signIn('credentials', { 
                redirect: false,
                username: usernameInput,
                password: passwordInput,
              });
              // console.log(res);
              if (!res.ok) {
                setLoginLoading(false);
                setLoginFailed(true);
              }
            }}
        >
          {!loginLoading && 'Log in'}
          {loginLoading && 
          <div>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="visually-hidden">Loading...</span>
          </div>}
        </button>
        <button className='btn btn-success mt-3 mb-2 w-100'
          onClick={
            async (e) => {
              e.preventDefault();
              switchToSignup(true);
            }
          }
        >
          Sign up
        </button>
        {loginFailed && <div className='py-0 text-danger text-center'><small>Log in failed</small></div>}
      </form>
      <div className='border-bottom mt-2 mb-3'/>
      <button onClick={() => {signIn('credentials')}} className='btn btn-outline-primary w-100'>Log in with Facebook</button>
      <button className='btn btn-outline-primary mt-3 w-100'>Log in as Visitor</button>
    </div>
  );
}

function CardSignup({ switchToSignup }) {
  const [nameInput, setNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupFailed, setSignupFailed] = useState(false);
  const [signupErrors, setSignupErrors] = useState([]);

  return (
    <div className={`card shadow-sm p-4 ${styles.cardlogin}`}>
      <form>
        <div className='form-floating mb-3'>
          <input type='text' className='form-control' id='name' placeholder='luuu-xu' required
            onChange={(e) => setNameInput(e.target.value)}
            value={nameInput}
          />
          <label htmlFor='name'>Name</label>
        </div>
        <div className='form-floating mb-3'>
          <input type='text' className='form-control' id='username' placeholder='name@example.com' required
            onChange={(e) => setUsernameInput(e.target.value)}
            value={usernameInput}
          />
          <label htmlFor='username'>Username</label>
        </div>
        <div className='form-floating mb-3'>
          <input type='password' className='form-control' id='password' placeholder='password' required
            onChange={(e) => setPasswordInput(e.target.value)}
            value={passwordInput}
          />
          <label htmlFor='password' className='form-label'>Password</label>
        </div>
        <button type='submit' className='btn btn-success w-100' disabled={signupLoading}
          onClick={
            async (e) => {
              e.preventDefault();
              setSignupLoading(true);
              const res = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: nameInput,
                  username: usernameInput,
                  password: passwordInput,
                }),
              });
              const data = await res.json();
              // console.log(data);
              if (data?.errors) {
                setNameInput(data.input.name);
                setUsernameInput(data.input.username);
                setPasswordInput(data.input.password);
                setSignupErrors(data.errors);
                setSignupLoading(false);
              }
              if (res.status !== 201) {
                setSignupLoading(false);
                setSignupFailed(true);
              }
              if (res.status === 201) {
                setSignupLoading(false);
                setSignupFailed(false);
                const res = await signIn('credentials', { 
                  redirect: false,
                  username: usernameInput,
                  password: passwordInput,
                });
                // console.log(res);
              }
            }}
        >
          {!signupLoading && 'Sign up'}
          {signupLoading && 
          <div>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="visually-hidden">Loading...</span>
          </div>}
        </button>
        {signupFailed && <div className='mt-1 py-0 text-danger text-center'><small>Sign up failed</small></div>}
        {signupErrors.map((error, index) => (
          <div key={index} className='mt-1 py-0 text-danger text-center'><small>{error.msg}</small></div>
        ))
        }
      </form>
      <div className='border-bottom mt-3 mb-3'/>
      <button className='btn btn-outline-secondary w-100'
        onClick={(e) => {
          e.preventDefault();
          switchToSignup(false);
        }}
      >
        Back to log in
      </button>
    </div>
  );
}
