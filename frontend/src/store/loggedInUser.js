// This pinia store contains state with respect to whether a user is logged in
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { loginUser, logoutUser, setAuthHeader } from '../api/api' // import API calls
import jwt_decode from 'jwt-decode'; // import JSON Web Token decoder to decode the token into the user's information

//Notifications
const toast = useToast()

// F4: get the saved token from localStorage and decode it.
// Returns null if there's no token, it's expired, or it isn't a real JWT.
export function getSavedToken() {
  const token = localStorage.getItem('authToken')
  if (!token) return null

  try {
    const decoded = jwt_decode(token)
    // exp is in seconds, Date.now() is in milliseconds
    if (decoded.exp * 1000 < Date.now()) {
      return null
    }
    return { token, decoded }
  } catch (error) {
    // jwt_decode throws if the token is corrupted
    return null
  }
}

// Defining a store
export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',
  state: () => {
    return {
      name: "",
      role: "",
      isLoggedIn: false
    }
  },
  actions: {
    async login(username, password) {
      try {
        const token = await loginUser(username, password);
        // Get the user's name and role from the JWT token
        const decodedToken = jwt_decode(token);
        this.$patch({
          isLoggedIn: true,
          role: decodedToken.role,
          name: decodedToken.name
        });
        this.$router.push("/");
        toast.success("Login Successful!")

      } catch ( error ) {
        toast.error(error.message)
      }
    },
    // F4: runs once when the app starts (called in main.js).
    // If there's a good token saved, log the user back in so refreshing doesn't log them out.
    restoreSession() {
      const saved = getSavedToken()
      if (!saved) {
        // missing, expired or corrupted token, so make sure everything is cleared
        this.clearSession()
        return
      }
      setAuthHeader(saved.token)
      this.$patch({
        isLoggedIn: true,
        role: saved.decoded.role,
        name: saved.decoded.name
      });
    },
    // F4: clears the saved token, the auth header, and the store values
    clearSession() {
      logoutUser();
      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      });
    },
    logout() {
      this.clearSession()
      this.$router.push("/");
      toast.info("You have been logged out!")
    }
  },
});
