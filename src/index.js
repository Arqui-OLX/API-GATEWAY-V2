const {GraphQLServer} = require('graphql-yoga')
const axios = require('axios');
var jwt = require('jsonwebtoken');
const URL_LOGIN = `http://35.208.241.159:3001`;
const URL_LOCATIONS = `http://35.208.164.215:3000`;

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
            //const userEmail = getEmail(context)
            /*
            if(userEmail != false)
                console.log("Esta Autorizado")
            else
                console.log("No esta Autorizado")*/

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