import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()




// https://api.themoviedb.org/3/search/movie?api_key={api_key}&query=


const search = aysnc(query)=> {
	if(!query) return {};
	const results = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`)
	const json = await results.json()
	return json;
}




export {
	search
}