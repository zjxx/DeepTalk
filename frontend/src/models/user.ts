interface UserModel {
  username: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  token: string;
  expiration: string;
  userId: string;
}

const userModel: UserModel = {
  username: '',
  email: '',
  avatar: '',
  isLoggedIn: false,
  token: '',
  expiration: '',
  userId: ''
}

export default userModel
