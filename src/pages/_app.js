import '@/styles/globals.css';
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap/dist/js/bootstrap.bundle';
// import bootstrap from 'bootstrap'
import { SessionProvider } from 'next-auth/react';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps }
}) {
  // return <Component {...pageProps} />
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
