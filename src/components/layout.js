import NavBar from "./navbar";

export default function Layout({ children }) {
  return (
    <div className="bg-light vh-100">
      <NavBar />
      <main>{children}</main>
      <div>Footer to be added...</div>
    </div>
  );
}