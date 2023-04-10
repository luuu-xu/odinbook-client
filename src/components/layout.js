import Footer from "./footer";
import NavBar from "./navbar";

export default function Layout({ children }) {
  return (
    <div className="bg-light mh-100">
      <NavBar />
      <main className="mb-4">{children}</main>
      <Footer />
    </div>
  );
}