const {GraphQLServer} = require('graphql-yoga')
const axios = require('axios');
var jwt = require('jsonwebtoken');
const URL_LOGIN = `http://35.208.241.159:3001`;
const URL_LOCATIONS = `http://35.208.164.215:3000`;
const URL_PROFILE = `http://35.208.164.215:3001`;
const URL_CHAT = `http://35.206.116.17:3001`;

const {APP_SECRET, getEmail} = require('./utils')

const resolvers = {
    Query: {
        exists: async (parent, email) => {
           
            let res = await axios.get(`${URL_LOGIN}/exists`, {
                data: email
            });
            console.log(res)
            if(res.data === true)
                return true;
            else
                return false;
        },
        //locations
        allLocations: async(parent, args, context) => {

            const userEmail = getEmail(context)
            
            if(userEmail != false) {
                let res = await axios.get(`${URL_LOCATIONS}/locations`);
                console.log(res.data)
                return res.data;    
            } else {
                throw new Error('Unauthorized');
            }
        },
        locationById: async(parent, args, context) => {

            const userEmail = getEmail(context)
            
            if(userEmail != false) {
                let res = await axios.get(`${URL_LOCATIONS}/locations/${args.location_id}`);
                console.log(res.data)
                return res.data;    
            } else {
                throw new Error('Unauthorized');
            }
        },
        //profile
        profileByID: async(parent, args, context) => {
            let res = await axios.get(`${URL_PROFILE}/profile/${args.profile_id}`);
            console.log(res.data)
            return res.data;
        },
        profileByEmail: async(parent, args, context) => {
            let res = await axios.get(`${URL_PROFILE}/profile/?email=${args.profile_email}`);
            console.log(res.data);
            return res.data;
        },
        //chat
        requestMyRooms: async(parent, args, context) => {
            let res = await axios.get(`${URL_CHAT}/${args.id}/room`);
            console.log(res.data);
            return res.data;
        },
        listMessages: async(parent, args, context) => {
            let res = await axios.get(`${URL_CHAT}/${args.id}`);
            console.log(res.data[0].messages);
            return res.data;
        }
    },

    Mutation: {
        login: async (parent, args) => {
            
            let res = await axios.post(`${URL_LOGIN}/login`, args);
            
            
			if(res.data === true) {
                var token = await jwt.sign({email: args.email}, APP_SECRET)
                var userId = await axios.get(`http://35.208.164.215:3001/profile/?email=${args.email}`)
                const respuesta = {
                    token: token,
                    userId: userId.data[0].id
                }
				return respuesta
			}
			else {
				throw new Error('Wrong credentials'); }
        },

        create: async (parent, args, context) => {

            const infoProfile = {
                nickname: '',
                email: args.email,
                phone: '',
            }

            let res = await axios.post(`${URL_LOGIN}/insert`, args);
            await axios.post('http://35.208.164.215:3001/profile', infoProfile);
            
            
			if(res.data === true) {
                var token = await jwt.sign({email: args.email}, APP_SECRET)
                var userId = await axios.get(`http://35.208.164.215:3001/profile/?email=${args.email}`)
                //console.log(userId.data[0].id)
                const respuesta = {
                    token: token,
                    userId: userId.data[0].id
                }
                return respuesta;
                //return token;
			}
			else {
				throw new Error('User already exists');; }
        },
        //location
        createLocation: async (parent, args, context) => {
            let res = await axios.post(`${URL_LOCATIONS}/locations`, args.location);
            console.log(res.data)
            return res.data;
        },

        deleteLocation: async (parent, args, context) => {
            let res = await axios.delete(`${URL_LOCATIONS}/locations/${args.id}`);
            console.log(res.data)
            return true;
        },

        updateLocation: async (parent, args, context) => {
            let res = await axios.put(`${URL_LOCATIONS}/locations/${args.id}`, args.location)
            console.log(res.data)
            return res.data;
        },
        //profile
        addFavToPost: async (parent, args, context) => {

            const favo = {
                fk_post: args.fav.fk_post
            }

            let res = await axios.post(`${URL_PROFILE}/favorite/${args.fav.id}`, favo)
            console.log(res.data)
            return true;
        },
        updateProfile: async (parent, args, context) => {

            let res = await axios.put(`${URL_PROFILE}/profile/${args.id}`, args.profile)
            //console.log(res)
            console.log(res.status)
            if(res.status === 200){
                return true;
            }
            else{
                return false;
            }  
        },
        deleteProfile: async (parent, args, context) => {
            let res = await axios.delete(`${URL_PROFILE}/profile/${args.id}`)
            console.log(res.data)
            return true;
        },
        //chat
        createRoom: async (parent, args, context) => {
            let res = await axios.post(`${URL_CHAT}/room`, args)
            console.log(res.data)
            return true;
        }
    },
}

const server = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: request => {
        return {
            ...request,
    }
  },
})

server.start(()=> console.log(`listening on port 4000`))