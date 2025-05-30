interface UserModel {
  username: string
  email: string
  avatar: string
  isLoggedIn: boolean
  token: string
}

const userModel: UserModel = {
  username: '',
  email: '',
  avatar: '',
  isLoggedIn: false,
  token: '',
}

export default userModel
