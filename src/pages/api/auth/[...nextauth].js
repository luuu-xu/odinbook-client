import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
// import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";

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
    })
    // ...add more providers here
  ],
  session: { 
    strategy: 'jwt' 
  },
  callbacks: {
    async jwt({ token, user }) {
      // console.log('jwt user', user);
      if (user) {
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
      // console.log('session', session);
      return session;
    }
  }
}

export default NextAuth(authOptions)