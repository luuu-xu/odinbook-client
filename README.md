Live: https://odinbook-client-production-9219.up.railway.app

# odinbook-client
- This is a full-stack Facebook-clone website created with MERN stack and NextJS. 
- The REST API used by this app is [odinbook-api](https://github.com/luuu-xu/odinbook-api).

## Getting Started
To get started with the website, follow these steps:

1. Clone the repository to your local machine.
2. Run npm install to install the project dependencies.
3. Rename .env.local.example file to .env.local and fill in the necessary environment variables.
4. Run npm run dev to start the development server.
5. Open http://localhost:3000 in your web browser to view the website.

## Features
The website includes the following features:

- Authentication for users of credentials.
- Visits the website as a visitor.
- Logs in with Facebook authentication.
- View posts from user and friends in a feed manner.
- Make a post with or without an image.
- View and make comments.
- Like a post.
- Change name and profile picture url on profile.
- Responsive design supported by Bootstrap.

## Dependencies
The following dependencies are used in this project:

- next: Framework for server-rendered React applications.
- react: JavaScript library for building user interfaces.
- react-dom: Entry point to the DOM and server renderer for React.
- bootstrap: Responsive design supported.
- luxon: DateTime helper.

## Pages
The website includes the following pages:

- /: The homepage, which displays authentication forms.
- /: The homepage including a feed, after authentication.
- /friends: Displays a list of users including user's friends and friend requests.
- /posts: Displays a list of all posts from all users.
- /profile: Displays the profile page of the user and also a feed from user's posts.

## Screenshots
### IndexPage
<img width="1459" alt="Screenshot 2023-04-10 at 19 34 57" src="https://user-images.githubusercontent.com/97932191/231019206-bbd29518-11ad-40b6-9bb1-a08ce927b7d5.png">

### HomePage
<img width="1460" alt="Screenshot 2023-04-10 at 19 35 33" src="https://user-images.githubusercontent.com/97932191/231019232-f99274a2-1f71-44a8-8427-5144e9eb3ae4.png">

### UserPage
<img width="1460" alt="Screenshot 2023-04-10 at 19 36 19" src="https://user-images.githubusercontent.com/97932191/231019261-43e9041b-eac7-407a-aaf2-3bfddaccb416.png">

## API Endpoints
The website uses the API endpoints from [odinbook-api](https://github.com/luuu-xu/odinbook-api).

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
