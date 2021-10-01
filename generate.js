import fetch from 'node-fetch';
import fs from 'fs';
import shelljs from 'shelljs'
const {exec} = shelljs


const PATH_DOWNLOADS = './downloads';
const PATH_FFMPEG = 'D:/ffmpeg/ffmpeg.exe';
const PATH_FFPROBE = 'D:/ffmpeg/ffprobe.exe';

let fileList = [];
let subtitleIterator =0;


let motherScript='';
let subtitleExtractorScript = '';
let videoConverterScript = '';


const generateCurlScript = async (uploadCredentials, filePath) => {
	const script = `curl -F "hash=${uploadCredentials.hash}" \ -F "time_hash=${uploadCredentials.time_hash}" \ -F "userid=${uploadCredentials.userid}" \ -F "key_hash=${uploadCredentials.key_hash}" \ -F "userid=${uploadCredentials.userid}" \ -F "upload=1" \ -F "Filedata=@${filePath}" \ ${uploadCredentials.upload_server}`;
	// console.log(script)
	motherScript += script + "\n";
}



const getUploadCredentials = async () => {

	const results = await fetch('https://netu.tv/api/file/upload_server?key=da2a3ae55792b656d3b70e8fcddce0fb')
        const json = await results.json()
	return json;
}


// (async()=>{
// 	let i=0;

// 	let interval = setInterval(async()=>{
// 		++i;
// 		if(i===fileList.length){
// 			 clearInterval(interval);
// 			 fs.writeFile('execute.bat', motherScript, err=>{
// 			 	if(err) throw err;
// 			 })
// 		}

// 		console.log(i, "\t", fileList[i])
// 		const {result} = await getUploadCredentials();
// 		console.log('uploadCredentials', result);
// 		await generateCurlScript(result, fileList[i]);

// 	}, 500)
// })();






const gofileGetServer = async ( ) => {
	const server = await fetch('https://api.gofile.io/getServer')
	const json = await server.json()
	// {
	//   "status": "ok",
	//   "data": {
	//     "server": "store9"
	//   }
	// }
	return json?.data?.server;
}

const gofileUploadToServer = async(server, filePath) => {
	if(!server ||  !filePath) {console.error('[gofile] - no server / filePath provided'); console.log(`\n[server]: ${server}\t[filePath]: ${filePath}\n`); return;}
	const script = `curl -F "token=JbLXvhf7KLx4J5opTeofRSOjGm5cku4Z" -F "file=@${filePath}" https://${server}.gofile.io/uploadFile`;
	// execute script
	console.log(`[executing]: ${script}`)
	exec(script, function(code, stdout, stderr) {
		// {
		//   "status": "ok",
		//   "data": {
		//     "downloadPage": "https://gofile.io/d/WCzEkL",
		//     "code": "WCzEkL",
		//     "parentFolder": "82dc749d-857e-4c74-b808-5a9f6be20199",
		//     "fileId": "f42a6e72-6d13-466b-9965-540578ff96eb",
		//     "fileName": "someFile.txt",
		//     "md5": "d41d8cd98f00b204e9800998ecf8427e",
		//     "directLink": "https://store9.gofile.io/download/f42a6e72-6d13-466b-9965-540578ff96eb/someFile.txt",
		//     "info": "Direct links only work if your account is a donor account. Standard accounts will have their links redirected to the download page."
		//   }
		// }
		  console.log('Exit code:', code);
		  console.log('Program output:', stdout, "\n");
		  console.log('Program stderr:', stderr);
		  const json = JSON.parse(stdout);
		  if(json?.status == 'ok'){
		  	console.log('[gofile] continue!');
		  }
	})
}


const gofile = {
	getServer: gofileGetServer,
	upload: gofileUploadToServer
}



// let i = 0;
// const gofileInterval = setInterval(async()=>{
// 	if(!fileList[i]){
// 		clearInterval(gofileInterval);
// 		return;
// 	}

// 	const server = await gofile.getServer();
// 	const upload = await gofile.upload(server, fileList[i]);
// 	++i;
// }, 500)
// const server = await gofile.getServer()
// const upload = await gofile.upload(server, fileList[0]);



const generateConvertScripts = (filePath) => {
	// -movflags +faststart -acodec aac
	const outputFilePath = filePath.replace('.mkv', '.mp4');
	const script = `${PATH_FFMPEG} -i ${filePath} -movflags +faststart -acodec aac ${outputFilePath}\n rm ${filePath}\n`
	

	videoConverterScript += script;
	fs.writeFileSync('videoConvert.sh', videoConverterScript);


}


const extractSubtitles = (videoPath) => {
	console.log('[extractSubtitles] ', videoPath)
	if(!videoPath) {console.error('[ffmpeg]: no videoPath provided'); return;}
	// detect subtitles
	let output ='';
	const script = `${PATH_FFPROBE} -v quiet -print_format json -show_format -show_streams -i ${videoPath}`;
	console.log('[extractSubtitles script]: ', script)
	exec(script, (code, stdout, stderr)=>{

		  if(stderr) console.log('Program stderr subtitle:', stderr);
		  output += stdout;
		  if(code === 0){

		  	output = JSON.parse(output);
		  	let firstSubtitleIndex;
			output?.streams?.forEach(stream => {

				if(stream?.codec_type === 'subtitle'){
					console.log(stream?.index, stream?.tags?.language)
					if(firstSubtitleIndex === undefined) firstSubtitleIndex = stream?.index; 
					const subtitleFileName = `${videoPath.replace('.mkv', '')}-custom-${stream?.tags?.language}-${stream?.index}.srt`;
					console.log('[videoPathOnlyStr]', subtitleFileName)



					// extract subtitles 
					const script = `${PATH_FFMPEG} -y -i ${videoPath} -map 0:s:${stream?.index - firstSubtitleIndex} ${subtitleFileName}`;
					subtitleExtractorScript += `${script}\n`;
					if(!fileList[subtitleIterator+1]){
						fs.writeFileSync('extractSubtitles.sh', subtitleExtractorScript);
						// console.log(subtitleExtractorScript)
						// exec(`echo "${subtitleExtractorScript}" > extractSubtitles.sh`, (code, stdout, stderr)=>{
						// 	if(stderr){console.error(stderr)}
						// 		if(code === 0){
						// 			console.log('file extractor generated successfully');
						// 		}
						// })



						// EXTRACT SUBTITLES
						// exec('./extractSubtitles.sh', (code, stdout, stderr)=>{
						// 	if(stderr){console.error(stderr)};
						// 	if(code === 0){
						// 		console.log('[subtitles_extraction]: Finished successfully')
						// 	}
						// })
						generateConvertScripts(videoPath);
					}
					// exec(script, (code, stdout, stderr)=>{
					// 	if(stderr) { console.error('[subtitle_extraction]: error; ', stderr);return;}
					// 	if(code === 0){
					// 		console.log('[subtitle_extraction]: successful')
					// 	}
					// })


				}

			})	
		  }
	}) && extractSubtitles(fileList[++subtitleIterator])
}

const detectMkvFiles = (path) => {
	let fl='';
	const script = `find ${path} | grep .mkv`
	console.log('[detecting mkv files]:', 'ok');
	exec(script, (code, stdout, stderr)=>{
		  // console.log('Exit code:', code);
		  // console.log('Program output:', stdout, "\n");
		  if(stderr) console.log('Program stderr:', stderr);
		  fl+=stdout;
		  if(code === 0){
			fileList = fl.split("\n")
			console.log('MKV files detected: ', fileList.length);

			// extractSubtitles(fileList[14])
			// fileList.forEach(file=>{
			// 	extractSubtitles(file);
			// })

			// let i=0;
			// extractSubtitles(fileList[i]);
			// const interval = setInterval(()=>{
			// 	if(!fileList[i]){clearInterval(interval); return;}
			// 	extractSubtitles(fileList[++i])
			// }, 60000)

			extractSubtitles(fileList[subtitleIterator])
		  }
	})
}


detectMkvFiles(PATH_DOWNLOADS);