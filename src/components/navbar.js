import { signOut } from "next-auth/react";
import { useEffect } from "react";
import styles from '../styles/navbar.module.css';

export default function NavBar() {
  // Enable Bootstrap tooltips when NavBar is created
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }, []);

  return (
    <nav className="navbar navbar-expand-sm bg-white shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand text-primary fs-4" href="#"><strong>odinbook</strong></a>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-flex flex-row">
          <li className="nav-item">
            <a className="nav-link active" aria-current="page" href="#" 
              data-bs-toggle="tooltip" data-bs-title="Home" data-bs-placement="bottom"
            >
              <span className="material-symbols-outlined fs-2">
                home
              </span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/friends"
              data-bs-toggle="tooltip" data-bs-title="Firends" data-bs-placement="bottom"
            >
              <span className="material-symbols-outlined fs-2">
                group
              </span>
            </a>
          </li>
        </ul>
        <div className="dropdown"
          data-bs-toggle="tooltip" data-bs-title="Account" data-bs-placement="bottom"
        >
          <img className={`dropdown-toggle rounded-circle ${styles.userProfilePic}`} role="button" data-bs-toggle="dropdown" aria-expanded="false" src="https://scontent.fyto3-1.fna.fbcdn.net/v/t1.6435-1/40685331_1671740149601769_7083282385508237312_n.jpg?stp=cp0_dst-jpg_p80x80&_nc_cat=103&ccb=1-7&_nc_sid=7206a8&_nc_ohc=_iijVqPNV-kAX_u0S5D&_nc_ht=scontent.fyto3-1.fna&oh=00_AfAWS51l6ga3RErZUQWmQh1ob-bsJTUhI17JCjQvMe2xkw&oe=644D6DA9"/>
          <ul className="dropdown-menu dropdown-menu-start dropdown-menu-sm-end">
            <li><a className="dropdown-item" href="#">Profile</a></li>
            <li><a className="dropdown-item" href="#">Page</a></li>
            <li><hr className="dropdown-divider"/></li>
            <li>
              <button className="dropdown-item text-danger" onClick={() => {signOut()}}>Log out</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}