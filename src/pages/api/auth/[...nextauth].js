import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        const res = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        // If no error and we have user data, return it
        if (res.ok && data.user) {
          console.log('data.token', data.token);
          console.log('data.user', data.user);
          return data;
        }
        // Return null if user data could not be retrived
        return null
      }
    }),
    FacebookProvider({
      name: "facebook",
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  session: { 
    strategy: 'jwt' 
  },
  callbacks: {
    async signIn({ user, account }) {
      // Facebook login where finding an existing account or creating a new account
      // in the database with the provided name, username and profile_pic_url
      if (account.provider === 'facebook') {
        console.log('signIn ran once');
        console.log('user signIn', user);
        const credentials = {
          name: user.name,
          username: user.email,
          profile_pic_url: user.image
        };
        const res = await fetch('http://localhost:8080/api/auth/oauth-login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        console.log('data', data);
        user.id = data.user._id;
        user.token = data.token;
        return true;
      } else if (account.provider === 'credentials') {
        return true;
      }
    },
    async jwt({ token, user, account }) {
      console.log('token jwt', token);
      console.log('user jwt', user);
      console.log('account jwt', account);
      if (account?.provider === 'facebook') {
        token.accessToken = user.token;
        token.userId = user.id;
        token.userName = user.name;
        token.userEmail = user.email;
        token.userImage = user.image;
      } else if (account?.provider === 'credentials') {
        token.accessToken = user.token;
        token.userId = user.user._id;
        token.userName = user.user.name;
        token.userEmail = user.user.username;
        token.userImage = user.user.profile_pic_url;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.userId = token.userId;
      session.user.name = token.userName;
      session.user.email = token.userEmail;
      session.user.image = token.userImage;
      console.log('session session', session);
      return session;
    }
  },
  debug: true,
}

export default NextAuth(authOptions)