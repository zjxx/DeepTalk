interface UserModel {
  username: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  token: string;
  expiration: string;
}

const userModel: UserModel = {
  username: '',
  email: '',
  avatar: '',
  isLoggedIn: false,
  token: '',
  expiration: ''
}

export default userModel 