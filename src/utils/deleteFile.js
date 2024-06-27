const fs =require('fs');

async function deleteFile(link){
    const isExistPath = fs.existsSync(link);
    if(isExistPath){
        setTimeout(async()=>{
            try {
                await fs.unlinkSync(link);
                console.log(`File ${link} has been deleted.`);
              } catch (err) {
                console.error(err);
              }
        },60000);
    }
}

module.exports={deleteFile}