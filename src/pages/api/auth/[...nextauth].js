import NextAuth from "next-auth";
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
          console.log(data.user);
          return data.user;
        }
        // Return null if user data could not be retrived
        return null
      }
    })
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, token, user }) {
      // session.accessToken = token;
      return session;
    }
  }
}

export default NextAuth(authOptions)