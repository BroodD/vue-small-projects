import * as fb from 'firebase'

class User {
	constructor(id = '', login = '', name = '', image = '', bio = '') {
		this.id = id
		this.login = login
		this.name = name
		this.image = image
		this.bio = bio
	}
}

export default {
	state: {
		user: null,
		otherUser: null
	},
	mutations: {
		setUser(state, payload) {
			state.user = payload
		},
		setOtherUser(state, payload) {
			state.otherUser = payload
		}
	},
	actions: {
		async loginUser({ commit }, { email, password }) {
			commit('clearError')
			commit('setLoading', true)
			try {
				const user = await fb.auth().signInWithEmailAndPassword(email, password)
				const key = user.user.uid

				const fbVal = await fb.database().ref('users/' + key).once('value')
				const userInfo = fbVal.val()

				commit('setUser', new User(key, userInfo.login, userInfo.name, userInfo.image, userInfo.bio))
				commit('setLoading', false)
			} catch (error) {
				commit('setLoading', false)
				commit('setError', error.message)
				throw error
			}
		},
		async registerUser({ commit }, { email, password, login, name, image }) {
			commit('clearError')
			commit('setLoading', true)
			try {
				const user = await fb.auth().createUserWithEmailAndPassword(email, password)
				const key = user.user.uid
				let imageSrc
				let imageExt = image.name.slice(image.name.lastIndexOf('.') + 1)
				let fileData = await fb.storage().ref(`user/${key}.${imageExt}`).put(image)
					.then(snapshot => snapshot.ref.getDownloadURL())
					.then(url => imageSrc = url)
				await fb.database().ref('users/' + key).set({
					login,
					name,
					image: imageSrc,
				})
				
				commit('setUser', new User(key, login, name, imageSrc))
				commit('setLoading', false)
			} catch (error) {
				commit('setLoading', false)
				commit('setError', error.message)
				throw error
			}
		},
		async autoLoginUser({ commit }, payload) {
			const fbVal = await fb.database().ref('users/' + payload.uid).once('value')
			const userInfo = fbVal.val()
			commit('setUser', new User(payload.uid, userInfo.login, userInfo.name, userInfo.image, userInfo.bio))
		},
		async changeUserInfo({ commit, getters }, { login, name, image, bio }) {
			commit('clearError')
			commit('setLoading', true)

			var uid = getters.userId

			var imageSrc
			if(typeof image == 'object') {
				console.log('here')
				var imageExt = image.name.slice(image.name.lastIndexOf('.') + 1)
				var fileData = await fb.storage().ref(`user/${uid}.${imageExt}`).put(image)
					.then(snapshot => snapshot.ref.getDownloadURL())
					.then(url => imageSrc = url)
			} else {
				imageSrc = image
			}
			
			// some show id user where user.login == login
			var fbVal = await fb.database().ref("users").orderByChild("login").equalTo(login).once("value");
			var l = fbVal.val();
			var k = l == null ? null : Object.keys(l)[0];

			// if userId != user.id where login is this.login
			if ( (k != uid) && k ) {
				commit('setLoading', false)
				commit('setError', 'This username isn\'t available.Please try another.')
			} else {
				try {
					await fb.database().ref('users/' + uid).update({
						login,
						name,
						bio,
						image: imageSrc
					})
					commit('setUser', new User(uid, login, name, imageSrc, bio))
					commit('setLoading', false)
				} catch (error) {
					commit('setLoading', false)
					commit('setError', error.message)
					throw error
				}
			}
		},
		logoutUser({ commit }) {
			fb.auth().signOut()
			commit('setUser', null)
		},
		async otherUser({commit}, id) {
			const fbVal = await fb.database().ref('users/' + id).once('value')
			const userInfo = fbVal.val()
			commit('setOtherUser', new User(id, userInfo.login, userInfo.name, userInfo.image, userInfo.bio))
		}
	},
	getters: {
		user(state) {
			return state.user || new User()
		},
		isUserLoggedIn(state) {
			return state.user !== null
		},
		userId(state) {
			return (state.user !== null) ? state.user.id : null
			// return (state.user !== null) ? state.user.id : null
		},
		otherUser(state) {
			return state.otherUser || new User()
		}
	}
}
