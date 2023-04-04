import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import styles from '../styles/navbar.module.css';
import { useRouter } from "next/router";

export default function NavBar() {
  const { data: session } = useSession();

  // Enable Bootstrap tooltips when NavBar is created
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }, []);

  return (
    <nav className="navbar navbar-expand-sm bg-white shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand text-primary fs-4" href="#"><strong>odinbook</strong></a>
        <ul className="navbar-nav me-auto mb-lg-0 d-flex flex-row">
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="/" 
              data-bs-toggle="tooltip" data-bs-title="Home" data-bs-placement="bottom"
            >
              <span className={`material-symbols-outlined ${styles.navItemIcon}`}>
                home
              </span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/friends"
              data-bs-toggle="tooltip" data-bs-title="Firends" data-bs-placement="bottom"
            >
              <span className={`material-symbols-outlined ${styles.navItemIcon}`}>
                group
              </span>
            </a>
          </li>
        </ul>
        <div className="dropdown"
          data-bs-toggle="tooltip" data-bs-title="Account" data-bs-placement="bottom"
        >
          {session?.user.image ? 
          <img className={`dropdown-toggle rounded-circle ${styles.userProfilePic}`} src={session.user.image} 
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
            {/* <li><a className="dropdown-item" href="/friends">Friends</a></li> */}
            <li><hr className="dropdown-divider"/></li>
            <li>
              <button className="dropdown-item text-danger" 
              onClick={() => {
                signOut({ callbackUrl: '/' });
              }}>
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}