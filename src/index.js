const {GraphQLServer} = require('graphql-yoga')
const axios = require('axios');
var jwt = require('jsonwebtoken');
const URL_LOGIN = `http://35.208.241.159:3001`;
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
        }
    },

    Mutation: {
        login: async (parent, args) => {
            
            let res = await axios.post(`${URL_LOGIN}/login`, args);
            
            
			if(res.data === true) {
                var token = await jwt.sign({email: args.email}, APP_SECRET)
				return token
			}
			else {
				return false; }
        },

        create: async (parent, args, context) => {
            //const userEmail = getEmail(context)
            /*
            if(userEmail != false)
                console.log("Esta Autorizado")
            else
                console.log("No esta Autorizado")*/

            let res = await axios.post(`${URL_LOGIN}/insert`, args);
            
            
			if(res.data === true) {
                var token = await jwt.sign({email: args.email}, APP_SECRET)
				return token
			}
			else {
				return false; }
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