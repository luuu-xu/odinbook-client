import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from '../styles/navbar.module.css';
import { useRouter } from "next/router";

export default function NavBar() {
  const { data: session } = useSession();
  // activeNavLink: 'home' || 'friends' || 'posts'
  const [activeNavLink, setActiveNavLink] = useState('');
  const router = useRouter();
  const [authuserData, setAuthuserData] = useState({});

  // Fetch authuser form session.user.userId and pass along the authuserData
  useEffect(() => {
    async function fetchAuthuser() {
      console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.userId}`);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${session.user.userId}`);
      const data = await res.json();
      setAuthuserData(data.user);
    }
    if (session) {
      fetchAuthuser();
    }
  }, [session]);

  // Set activeNavLink from pathname
  useEffect(() => {
    if (router.pathname === '/') {
      setActiveNavLink('home');
    } else if (router.pathname === '/friends') {
      setActiveNavLink('friends');
    } else if (router.pathname === '/posts') {
      setActiveNavLink('posts');
    }
  }, []);

  // Enable Bootstrap tooltips when NavBar is created
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  }

  return (
    <nav className="navbar navbar-expand-sm bg-white shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand text-primary fs-4" href="/"><strong>odinbook</strong></a>
        <div className="navbar-nav me-auto mb-lg-0 d-flex flex-row gap-2">
          <a className={`nav-link ${activeNavLink === 'home' ? 'active' : ''}`} aria-current="page" href="/" 
            data-bs-toggle="tooltip" data-bs-title="Home" data-bs-placement="bottom"
          >
            <span className={`material-symbols-outlined ${styles.navItemIcon}`}>
              home
            </span>
          </a>
          <a className={`nav-link ${activeNavLink === 'friends' ? 'active' : ''}`} href="/friends"
            data-bs-toggle="tooltip" data-bs-title="Firends" data-bs-placement="bottom"
          >
            <span className={`material-symbols-outlined ${styles.navItemIcon}`}>
              group
            </span>
          </a>
          <a className={`nav-link ${activeNavLink === 'posts' ? 'active' : ''}`} href="/posts"
            data-bs-toggle="tooltip" data-bs-title="Posts" data-bs-placement="bottom"
          >
            <span className={`material-symbols-outlined ${styles.navItemIcon}`}>
              article
            </span>
          </a>
        </div>
        <div className="dropdown"
          data-bs-toggle="tooltip" data-bs-title="Account" data-bs-placement="bottom"
        >
          {authuserData.profile_pic_url ? 
          <img className={`dropdown-toggle rounded-circle ${styles.userProfilePic}`} src={authuserData.profile_pic_url} 
          role="button" data-bs-toggle="dropdown" aria-expanded="false" />
          :
          <div className={`dropdown-toggle rounded-circle ${styles.userProfilePic}`} 
          role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span className={`${styles.userProfilePicIcon} material-symbols-outlined`}>
              account_circle
            </span>
          </div>
          }
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item" href="/profile">Profile</a></li>
            <li><hr className="dropdown-divider"/></li>
            <li>
              <button className="dropdown-item text-danger" 
              onClick={handleLogout}>
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}